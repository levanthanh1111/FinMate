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
@Table(name = "investment_portfolios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentPortfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Portfolio name is required")
    private String name;

    private String institution;

    @NotBlank(message = "Base currency is required")
    @Column(name = "base_currency")
    private String baseCurrency;

    @Column(name = "user_id")
    private Long userId;

    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        normalize();
        if (userId == null) {
            userId = 1L;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        normalize();
    }

    private void normalize() {
        if (baseCurrency != null) {
            baseCurrency = baseCurrency.trim().toUpperCase();
        }
        if (name != null) {
            name = name.trim();
        }
        if (institution != null) {
            institution = institution.trim();
        }
        if (description != null) {
            description = description.trim();
        }
        if (userId == null) {
            userId = 1L;
        }
    }
}
