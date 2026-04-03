package com.finmate.api.service;

import com.finmate.api.model.InvestmentTransaction;
import com.finmate.api.repository.InvestmentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvestmentTransactionService {

    private final InvestmentTransactionRepository investmentTransactionRepository;

    public List<InvestmentTransaction> getAllTransactions() {
        return investmentTransactionRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(InvestmentTransaction::getTransactionDate).reversed())
                .collect(Collectors.toList());
    }

    public Optional<InvestmentTransaction> getTransactionById(Long id) {
        return investmentTransactionRepository.findById(id);
    }

    public InvestmentTransaction saveTransaction(InvestmentTransaction transaction) {
        validateSellQuantity(transaction, null);
        return investmentTransactionRepository.save(transaction);
    }

    public InvestmentTransaction updateTransaction(Long id, InvestmentTransaction transaction) {
        validateSellQuantity(transaction, id);
        return investmentTransactionRepository.save(transaction);
    }

    public void deleteTransaction(Long id) {
        investmentTransactionRepository.deleteById(id);
    }

    public List<InvestmentTransaction> getFilteredTransactions(
            Long portfolioId,
            Long assetId,
            String type,
            LocalDate startDate,
            LocalDate endDate
    ) {
        return getAllTransactions()
                .stream()
                .filter(tx -> portfolioId == null || portfolioId.equals(tx.getPortfolioId()))
                .filter(tx -> assetId == null || assetId.equals(tx.getAssetId()))
                .filter(tx -> type == null || type.isBlank() || type.equalsIgnoreCase(tx.getType()))
                .filter(tx -> {
                    if (startDate == null) {
                        return true;
                    }
                    return !tx.getTransactionDate().toLocalDate().isBefore(startDate);
                })
                .filter(tx -> {
                    if (endDate == null) {
                        return true;
                    }
                    return !tx.getTransactionDate().toLocalDate().isAfter(endDate);
                })
                .collect(Collectors.toList());
    }

    private void validateSellQuantity(InvestmentTransaction transaction, Long excludedTransactionId) {
        if (!"SELL".equalsIgnoreCase(transaction.getType())) {
            return;
        }

        BigDecimal quantityToSell = transaction.getQuantity() == null ? BigDecimal.ZERO : transaction.getQuantity();

        List<InvestmentTransaction> history = investmentTransactionRepository
                .findByPortfolioIdAndAssetIdOrderByTransactionDateAsc(transaction.getPortfolioId(), transaction.getAssetId())
                .stream()
                .filter(tx -> excludedTransactionId == null || !excludedTransactionId.equals(tx.getId()))
                .collect(Collectors.toList());

        BigDecimal holdingQuantity = BigDecimal.ZERO;
        for (InvestmentTransaction tx : history) {
            BigDecimal qty = tx.getQuantity() == null ? BigDecimal.ZERO : tx.getQuantity();
            if ("BUY".equalsIgnoreCase(tx.getType())) {
                holdingQuantity = holdingQuantity.add(qty);
            } else if ("SELL".equalsIgnoreCase(tx.getType())) {
                holdingQuantity = holdingQuantity.subtract(qty);
            }
        }

        if (quantityToSell.compareTo(holdingQuantity) > 0) {
            throw new IllegalArgumentException("Sell quantity exceeds current holdings for selected portfolio and asset");
        }
    }
}
