package com.finmate.api.service;

import com.finmate.api.model.ExchangeRate;
import com.finmate.api.model.ExchangeRateEntry;
import com.finmate.api.repository.ExchangeRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExchangeRateService {

    @Value("${exchange-rate.api-url:https://api.exchangeratesapi.io/v1/latest}")
    private String apiUrl;
    @Value("${exchange-rate.access-key}")
    private String accessKey;
    @Value("${exchange-rate.symbols:USD,VND,JPY,KRW,HKD,CNY}")
    private String symbols;
    @Value("${exchange-rate.refresh.enabled:true}")
    private boolean refreshEnabled;

    private static final String BASE_EUR = "EUR";

    private final RestTemplate restTemplate;
    private final ExchangeRateRepository exchangeRateRepository;
    private final CacheManager cacheManager;

    private volatile String lastRateSource = "default";
    private volatile LocalDateTime lastUpdatedAt;

    /**
     * Fetch latest rates from external API, save to local DB, and return response.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> fetchAndSaveRates() {
        String url = apiUrl + "?access_key=" + accessKey + "&symbols=" + symbols + "&format=1";
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response == null || !Boolean.TRUE.equals(response.get("success"))) {
            throw new RuntimeException("Failed to fetch exchange rates from external API");
        }

        ExchangeRate exchangeRate = new ExchangeRate();
        String responseBase = (String) response.getOrDefault("base", BASE_EUR);
        exchangeRate.setBase(responseBase);
        exchangeRate.setTimestamp(((Number) response.get("timestamp")).longValue());
        LocalDate rateDate;
        if (response.get("date") != null) {
            rateDate = LocalDate.parse((String) response.get("date"), DateTimeFormatter.ISO_LOCAL_DATE);
        } else {
            rateDate = LocalDate.now();
        }
        exchangeRate.setDate(rateDate);

        if (exchangeRateRepository.existsByBaseAndDate(responseBase, rateDate)) {
            Optional<ExchangeRate> existing = exchangeRateRepository.findFirstByBaseAndDateOrderByCreatedAtDesc(responseBase, rateDate);
            if (existing.isPresent()) {
                updateLastFetchMetadata("external", existing.get().getCreatedAt());
                return toResponseMap(existing.get(), "local", false);
            }
        }

        Map<String, Object> ratesMap = (Map<String, Object>) response.get("rates");
        if (ratesMap != null) {
            for (Map.Entry<String, Object> entry : ratesMap.entrySet()) {
                ExchangeRateEntry rateEntry = new ExchangeRateEntry();
                rateEntry.setExchangeRate(exchangeRate);
                rateEntry.setCurrency(entry.getKey());
                rateEntry.setRate(BigDecimal.valueOf(((Number) entry.getValue()).doubleValue()));
                exchangeRate.getEntries().add(rateEntry);
            }
        }

        ExchangeRate saved = exchangeRateRepository.save(exchangeRate);
        updateLastFetchMetadata("external", saved.getCreatedAt());
        evictRateCaches();
        return toResponseMap(saved, "external", false);
    }

    /**
     * Get latest rates from local DB. Returns same format as external API.
     */
    public Optional<Map<String, Object>> getLatestRatesFromLocal(String base) {
        String normalizedBase = base == null ? BASE_EUR : base.toUpperCase();
        return exchangeRateRepository.findFirstByBaseOrderByCreatedAtDesc(normalizedBase)
                .map(er -> {
                    updateLastFetchMetadata("local", er.getCreatedAt());
                    return toResponseMap(er, "local", false);
                });
    }

    /**
     * Get rates from local DB for a specific date.
     */
    public Optional<Map<String, Object>> getRatesFromLocalByDate(String base, LocalDate date) {
        String normalizedBase = base == null ? BASE_EUR : base.toUpperCase();
        return exchangeRateRepository.findFirstByBaseAndDateOrderByCreatedAtDesc(normalizedBase, date)
                .map(er -> {
                    updateLastFetchMetadata("local", er.getCreatedAt());
                    return toResponseMap(er, "local", false);
                });
    }

    /**
     * Get rates: try local first, else fetch from API and save.
     */
    public Map<String, Object> getRates(boolean fetchFromApi) {
        if (fetchFromApi) {
            return fetchAndSaveRates();
        }
        return getLatestRatesFromLocal(BASE_EUR).orElseGet(() -> {
            try {
                return fetchAndSaveRates();
            } catch (Exception ex) {
                return getDefaultRatesResponse();
            }
        });
    }

    private Map<String, Object> toResponseMap(ExchangeRate er, String source, boolean stale) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("timestamp", er.getTimestamp());
        result.put("base", er.getBase());
        result.put("date", er.getDate().toString());
        result.put("source", source);
        result.put("stale", stale);
        result.put("updatedAt", er.getCreatedAt() != null ? er.getCreatedAt().toString() : LocalDateTime.now().toString());
        Map<String, Double> rates = new HashMap<>();
        for (ExchangeRateEntry entry : er.getEntries()) {
            rates.put(entry.getCurrency(), entry.getRate().doubleValue());
        }
        result.put("rates", rates);
        return result;
    }

    /**
     * Get single exchange rate (base to target). Uses local DB (EUR-based) first, falls back to API.
     * Converts: rate(base->target) = rate(EUR->target) / rate(EUR->base)
     */
    public Double getExchangeRate(String base, String target) {
        String normalizedBase = base.toUpperCase();
        String normalizedTarget = target.toUpperCase();

        if (normalizedBase.equals(normalizedTarget)) {
            return 1.0;
        }
        Optional<Map<String, Object>> local = getLatestRatesFromLocal(BASE_EUR);
        if (local.isEmpty()) {
            try {
                fetchAndSaveRates();
                local = getLatestRatesFromLocal(BASE_EUR);
            } catch (Exception ignored) {
                return 1.0;
            }
        }
        if (local.isPresent()) {
            @SuppressWarnings("unchecked")
            Map<String, Double> rates = (Map<String, Double>) local.get().get("rates");
            if (rates != null) {
                Double baseRate = normalizedBase.equals(BASE_EUR) ? 1.0 : rates.get(normalizedBase);
                Double targetRate = normalizedTarget.equals(BASE_EUR) ? 1.0 : rates.get(normalizedTarget);
                if (baseRate != null && baseRate != 0 && targetRate != null) {
                    return targetRate / baseRate;
                }
            }
        }
        return 1.0;
    }

    @Cacheable(cacheNames = "exchangeRates", key = "'latest:' + #fetchFromApi")
    public Map<String, Object> getRatesCached(boolean fetchFromApi) {
        return getRates(fetchFromApi);
    }

    @Cacheable(cacheNames = "pairRates", key = "#base.toUpperCase() + ':' + #target.toUpperCase()")
    public BigDecimal getExchangeRateDecimal(String base, String target) {
        return BigDecimal.valueOf(getExchangeRate(base, target)).setScale(8, RoundingMode.HALF_UP);
    }

    public Map<String, Object> convertBatch(String from, String to, List<BigDecimal> amounts) {
        String normalizedFrom = from.toUpperCase();
        String normalizedTo = to.toUpperCase();
        BigDecimal rate = getExchangeRateDecimal(normalizedFrom, normalizedTo);

        List<BigDecimal> converted = new ArrayList<>();
        for (BigDecimal amount : amounts) {
            BigDecimal safeAmount = amount == null ? BigDecimal.ZERO : amount;
            converted.add(safeAmount.multiply(rate).setScale(6, RoundingMode.HALF_UP));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("from", normalizedFrom);
        result.put("to", normalizedTo);
        result.put("rate", rate);
        result.put("amounts", amounts);
        result.put("convertedAmounts", converted);
        result.put("source", lastRateSource);
        result.put("stale", "default".equals(lastRateSource));
        result.put("updatedAt", lastUpdatedAt != null ? lastUpdatedAt.toString() : null);
        return result;
    }

    @Scheduled(fixedDelayString = "${exchange-rate.refresh-ms:43200000}")
    public void refreshRatesInBackground() {
        if (!refreshEnabled) {
            return;
        }

        try {
            fetchAndSaveRates();
        } catch (Exception ex) {
            System.err.println("Background exchange-rate refresh failed: " + ex.getMessage());
        }
    }

    public Map<String, Object> getRateStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("source", lastRateSource);
        status.put("stale", "default".equals(lastRateSource));
        status.put("updatedAt", lastUpdatedAt != null ? lastUpdatedAt.toString() : null);
        status.put("refreshEnabled", refreshEnabled);
        return status;
    }

    private void updateLastFetchMetadata(String source, LocalDateTime updatedAt) {
        this.lastRateSource = source;
        this.lastUpdatedAt = updatedAt != null ? updatedAt : LocalDateTime.now();
    }

    private void evictRateCaches() {
        Cache exchangeRatesCache = cacheManager.getCache("exchangeRates");
        if (exchangeRatesCache != null) {
            exchangeRatesCache.clear();
        }
        Cache pairRatesCache = cacheManager.getCache("pairRates");
        if (pairRatesCache != null) {
            pairRatesCache.clear();
        }
    }

    private Map<String, Object> getDefaultRatesResponse() {
        Map<String, Object> rates = new HashMap<>();
        rates.put("USD", 1.15);
        rates.put("VND", 30258.0);
        rates.put("JPY", 183.37);
        rates.put("KRW", 1714.4);
        rates.put("HKD", 9.01);
        rates.put("CNY", 7.91);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("timestamp", System.currentTimeMillis() / 1000L);
        response.put("base", BASE_EUR);
        response.put("date", LocalDate.now().toString());
        response.put("rates", rates);
        response.put("source", "default");
        response.put("stale", true);
        response.put("updatedAt", LocalDateTime.now().toString());

        updateLastFetchMetadata("default", LocalDateTime.now());
        return response;
    }
}
