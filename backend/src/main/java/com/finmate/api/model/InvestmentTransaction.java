package com.finmate.api.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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

    @NotNull(message = "Portfolio is required")
    @Column(name = "portfolio_id")
    private Long portfolioId;

    @NotNull(message = "Asset is required")
    @Column(name = "asset_id")
    private Long assetId;

    @NotBlank(message = "Transaction type is required")
    private String type;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.000001", message = "Quantity must be greater than 0")
    private BigDecimal quantity;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Unit price must be greater than 0")
    @Column(name = "unit_price")
    private BigDecimal unitPrice;

    @DecimalMin(value = "0.0", message = "Fee must be greater than or equal to 0")
    private BigDecimal fee;

    @DecimalMin(value = "0.0", message = "Tax must be greater than or equal to 0")
    private BigDecimal tax;

    @NotBlank(message = "Currency is required")
    private String currency;

    @Column(name = "user_id")
    private Long userId;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss.SSSSSS")
    @Column(name = "transaction_date")
    private LocalDateTime transactionDate;

    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (transactionDate == null) {
            transactionDate = LocalDateTime.now();
        }
        if (fee == null) {
            fee = BigDecimal.ZERO;
        }
        if (tax == null) {
            tax = BigDecimal.ZERO;
        }
        normalize();
    }

    @PreUpdate
    protected void onUpdate() {
        normalize();
    }

    private void normalize() {
        if (type != null) {
            type = type.trim().toUpperCase();
        }
        if (currency != null) {
            currency = currency.trim().toUpperCase();
        }
        if (note != null) {
            note = note.trim();
        }
        if (userId == null) {
            userId = 1L;
        }
    }
}
