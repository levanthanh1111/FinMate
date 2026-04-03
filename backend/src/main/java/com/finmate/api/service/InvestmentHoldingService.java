package com.finmate.api.service;

import com.finmate.api.dto.InvestmentHoldingSummary;
import com.finmate.api.dto.InvestmentHoldingSummaryOverview;
import com.finmate.api.model.AssetLatestPrice;
import com.finmate.api.model.InvestmentTransaction;
import com.finmate.api.repository.AssetLatestPriceRepository;
import com.finmate.api.repository.InvestmentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InvestmentHoldingService {

    private final InvestmentTransactionRepository investmentTransactionRepository;
    private final AssetLatestPriceRepository assetLatestPriceRepository;

    public List<InvestmentHoldingSummary> getHoldings(Long portfolioId) {
        List<InvestmentTransaction> transactions = investmentTransactionRepository.findAll();

        Map<String, HoldingAccumulator> holdingsMap = new HashMap<>();

        for (InvestmentTransaction transaction : transactions) {
            if (portfolioId != null && !portfolioId.equals(transaction.getPortfolioId())) {
                continue;
            }

            String key = transaction.getPortfolioId() + "-" + transaction.getAssetId();
            HoldingAccumulator accumulator = holdingsMap.computeIfAbsent(
                    key,
                    ignored -> new HoldingAccumulator(transaction.getPortfolioId(), transaction.getAssetId(), transaction.getCurrency())
            );
            accumulator.apply(transaction);
        }

        List<InvestmentHoldingSummary> summaries = new ArrayList<>();
        for (HoldingAccumulator accumulator : holdingsMap.values()) {
            if (accumulator.quantityHeld.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            AssetLatestPrice latestPrice = assetLatestPriceRepository
                    .findFirstByAssetIdOrderByPriceDateDesc(accumulator.assetId)
                    .orElse(null);

            BigDecimal averageCost = safeDivide(accumulator.totalCost, accumulator.quantityHeld);
            BigDecimal latestPriceValue = latestPrice != null ? latestPrice.getPrice() : BigDecimal.ZERO;
            BigDecimal marketValue = accumulator.quantityHeld.multiply(latestPriceValue);
            BigDecimal unrealizedGainLoss = marketValue.subtract(accumulator.totalCost);

            summaries.add(new InvestmentHoldingSummary(
                    accumulator.portfolioId,
                    accumulator.assetId,
                    accumulator.quantityHeld,
                    accumulator.totalCost,
                    averageCost,
                    latestPriceValue,
                    marketValue,
                    unrealizedGainLoss,
                    latestPrice != null ? latestPrice.getCurrency() : accumulator.currency,
                    latestPrice != null ? latestPrice.getPriceDate() : null
            ));
        }

        return summaries;
    }

    public InvestmentHoldingSummaryOverview getHoldingsSummary(Long portfolioId) {
        List<InvestmentHoldingSummary> holdings = getHoldings(portfolioId);

        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal totalMarketValue = BigDecimal.ZERO;
        BigDecimal totalUnrealizedGainLoss = BigDecimal.ZERO;

        for (InvestmentHoldingSummary holding : holdings) {
            totalCost = totalCost.add(holding.getTotalCost());
            totalMarketValue = totalMarketValue.add(holding.getMarketValue());
            totalUnrealizedGainLoss = totalUnrealizedGainLoss.add(holding.getUnrealizedGainLoss());
        }

        return new InvestmentHoldingSummaryOverview(
                totalCost,
                totalMarketValue,
                totalUnrealizedGainLoss,
                holdings.size()
        );
    }

    private BigDecimal safeDivide(BigDecimal dividend, BigDecimal divisor) {
        if (divisor.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return dividend.divide(divisor, 6, RoundingMode.HALF_UP);
    }

    private static final class HoldingAccumulator {
        private final Long portfolioId;
        private final Long assetId;
        private final String currency;
        private BigDecimal quantityHeld = BigDecimal.ZERO;
        private BigDecimal totalCost = BigDecimal.ZERO;

        private HoldingAccumulator(Long portfolioId, Long assetId, String currency) {
            this.portfolioId = portfolioId;
            this.assetId = assetId;
            this.currency = currency;
        }

        private void apply(InvestmentTransaction transaction) {
            BigDecimal quantity = transaction.getQuantity();
            BigDecimal grossValue = transaction.getUnitPrice().multiply(quantity);
            BigDecimal fee = transaction.getFee() != null ? transaction.getFee() : BigDecimal.ZERO;
            BigDecimal tax = transaction.getTax() != null ? transaction.getTax() : BigDecimal.ZERO;

            if ("BUY".equalsIgnoreCase(transaction.getType())) {
                quantityHeld = quantityHeld.add(quantity);
                totalCost = totalCost.add(grossValue).add(fee).add(tax);
                return;
            }

            if (!"SELL".equalsIgnoreCase(transaction.getType())) {
                return;
            }

            if (quantityHeld.compareTo(BigDecimal.ZERO) <= 0) {
                return;
            }

            BigDecimal appliedQuantity = quantity.min(quantityHeld);
            BigDecimal averageCost = totalCost.divide(quantityHeld, 6, RoundingMode.HALF_UP);
            BigDecimal removedCost = averageCost.multiply(appliedQuantity);

            quantityHeld = quantityHeld.subtract(appliedQuantity);
            totalCost = totalCost.subtract(removedCost);

            if (quantityHeld.compareTo(BigDecimal.ZERO) == 0) {
                totalCost = BigDecimal.ZERO;
            }
        }
    }
}
