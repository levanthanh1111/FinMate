package com.finmate.api.controller;

import com.finmate.api.model.InvestmentPortfolio;
import com.finmate.api.service.InvestmentPortfolioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/investment-portfolios")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class InvestmentPortfolioController {

    private final InvestmentPortfolioService investmentPortfolioService;

    @GetMapping
    public List<InvestmentPortfolio> getAllPortfolios() {
        return investmentPortfolioService.getAllPortfolios();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvestmentPortfolio> getPortfolioById(@PathVariable Long id) {
        return investmentPortfolioService.getPortfolioById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<InvestmentPortfolio> createPortfolio(@Valid @RequestBody InvestmentPortfolio portfolio) {
        InvestmentPortfolio savedPortfolio = investmentPortfolioService.savePortfolio(portfolio);
        return new ResponseEntity<>(savedPortfolio, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvestmentPortfolio> updatePortfolio(@PathVariable Long id, @Valid @RequestBody InvestmentPortfolio portfolio) {
        return investmentPortfolioService.getPortfolioById(id)
                .map(existingPortfolio -> {
                    portfolio.setId(id);
                    return ResponseEntity.ok(investmentPortfolioService.savePortfolio(portfolio));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePortfolio(@PathVariable Long id) {
        return investmentPortfolioService.getPortfolioById(id)
                .map(portfolio -> {
                    investmentPortfolioService.deletePortfolio(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
