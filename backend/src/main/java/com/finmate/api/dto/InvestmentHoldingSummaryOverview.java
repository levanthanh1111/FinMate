package com.finmate.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class InvestmentHoldingSummaryOverview {

    private BigDecimal totalCost;
    private BigDecimal totalMarketValue;
    private BigDecimal totalUnrealizedGainLoss;
    private Integer holdingsCount;
}
