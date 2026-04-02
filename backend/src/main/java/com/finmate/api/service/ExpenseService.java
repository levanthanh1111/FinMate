package com.finmate.api.service;

import com.finmate.api.model.Expense;
import com.finmate.api.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExpenseService {
    
    private final ExpenseRepository expenseRepository;
    
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }
    
    public Optional<Expense> getExpenseById(Long id) {
        return expenseRepository.findById(id);
    }
    
    public Expense saveExpense(Expense expense) {
        return expenseRepository.save(expense);
    }
    
    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }
    
    public List<Expense> getExpensesByCategory(Long categoryId) {
        return expenseRepository.findByCategoryIdOrderByDateDesc(categoryId);
    }
    
    public List<Expense> getExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByDateBetweenOrderByDateDesc(startDate.atStartOfDay(), endDate.atTime(LocalTime.MAX));
    }

    public List<Expense> getFilteredExpenses(Long categoryId, LocalDate startDate, LocalDate endDate) {
        boolean hasCategory = categoryId != null;
        boolean hasDateRange = startDate != null && endDate != null;

        if (hasCategory && hasDateRange) {
            LocalDateTime from = startDate.atStartOfDay();
            LocalDateTime to = endDate.atTime(LocalTime.MAX);
            return expenseRepository.findByCategoryIdAndDateBetweenOrderByDateDesc(categoryId, from, to);
        }

        if (hasCategory) {
            return expenseRepository.findByCategoryIdOrderByDateDesc(categoryId);
        }

        if (hasDateRange) {
            LocalDateTime from = startDate.atStartOfDay();
            LocalDateTime to = endDate.atTime(LocalTime.MAX);
            return expenseRepository.findByDateBetweenOrderByDateDesc(from, to);
        }

        return getAllExpenses();
    }
    
    public List<Expense> getExpensesByMonth(int year, int month) {
        return expenseRepository.findByYearAndMonth(year, month);
    }
    
    public List<Object[]> getMonthlySummaryByCategory(int year, int month) {
        return expenseRepository.findMonthlySummaryByCategory(year, month);
    }
    
    public List<Object[]> getMonthlyTotals() {
        return expenseRepository.findMonthlyTotals();
    }
}