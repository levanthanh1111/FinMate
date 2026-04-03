package com.finmate.api.repository;

import com.finmate.api.model.InvestmentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InvestmentTransactionRepository extends JpaRepository<InvestmentTransaction, Long> {

    List<InvestmentTransaction> findByPortfolioIdOrderByTransactionDateDesc(Long portfolioId);

    List<InvestmentTransaction> findByAssetIdOrderByTransactionDateDesc(Long assetId);

    List<InvestmentTransaction> findByPortfolioIdAndAssetIdOrderByTransactionDateAsc(Long portfolioId, Long assetId);

    List<InvestmentTransaction> findByTypeIgnoreCaseOrderByTransactionDateDesc(String type);

    List<InvestmentTransaction> findByTransactionDateBetweenOrderByTransactionDateDesc(LocalDateTime startDate, LocalDateTime endDate);

    List<InvestmentTransaction> findByPortfolioIdAndAssetIdAndTypeIgnoreCaseAndTransactionDateBetweenOrderByTransactionDateDesc(
            Long portfolioId,
            Long assetId,
            String type,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    @Query("""
            SELECT t
            FROM InvestmentTransaction t
            WHERE (:portfolioId IS NULL OR t.portfolioId = :portfolioId)
              AND (:assetId IS NULL OR t.assetId = :assetId)
              AND (:type IS NULL OR LOWER(t.type) = LOWER(:type))
              AND (:startDate IS NULL OR t.transactionDate >= :startDate)
              AND (:endDate IS NULL OR t.transactionDate <= :endDate)
            ORDER BY t.transactionDate DESC
            """)
    List<InvestmentTransaction> findByFilters(
            @Param("portfolioId") Long portfolioId,
            @Param("assetId") Long assetId,
            @Param("type") String type,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
