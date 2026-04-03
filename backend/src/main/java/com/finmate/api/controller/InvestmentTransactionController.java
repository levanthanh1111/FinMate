package com.finmate.api.controller;

import com.finmate.api.model.InvestmentTransaction;
import com.finmate.api.service.InvestmentTransactionService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/investment-transactions")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class InvestmentTransactionController {

    private final InvestmentTransactionService investmentTransactionService;

    @GetMapping
    public List<InvestmentTransaction> getAllTransactions() {
        return investmentTransactionService.getAllTransactions();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvestmentTransaction> getTransactionById(@PathVariable Long id) {
        return investmentTransactionService.getTransactionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/filter")
    public List<InvestmentTransaction> getFilteredTransactions(
            @RequestParam(required = false) Long portfolioId,
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate
    ) {
        return investmentTransactionService.getFilteredTransactions(portfolioId, assetId, type, startDate, endDate);
    }

    @PostMapping
    public ResponseEntity<InvestmentTransaction> createTransaction(@Valid @RequestBody InvestmentTransaction transaction) {
        try {
            InvestmentTransaction savedTransaction = investmentTransactionService.saveTransaction(transaction);
            return new ResponseEntity<>(savedTransaction, HttpStatus.CREATED);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.<InvestmentTransaction>badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvestmentTransaction> updateTransaction(@PathVariable Long id, @Valid @RequestBody InvestmentTransaction transaction) {
        return (ResponseEntity<InvestmentTransaction>) investmentTransactionService.getTransactionById(id)
                .map(existingTransaction -> {
                    transaction.setId(id);
                    transaction.setCreatedAt(existingTransaction.getCreatedAt());
                    try {
                        return ResponseEntity.ok(investmentTransactionService.updateTransaction(id, transaction));
                    } catch (IllegalArgumentException ex) {
                        return ResponseEntity.<InvestmentTransaction>badRequest().build();
                    }
                })
                .orElse(ResponseEntity.<InvestmentTransaction>notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        return investmentTransactionService.getTransactionById(id)
                .map(transaction -> {
                    investmentTransactionService.deleteTransaction(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
