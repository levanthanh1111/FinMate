package com.finmate.api.controller;

import com.finmate.api.model.Expense;
import com.finmate.api.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public List<Expense> getAllExpenses() {
        return expenseService.getAllExpenses();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Expense> getExpenseById(@PathVariable Long id) {
        return expenseService.getExpenseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Expense> createExpense(@Valid @RequestBody Expense expense) {
        Expense savedExpense = expenseService.saveExpense(expense);
        return new ResponseEntity<>(savedExpense, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @Valid @RequestBody Expense expense) {
        return expenseService.getExpenseById(id)
                .map(existingExpense -> {
                    expense.setId(id);
                    return ResponseEntity.ok(expenseService.saveExpense(expense));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        return expenseService.getExpenseById(id)
                .map(expense -> {
                    expenseService.deleteExpense(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    public List<Expense> getExpensesByCategory(@PathVariable String category) {
        return expenseService.getExpensesByCategory(category);
    }

    @GetMapping("/date-range")
    public List<Expense> getExpensesByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return expenseService.getExpensesByDateRange(startDate, endDate);
    }

    @GetMapping("/monthly/{year}/{month}")
    public List<Expense> getExpensesByMonth(
            @PathVariable int year,
            @PathVariable int month) {
        return expenseService.getExpensesByMonth(year, month);
    }

    @GetMapping("/summary/monthly/{year}/{month}")
    public List<Object[]> getMonthlySummaryByCategory(
            @PathVariable int year,
            @PathVariable int month) {
        return expenseService.getMonthlySummaryByCategory(year, month);
    }

    @GetMapping("/summary/trends")
    public List<Object[]> getMonthlyTotals() {
        return expenseService.getMonthlyTotals();
    }
}