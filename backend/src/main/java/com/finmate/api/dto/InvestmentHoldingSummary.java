package com.finmate.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class InvestmentHoldingSummary {

    private Long portfolioId;
    private Long assetId;
    private BigDecimal quantityHeld;
    private BigDecimal totalCost;
    private BigDecimal averageCost;
    private BigDecimal latestPrice;
    private BigDecimal marketValue;
    private BigDecimal unrealizedGainLoss;
    private String currency;
    private LocalDateTime latestPriceDate;
}
