package com.finmate.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class InvestmentTransactionReportRow {

    private Long transactionId;
    private Long portfolioId;
    private Long assetId;
    private String type;
    private LocalDateTime transactionDate;
    private String currency;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal fee;
    private BigDecimal tax;
    private BigDecimal grossAmount;
    private BigDecimal netCashFlow;
    private BigDecimal averageCostBefore;
    private BigDecimal averageCostAfter;
    private BigDecimal runningQuantityAfter;
    private BigDecimal realizedProfitLoss;
    private BigDecimal realizedProfitLossPercent;
}
