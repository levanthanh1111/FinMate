package com.finmate.api.service;

import com.finmate.api.dto.InvestmentMonthlyProfitLoss;
import com.finmate.api.dto.InvestmentOverviewReport;
import com.finmate.api.dto.InvestmentTransactionReportRow;
import com.finmate.api.dto.InvestmentTransactionReportSummary;
import com.finmate.api.dto.InvestmentHoldingSummaryOverview;
import com.finmate.api.model.InvestmentTransaction;
import com.finmate.api.repository.InvestmentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvestmentReportingService {

    private final InvestmentTransactionRepository investmentTransactionRepository;
    private final InvestmentHoldingService investmentHoldingService;

    public List<InvestmentTransactionReportRow> getTransactionReportRows(
            Long portfolioId,
            Long assetId,
            String type,
            LocalDate startDate,
            LocalDate endDate
    ) {
        List<InvestmentTransaction> transactions = investmentTransactionRepository.findAll()
                .stream()
                .filter(tx -> portfolioId == null || portfolioId.equals(tx.getPortfolioId()))
                .filter(tx -> assetId == null || assetId.equals(tx.getAssetId()))
                .filter(tx -> type == null || type.isBlank() || type.equalsIgnoreCase(tx.getType()))
                .filter(tx -> {
                    if (startDate == null) {
                        return true;
                    }
                    return !tx.getTransactionDate().toLocalDate().isBefore(startDate);
                })
                .filter(tx -> {
                    if (endDate == null) {
                        return true;
                    }
                    return !tx.getTransactionDate().toLocalDate().isAfter(endDate);
                })
                .sorted(Comparator.comparing(InvestmentTransaction::getTransactionDate))
                .collect(Collectors.toList());

        Map<String, PositionAccumulator> positions = new HashMap<>();
        List<InvestmentTransactionReportRow> rows = new ArrayList<>();

        for (InvestmentTransaction tx : transactions) {
            String key = tx.getPortfolioId() + "-" + tx.getAssetId();
            PositionAccumulator position = positions.computeIfAbsent(key, ignored -> new PositionAccumulator());
            rows.add(position.apply(tx));
        }

        rows.sort(Comparator.comparing(InvestmentTransactionReportRow::getTransactionDate).reversed());
        return rows;
    }

    public InvestmentTransactionReportSummary getTransactionReportSummary(
            Long portfolioId,
            Long assetId,
            String type,
            LocalDate startDate,
            LocalDate endDate
    ) {
        List<InvestmentTransactionReportRow> rows = getTransactionReportRows(portfolioId, assetId, type, startDate, endDate);

        BigDecimal totalBuyAmount = BigDecimal.ZERO;
        BigDecimal totalSellAmount = BigDecimal.ZERO;
        BigDecimal totalFees = BigDecimal.ZERO;
        BigDecimal totalTaxes = BigDecimal.ZERO;
        BigDecimal totalRealizedProfitLoss = BigDecimal.ZERO;

        for (InvestmentTransactionReportRow row : rows) {
            if ("BUY".equalsIgnoreCase(row.getType())) {
                totalBuyAmount = totalBuyAmount.add(row.getGrossAmount());
            }
            if ("SELL".equalsIgnoreCase(row.getType())) {
                totalSellAmount = totalSellAmount.add(row.getGrossAmount());
            }
            totalFees = totalFees.add(row.getFee());
            totalTaxes = totalTaxes.add(row.getTax());
            totalRealizedProfitLoss = totalRealizedProfitLoss.add(row.getRealizedProfitLoss());
        }

        return new InvestmentTransactionReportSummary(
                totalBuyAmount,
                totalSellAmount,
                totalFees,
                totalTaxes,
                totalRealizedProfitLoss,
                rows.size()
        );
    }

    public List<InvestmentMonthlyProfitLoss> getMonthlyProfitLoss(Long portfolioId, Long assetId, LocalDate startDate, LocalDate endDate) {
        List<InvestmentTransactionReportRow> rows = getTransactionReportRows(portfolioId, assetId, null, startDate, endDate);

        Map<YearMonth, MonthlyAccumulator> months = new LinkedHashMap<>();

        rows.stream()
                .sorted(Comparator.comparing(InvestmentTransactionReportRow::getTransactionDate))
                .forEach(row -> {
                    LocalDateTime date = row.getTransactionDate();
                    YearMonth ym = YearMonth.of(date.getYear(), date.getMonthValue());
                    MonthlyAccumulator monthly = months.computeIfAbsent(ym, ignored -> new MonthlyAccumulator());
                    monthly.apply(row);
                });

        return months.entrySet()
                .stream()
                .map(entry -> {
                    YearMonth ym = entry.getKey();
                    MonthlyAccumulator value = entry.getValue();
                    return new InvestmentMonthlyProfitLoss(
                            ym.getYear(),
                            ym.getMonthValue(),
                            value.buyAmount,
                            value.sellAmount,
                            value.fees,
                            value.taxes,
                            value.realizedProfitLoss,
                            value.transactionCount
                    );
                })
                .collect(Collectors.toList());
    }

    public InvestmentOverviewReport getOverviewReport(Long portfolioId, LocalDate startDate, LocalDate endDate) {
        InvestmentHoldingSummaryOverview holdings = investmentHoldingService.getHoldingsSummary(portfolioId);
        InvestmentTransactionReportSummary summary = getTransactionReportSummary(portfolioId, null, null, startDate, endDate);

        BigDecimal realizedProfitLossPercent = BigDecimal.ZERO;
        if (summary.getTotalBuyAmount().compareTo(BigDecimal.ZERO) > 0) {
            realizedProfitLossPercent = summary.getTotalRealizedProfitLoss()
                    .divide(summary.getTotalBuyAmount(), 6, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        return new InvestmentOverviewReport(
                holdings.getTotalCost(),
                holdings.getTotalMarketValue(),
                holdings.getTotalUnrealizedGainLoss(),
                summary.getTotalRealizedProfitLoss(),
                realizedProfitLossPercent,
                holdings.getHoldingsCount(),
                summary.getTransactionCount()
        );
    }

    private static BigDecimal nz(BigDecimal value) {
        return Objects.requireNonNullElse(value, BigDecimal.ZERO);
    }

    private static final class PositionAccumulator {
        private BigDecimal quantityHeld = BigDecimal.ZERO;
        private BigDecimal totalCost = BigDecimal.ZERO;

        private InvestmentTransactionReportRow apply(InvestmentTransaction tx) {
            BigDecimal quantity = nz(tx.getQuantity());
            BigDecimal unitPrice = nz(tx.getUnitPrice());
            BigDecimal fee = nz(tx.getFee());
            BigDecimal tax = nz(tx.getTax());
            BigDecimal grossAmount = unitPrice.multiply(quantity);
            BigDecimal averageCostBefore = safeDivide(totalCost, quantityHeld);

            BigDecimal netCashFlow;
            BigDecimal realizedProfitLoss = BigDecimal.ZERO;
            BigDecimal realizedProfitLossPercent = BigDecimal.ZERO;

            if ("BUY".equalsIgnoreCase(tx.getType())) {
                quantityHeld = quantityHeld.add(quantity);
                totalCost = totalCost.add(grossAmount).add(fee).add(tax);
                netCashFlow = grossAmount.add(fee).add(tax).negate();
            } else {
                BigDecimal appliedQuantity = quantity.min(quantityHeld.max(BigDecimal.ZERO));
                BigDecimal averageCost = safeDivide(totalCost, quantityHeld);
                BigDecimal removedCost = averageCost.multiply(appliedQuantity);
                BigDecimal proceeds = grossAmount.subtract(fee).subtract(tax);
                realizedProfitLoss = proceeds.subtract(removedCost);

                if (removedCost.compareTo(BigDecimal.ZERO) > 0) {
                    realizedProfitLossPercent = realizedProfitLoss
                            .divide(removedCost, 6, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100));
                }

                quantityHeld = quantityHeld.subtract(appliedQuantity);
                totalCost = totalCost.subtract(removedCost);
                if (quantityHeld.compareTo(BigDecimal.ZERO) <= 0) {
                    quantityHeld = BigDecimal.ZERO;
                    totalCost = BigDecimal.ZERO;
                }

                netCashFlow = proceeds;
            }

            BigDecimal averageCostAfter = safeDivide(totalCost, quantityHeld);

            return new InvestmentTransactionReportRow(
                    tx.getId(),
                    tx.getPortfolioId(),
                    tx.getAssetId(),
                    tx.getType(),
                    tx.getTransactionDate(),
                    tx.getCurrency(),
                    quantity,
                    unitPrice,
                    fee,
                    tax,
                    grossAmount,
                    netCashFlow,
                    averageCostBefore,
                    averageCostAfter,
                    quantityHeld,
                    realizedProfitLoss,
                    realizedProfitLossPercent
            );
        }

        private BigDecimal safeDivide(BigDecimal dividend, BigDecimal divisor) {
            if (divisor == null || divisor.compareTo(BigDecimal.ZERO) == 0) {
                return BigDecimal.ZERO;
            }
            return dividend.divide(divisor, 6, RoundingMode.HALF_UP);
        }
    }

    private static final class MonthlyAccumulator {
        private BigDecimal buyAmount = BigDecimal.ZERO;
        private BigDecimal sellAmount = BigDecimal.ZERO;
        private BigDecimal fees = BigDecimal.ZERO;
        private BigDecimal taxes = BigDecimal.ZERO;
        private BigDecimal realizedProfitLoss = BigDecimal.ZERO;
        private Integer transactionCount = 0;

        private void apply(InvestmentTransactionReportRow row) {
            if ("BUY".equalsIgnoreCase(row.getType())) {
                buyAmount = buyAmount.add(row.getGrossAmount());
            }
            if ("SELL".equalsIgnoreCase(row.getType())) {
                sellAmount = sellAmount.add(row.getGrossAmount());
            }

            fees = fees.add(row.getFee());
            taxes = taxes.add(row.getTax());
            realizedProfitLoss = realizedProfitLoss.add(row.getRealizedProfitLoss());
            transactionCount += 1;
        }
    }
}
