package com.finmate.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "exchange_rate_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeRateEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exchange_rate_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ExchangeRate exchangeRate;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal rate;
}
