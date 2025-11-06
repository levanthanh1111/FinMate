package com.finmate.api.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

public class ExchangeRateServiceTest {

    @InjectMocks
    private ExchangeRateService exchangeRateService;

    @Mock
    private RestTemplate restTemplate;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetExchangeRate_Success() {
        // Arrange
        String base = "USD";
        String target = "VND";
        Double expectedRate = 24000.0;

        Map<String, Object> mockResponse = new HashMap<>();
        Map<String, Double> rates = new HashMap<>();
        rates.put(target, expectedRate);
        mockResponse.put("rates", rates);

        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenReturn(mockResponse);

        // Act
        Double actualRate = exchangeRateService.getExchangeRate(base, target);

        // Assert
        assertNotNull(actualRate);
        assertEquals(expectedRate, actualRate);
    }

    @Test
    public void testGetExchangeRate_ApiFailure_ReturnsDefaultRate() {
        // Arrange
        String base = "USD";
        String target = "VND";
        
        // Simulate API failure
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenThrow(new RuntimeException("API Error"));

        // Act
        Double actualRate = exchangeRateService.getExchangeRate(base, target);

        // Assert
        assertNotNull(actualRate);
        // Should return default rate for VND
        assertEquals(24000.0, actualRate);
    }

    @Test
    public void testGetExchangeRate_SameCurrency_ReturnsOne() {
        // Arrange
        String currency = "USD";

        // Act
        Double actualRate = exchangeRateService.getExchangeRate(currency, currency);

        // Assert
        assertNotNull(actualRate);
        assertEquals(1.0, actualRate);
    }

    @Test
    public void testGetExchangeRate_UnknownCurrency_FallsBackToDefault() {
        // Arrange
        String base = "USD";
        String target = "XYZ"; // Unknown currency

        // Act
        Double actualRate = exchangeRateService.getExchangeRate(base, target);

        // Assert
        assertNotNull(actualRate);
        // Should return default fallback rate
        assertEquals(1.0, actualRate);
    }
}