package com.finmate.api.repository;

import com.finmate.api.model.InvestmentAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvestmentAssetRepository extends JpaRepository<InvestmentAsset, Long> {

    List<InvestmentAsset> findBySymbolContainingIgnoreCaseOrNameContainingIgnoreCaseOrderByNameAsc(String symbol, String name);

    List<InvestmentAsset> findByAssetTypeIgnoreCaseOrderByNameAsc(String assetType);

    List<InvestmentAsset> findByActiveOrderByNameAsc(Boolean active);
}
