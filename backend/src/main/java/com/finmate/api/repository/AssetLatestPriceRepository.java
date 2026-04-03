package com.finmate.api.repository;

import com.finmate.api.model.AssetLatestPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetLatestPriceRepository extends JpaRepository<AssetLatestPrice, Long> {

    Optional<AssetLatestPrice> findFirstByAssetIdOrderByPriceDateDesc(Long assetId);

    List<AssetLatestPrice> findByAssetIdOrderByPriceDateDesc(Long assetId);
}
