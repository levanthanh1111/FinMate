package com.finmate.api.repository;

import com.finmate.api.model.InvestmentPortfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvestmentPortfolioRepository extends JpaRepository<InvestmentPortfolio, Long> {
}
