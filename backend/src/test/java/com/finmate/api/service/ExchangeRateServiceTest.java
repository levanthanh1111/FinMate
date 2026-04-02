package com.finmate.api.service;

import com.finmate.api.model.ExchangeRate;
import com.finmate.api.model.ExchangeRateEntry;
import com.finmate.api.repository.ExchangeRateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExchangeRateServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private ExchangeRateRepository exchangeRateRepository;

    private CacheManager cacheManager;

    @InjectMocks
    private ExchangeRateService exchangeRateService;

    @BeforeEach
    void setup() {
        cacheManager = new ConcurrentMapCacheManager("exchangeRates", "pairRates");
        exchangeRateService = new ExchangeRateService(restTemplate, exchangeRateRepository, cacheManager);
        ReflectionTestUtils.setField(exchangeRateService, "apiUrl", "https://example.local/rates");
        ReflectionTestUtils.setField(exchangeRateService, "accessKey", "test-key");
        ReflectionTestUtils.setField(exchangeRateService, "symbols", "USD,VND");
        ReflectionTestUtils.setField(exchangeRateService, "refreshEnabled", true);
    }

    @Test
    void getExchangeRate_sameCurrency_returnsOne() {
        assertEquals(1.0, exchangeRateService.getExchangeRate("USD", "USD"));
    }

    @Test
    void getRates_fromLocal_includesMetadata() {
        ExchangeRate rate = buildLocalRate();
        when(exchangeRateRepository.findFirstByBaseOrderByCreatedAtDesc("EUR"))
                .thenReturn(Optional.of(rate));

        Map<String, Object> result = exchangeRateService.getRates(false);

        assertTrue((Boolean) result.get("success"));
        assertEquals("local", result.get("source"));
        assertEquals(false, result.get("stale"));
        assertNotNull(result.get("updatedAt"));
        assertEquals("EUR", result.get("base"));
    }

    @Test
    void getRates_whenNoLocalAndExternalFails_returnsDefaultMetadata() {
        when(exchangeRateRepository.findFirstByBaseOrderByCreatedAtDesc("EUR"))
                .thenReturn(Optional.empty());
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenThrow(new RuntimeException("external api down"));

        Map<String, Object> result = exchangeRateService.getRates(false);

        assertTrue((Boolean) result.get("success"));
        assertEquals("default", result.get("source"));
        assertTrue((Boolean) result.get("stale"));
        assertNotNull(result.get("updatedAt"));
    }

    @Test
    void convertBatch_returnsConvertedValuesAndMetadata() {
        ExchangeRate rate = buildLocalRate();
        when(exchangeRateRepository.findFirstByBaseOrderByCreatedAtDesc("EUR"))
                .thenReturn(Optional.of(rate));

        Map<String, Object> result = exchangeRateService.convertBatch(
                "VND",
                "USD",
                List.of(new BigDecimal("100000"), new BigDecimal("200000"))
        );

        assertTrue((Boolean) result.get("success"));
        assertEquals("VND", result.get("from"));
        assertEquals("USD", result.get("to"));
        assertEquals("local", result.get("source"));
        assertFalse((Boolean) result.get("stale"));
        assertNotNull(result.get("updatedAt"));

        @SuppressWarnings("unchecked")
        List<BigDecimal> converted = (List<BigDecimal>) result.get("convertedAmounts");
        assertEquals(2, converted.size());
    }

    @Test
    void backgroundRefresh_disabled_doesNotCallExternalApi() {
        ReflectionTestUtils.setField(exchangeRateService, "refreshEnabled", false);

        exchangeRateService.refreshRatesInBackground();

        verify(restTemplate, never()).getForObject(anyString(), eq(Map.class));
    }

    private ExchangeRate buildLocalRate() {
        ExchangeRate rate = new ExchangeRate();
        rate.setBase("EUR");
        rate.setDate(LocalDate.now());
        rate.setTimestamp(System.currentTimeMillis() / 1000L);
        rate.setCreatedAt(LocalDateTime.now().minusMinutes(10));

        ExchangeRateEntry usd = new ExchangeRateEntry();
        usd.setExchangeRate(rate);
        usd.setCurrency("USD");
        usd.setRate(new BigDecimal("1.20"));

        ExchangeRateEntry vnd = new ExchangeRateEntry();
        vnd.setExchangeRate(rate);
        vnd.setCurrency("VND");
        vnd.setRate(new BigDecimal("30000"));

        rate.getEntries().add(usd);
        rate.getEntries().add(vnd);
        return rate;
    }
}
