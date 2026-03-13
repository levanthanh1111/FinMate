package com.finmate.api.service;

import com.finmate.api.model.ExchangeRate;
import com.finmate.api.model.ExchangeRateEntry;
import com.finmate.api.repository.ExchangeRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
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

    private final RestTemplate restTemplate = new RestTemplate();
    private final ExchangeRateRepository exchangeRateRepository;

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
        exchangeRate.setBase((String) response.get("base"));
        exchangeRate.setTimestamp(((Number) response.get("timestamp")).longValue());
        if (response.get("date") != null) {
            exchangeRate.setDate(LocalDate.parse((String) response.get("date"), DateTimeFormatter.ISO_LOCAL_DATE));
        } else {
            exchangeRate.setDate(LocalDate.now());
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

        exchangeRateRepository.save(exchangeRate);
        return response;
    }

    /**
     * Get latest rates from local DB. Returns same format as external API.
     */
    public Optional<Map<String, Object>> getLatestRatesFromLocal(String base) {
        return exchangeRateRepository.findFirstByBaseOrderByCreatedAtDesc(base == null ? "EUR" : base)
                .map(this::toResponseMap);
    }

    /**
     * Get rates from local DB for a specific date.
     */
    public Optional<Map<String, Object>> getRatesFromLocalByDate(String base, LocalDate date) {
        return exchangeRateRepository.findFirstByBaseAndDateOrderByCreatedAtDesc(base == null ? "EUR" : base, date)
                .map(this::toResponseMap);
    }

    /**
     * Get rates: try local first, else fetch from API and save.
     */
    public Map<String, Object> getRates(boolean fetchFromApi) {
        if (fetchFromApi) {
            return fetchAndSaveRates();
        }
        return getLatestRatesFromLocal("EUR")
                .orElseGet(this::fetchAndSaveRates);
    }

    private Map<String, Object> toResponseMap(ExchangeRate er) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("timestamp", er.getTimestamp());
        result.put("base", er.getBase());
        result.put("date", er.getDate().toString());
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
        if (base.equals(target)) {
            return 1.0;
        }
        Optional<Map<String, Object>> local = getLatestRatesFromLocal("EUR");
        if (local.isEmpty()) {
            fetchAndSaveRates();
            local = getLatestRatesFromLocal("EUR");
        }
        if (local.isPresent()) {
            @SuppressWarnings("unchecked")
            Map<String, Double> rates = (Map<String, Double>) local.get().get("rates");
            if (rates != null) {
                Double baseRate = base.equals("EUR") ? 1.0 : rates.get(base);
                Double targetRate = target.equals("EUR") ? 1.0 : rates.get(target);
                if (baseRate != null && baseRate != 0 && targetRate != null) {
                    return targetRate / baseRate;
                }
            }
        }
        return 1.0;
    }
}
