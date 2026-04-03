package com.finmate.api.service;

import com.finmate.api.model.AssetLatestPrice;
import com.finmate.api.repository.AssetLatestPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AssetLatestPriceService {

    private final AssetLatestPriceRepository assetLatestPriceRepository;

    public List<AssetLatestPrice> getAllLatestPrices() {
        return assetLatestPriceRepository.findAll();
    }

    public Optional<AssetLatestPrice> getLatestPriceById(Long id) {
        return assetLatestPriceRepository.findById(id);
    }

    public Optional<AssetLatestPrice> getLatestPriceByAssetId(Long assetId) {
        return assetLatestPriceRepository.findFirstByAssetIdOrderByPriceDateDesc(assetId);
    }

    public AssetLatestPrice saveLatestPrice(AssetLatestPrice latestPrice) {
        return assetLatestPriceRepository.save(latestPrice);
    }

    public void deleteLatestPrice(Long id) {
        assetLatestPriceRepository.deleteById(id);
    }
}
