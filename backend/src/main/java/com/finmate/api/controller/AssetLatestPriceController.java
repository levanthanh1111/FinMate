package com.finmate.api.controller;

import com.finmate.api.model.AssetLatestPrice;
import com.finmate.api.service.AssetLatestPriceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/investment-prices/latest")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class AssetLatestPriceController {

    private final AssetLatestPriceService assetLatestPriceService;

    @GetMapping
    public List<AssetLatestPrice> getAllLatestPrices() {
        return assetLatestPriceService.getAllLatestPrices();
    }

    @GetMapping("/asset")
    public ResponseEntity<AssetLatestPrice> getLatestPriceByAssetId(@RequestParam Long assetId) {
        return assetLatestPriceService.getLatestPriceByAssetId(assetId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AssetLatestPrice> createLatestPrice(@Valid @RequestBody AssetLatestPrice latestPrice) {
        AssetLatestPrice savedPrice = assetLatestPriceService.saveLatestPrice(latestPrice);
        return new ResponseEntity<>(savedPrice, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssetLatestPrice> updateLatestPrice(@PathVariable Long id, @Valid @RequestBody AssetLatestPrice latestPrice) {
        return assetLatestPriceService.getLatestPriceById(id)
                .map(existingPrice -> {
                    latestPrice.setId(id);
                    return ResponseEntity.ok(assetLatestPriceService.saveLatestPrice(latestPrice));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLatestPrice(@PathVariable Long id) {
        return assetLatestPriceService.getLatestPriceById(id)
                .map(latestPrice -> {
                    assetLatestPriceService.deleteLatestPrice(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
