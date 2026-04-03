package com.finmate.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "investment_assets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Asset symbol is required")
    private String symbol;

    @NotBlank(message = "Asset name is required")
    private String name;

    @NotBlank(message = "Asset type is required")
    @Column(name = "asset_type")
    private String assetType;

    private String market;

    @NotBlank(message = "Asset currency is required")
    private String currency;

    @Column(name = "user_id")
    private Long userId;

    private Boolean active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        normalize();
    }

    @PreUpdate
    protected void onUpdate() {
        normalize();
    }

    private void normalize() {
        if (symbol != null) {
            symbol = symbol.trim().toUpperCase();
        }
        if (name != null) {
            name = name.trim();
        }
        if (assetType != null) {
            assetType = assetType.trim().toUpperCase();
        }
        if (market != null) {
            market = market.trim();
        }
        if (currency != null) {
            currency = currency.trim().toUpperCase();
        }
        if (active == null) {
            active = Boolean.TRUE;
        }
        if (userId == null) {
            userId = 1L;
        }
    }
}
