package com.finmate.api.service;

import com.finmate.api.model.asset.InvestmentAsset;
import com.finmate.api.model.asset.InvestmentTransaction;
import com.finmate.api.model.asset.PortfolioDetail;
import com.finmate.api.model.asset.TransactionType;
import com.finmate.api.repository.InvestmentAssetRepository;
import com.finmate.api.repository.InvestmentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvestmentService {

    private final InvestmentAssetRepository assetRepository;
    private final InvestmentTransactionRepository transactionRepository;

    public List<InvestmentAsset> getAssetsByUserId(Long userId) {
        return assetRepository.findByUserId(userId);
    }

    public InvestmentAsset createAsset(InvestmentAsset asset) {
        return assetRepository.save(asset);
    }

    public InvestmentTransaction recordTransaction(InvestmentTransaction transaction) {
        return transactionRepository.save(transaction);
    }

    public List<InvestmentTransaction> getTransactionsByAssetId(Long assetId) {
        return transactionRepository.findByAssetId(assetId);
    }

    public PortfolioDetail getPortfolioDetail(Long assetId, BigDecimal currentPrice) {
        List<InvestmentTransaction> transactions = getTransactionsByAssetId(assetId);

        BigDecimal totalQuantity = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;

        for (InvestmentTransaction tx : transactions) {
            if (tx.getType() == TransactionType.BUY) {
                totalQuantity = totalQuantity.add(tx.getQuantity());
                totalCost = totalCost.add(tx.getQuantity().multiply(tx.getPrice()).add(tx.getFee()));
            } else if (tx.getType() == TransactionType.SELL) {
                totalQuantity = totalQuantity.subtract(tx.getQuantity());
            }
        }

        if (totalQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            return new PortfolioDetail(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        BigDecimal averageBuyPrice = totalCost.divide(totalQuantity, 2, RoundingMode.HALF_UP);
        BigDecimal currentMarketValue = totalQuantity.multiply(currentPrice);
        BigDecimal profitOrLoss = currentMarketValue.subtract(totalCost);

        return new PortfolioDetail(totalQuantity, averageBuyPrice, currentMarketValue, profitOrLoss);
    }
}
