package com.finmate.api.controller;

import com.finmate.api.model.InvestmentAsset;
import com.finmate.api.service.InvestmentAssetService;
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
@RequestMapping("/investment-assets")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class InvestmentAssetController {

    private final InvestmentAssetService investmentAssetService;

    @GetMapping
    public List<InvestmentAsset> getAllAssets() {
        return investmentAssetService.getAllAssets();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvestmentAsset> getAssetById(@PathVariable Long id) {
        return investmentAssetService.getAssetById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<InvestmentAsset> searchAssets(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String assetType,
            @RequestParam(required = false) Boolean active
    ) {
        return investmentAssetService.searchAssets(query, assetType, active);
    }

    @PostMapping
    public ResponseEntity<InvestmentAsset> createAsset(@Valid @RequestBody InvestmentAsset asset) {
        InvestmentAsset savedAsset = investmentAssetService.saveAsset(asset);
        return new ResponseEntity<>(savedAsset, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvestmentAsset> updateAsset(@PathVariable Long id, @Valid @RequestBody InvestmentAsset asset) {
        return investmentAssetService.getAssetById(id)
                .map(existingAsset -> {
                    asset.setId(id);
                    return ResponseEntity.ok(investmentAssetService.saveAsset(asset));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        return investmentAssetService.getAssetById(id)
                .map(asset -> {
                    investmentAssetService.deleteAsset(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
