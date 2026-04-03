package com.finmate.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class InvestmentMonthlyProfitLoss {

    private Integer year;
    private Integer month;
    private BigDecimal buyAmount;
    private BigDecimal sellAmount;
    private BigDecimal fees;
    private BigDecimal taxes;
    private BigDecimal realizedProfitLoss;
    private Integer transactionCount;
}
