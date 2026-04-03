package com.finmate.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class InvestmentTransactionReportSummary {

    private BigDecimal totalBuyAmount;
    private BigDecimal totalSellAmount;
    private BigDecimal totalFees;
    private BigDecimal totalTaxes;
    private BigDecimal totalRealizedProfitLoss;
    private Integer transactionCount;
}
