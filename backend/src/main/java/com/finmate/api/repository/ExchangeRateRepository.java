package com.finmate.api.repository;

import com.finmate.api.model.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {

    Optional<ExchangeRate> findFirstByBaseAndDateOrderByCreatedAtDesc(String base, LocalDate date);

    Optional<ExchangeRate> findFirstByBaseOrderByCreatedAtDesc(String base);
}
