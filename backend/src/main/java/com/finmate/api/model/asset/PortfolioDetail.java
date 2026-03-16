package com.finmate.api.model.asset;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioDetail {
    private BigDecimal totalQuantity;
    private BigDecimal averageBuyPrice;
    private BigDecimal currentMarketValue;
    private BigDecimal profitOrLoss;
}
