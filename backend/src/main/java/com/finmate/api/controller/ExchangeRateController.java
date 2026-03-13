package com.finmate.api.controller;

import com.finmate.api.service.ExchangeRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/exchange-rate")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ExchangeRateController {

    private final ExchangeRateService exchangeRateService;

    /**
     * Get exchange rate between two currencies (uses local DB, fetches from API if empty).
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getExchangeRate(
            @RequestParam(defaultValue = "USD") String base,
            @RequestParam(defaultValue = "VND") String target) {
        try {
            Double rate = exchangeRateService.getExchangeRate(base, target);
            Map<String, Object> response = new HashMap<>();
            response.put("base", base);
            response.put("target", target);
            response.put("rate", rate);
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch exchange rate");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Get latest rates in full format (same as exchangeratesapi.io).
     * ?fetch=false (default) - from local DB, fetches if empty
     * ?fetch=true - always fetch from API and save to DB
     */
    @GetMapping("/latest")
    public ResponseEntity<Map<String, Object>> getLatestRates(
            @RequestParam(defaultValue = "false") boolean fetch) {
        try {
            Map<String, Object> rates = exchangeRateService.getRates(fetch);
            return ResponseEntity.ok(rates);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to fetch exchange rates");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Force fetch from external API and save to local DB.
     */
    @PostMapping("/fetch")
    public ResponseEntity<Map<String, Object>> fetchAndSaveRates() {
        try {
            Map<String, Object> rates = exchangeRateService.fetchAndSaveRates();
            return ResponseEntity.ok(rates);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to fetch from API");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Get rates from local DB by date (base EUR).
     */
    @GetMapping("/local")
    public ResponseEntity<Map<String, Object>> getRatesFromLocal(
            @RequestParam(required = false, defaultValue = "EUR") String base,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            var rates = date != null
                    ? exchangeRateService.getRatesFromLocalByDate(base, date)
                    : exchangeRateService.getLatestRatesFromLocal(base);
            return rates
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
