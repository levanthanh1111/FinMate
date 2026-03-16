package com.finmate.api.model.asset;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "investment_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Asset ID is required")
    @Column(name = "asset_id")
    private Long assetId;

    @NotNull(message = "Transaction type is required")
    @Enumerated(EnumType.STRING)
    private TransactionType type;

    private BigDecimal quantity;

    private BigDecimal price;

    private BigDecimal fee;

    @NotNull(message = "Date is required")
    private LocalDateTime date;

    private String note;
}
