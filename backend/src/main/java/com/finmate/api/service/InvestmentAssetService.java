package com.finmate.api.service;

import com.finmate.api.model.InvestmentAsset;
import com.finmate.api.repository.InvestmentAssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InvestmentAssetService {

    private final InvestmentAssetRepository investmentAssetRepository;

    public List<InvestmentAsset> getAllAssets() {
        return investmentAssetRepository.findAll();
    }

    public Optional<InvestmentAsset> getAssetById(Long id) {
        return investmentAssetRepository.findById(id);
    }

    public List<InvestmentAsset> searchAssets(String query, String assetType, Boolean active) {
        if (query != null && !query.isBlank()) {
            return investmentAssetRepository.findBySymbolContainingIgnoreCaseOrNameContainingIgnoreCaseOrderByNameAsc(query, query);
        }

        if (assetType != null && !assetType.isBlank()) {
            return investmentAssetRepository.findByAssetTypeIgnoreCaseOrderByNameAsc(assetType);
        }

        if (active != null) {
            return investmentAssetRepository.findByActiveOrderByNameAsc(active);
        }

        return getAllAssets();
    }

    public InvestmentAsset saveAsset(InvestmentAsset asset) {
        if (asset.getActive() == null) {
            asset.setActive(Boolean.TRUE);
        }

        return investmentAssetRepository.save(asset);
    }

    public void deleteAsset(Long id) {
        investmentAssetRepository.deleteById(id);
    }
}
