package com.finmate.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class InvestmentOverviewReport {

    private BigDecimal totalCost;
    private BigDecimal totalMarketValue;
    private BigDecimal totalUnrealizedGainLoss;
    private BigDecimal realizedProfitLossInPeriod;
    private BigDecimal realizedProfitLossPercentInPeriod;
    private Integer holdingsCount;
    private Integer transactionCountInPeriod;
}
