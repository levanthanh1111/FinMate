package com.finmate.api.service;

import com.finmate.api.model.Expense;
import com.finmate.api.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
    
    public List<Expense> getExpensesByCategory(String category) {
        return expenseRepository.findByCategory(category);
    }
    
    public List<Expense> getExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByDateBetweenOrderByDateDesc(startDate, endDate);
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