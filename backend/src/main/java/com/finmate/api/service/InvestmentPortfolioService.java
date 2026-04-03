package com.finmate.api.service;

import com.finmate.api.model.InvestmentPortfolio;
import com.finmate.api.repository.InvestmentPortfolioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InvestmentPortfolioService {

    private final InvestmentPortfolioRepository investmentPortfolioRepository;

    public List<InvestmentPortfolio> getAllPortfolios() {
        return investmentPortfolioRepository.findAll();
    }

    public Optional<InvestmentPortfolio> getPortfolioById(Long id) {
        return investmentPortfolioRepository.findById(id);
    }

    public InvestmentPortfolio savePortfolio(InvestmentPortfolio portfolio) {
        return investmentPortfolioRepository.save(portfolio);
    }

    public void deletePortfolio(Long id) {
        investmentPortfolioRepository.deleteById(id);
    }
}
