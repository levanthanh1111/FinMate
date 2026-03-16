package com.finmate.api.model.asset;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
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

    @NotNull(message = "User ID is required")
    @Column(name = "user_id")
    private Long userId;

    @NotNull(message = "Name is required")
    private String name;

    private String symbol;

    @NotNull(message = "Asset type is required")
    @Enumerated(EnumType.STRING)
    private AssetType type;

    private String currency;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
