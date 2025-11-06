package com.finmate.api.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;
import java.util.HashMap;

@Service
public class ExchangeRateService {

    private final RestTemplate restTemplate;
    private final String apiUrl = "https://api.exchangerate.host/latest";
    
    // Default exchange rates in case API fails
    private final Map<String, Double> DEFAULT_RATES = Map.of(
        "VND", 24000.0, // Approximate VND to USD rate
        "USD", 1.0
    );

    public ExchangeRateService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Get exchange rate from base currency to target currency
     * Cached for 1 hour to reduce API calls
     */
    @Cacheable(value = "exchangeRates", key = "#base + '-' + #target", cacheManager = "cacheManager")
    public Double getExchangeRate(String base, String target) {
        try {
            String url = apiUrl + "?base=" + base + "&symbols=" + target;
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.containsKey("rates")) {
                Map<String, Double> rates = (Map<String, Double>) response.get("rates");
                if (rates.containsKey(target)) {
                    return rates.get(target);
                }
            }
            
            // If API call fails or doesn't return expected format, use default rates
            return getDefaultRate(base, target);
        } catch (Exception e) {
            return getDefaultRate(base, target);
        }
    }
    
    /**
     * Get default exchange rate when API fails
     */
    private Double getDefaultRate(String base, String target) {
        if (base.equals(target)) {
            return 1.0;
        }
        
        if (base.equals("USD") && DEFAULT_RATES.containsKey(target)) {
            return DEFAULT_RATES.get(target);
        }
        
        if (target.equals("USD") && DEFAULT_RATES.containsKey(base)) {
            return 1.0 / DEFAULT_RATES.get(base);
        }
        
        // Convert via USD
        if (DEFAULT_RATES.containsKey(base) && DEFAULT_RATES.containsKey(target)) {
            double baseToUsd = 1.0 / DEFAULT_RATES.get(base);
            double usdToTarget = DEFAULT_RATES.get(target);
            return baseToUsd * usdToTarget;
        }
        
        // Default fallback
        return 1.0;
    }
}