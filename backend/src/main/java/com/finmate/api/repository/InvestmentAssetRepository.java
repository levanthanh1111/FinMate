package com.finmate.api.repository;

import com.finmate.api.model.asset.InvestmentAsset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvestmentAssetRepository extends JpaRepository<InvestmentAsset, Long> {
    List<InvestmentAsset> findByUserId(Long userId);
}
