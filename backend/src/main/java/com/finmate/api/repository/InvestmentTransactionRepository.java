package com.finmate.api.repository;

import com.finmate.api.model.asset.InvestmentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvestmentTransactionRepository extends JpaRepository<InvestmentTransaction, Long> {
    List<InvestmentTransaction> findByAssetId(Long assetId);
}
