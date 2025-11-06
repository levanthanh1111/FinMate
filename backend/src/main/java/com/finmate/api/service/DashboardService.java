package com.finmate.api.service;

import com.finmate.api.model.Expense;
import com.finmate.api.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ExpenseRepository expenseRepository;
    private final Map<Long, String> categoryMap = Map.of(
        1L, "Food & Dining",
        2L, "Transportation",
        3L, "Housing",
        4L, "Entertainment",
        5L, "Shopping",
        6L, "Utilities",
        7L, "Healthcare",
        8L, "Travel"
    );

    @Autowired
    public DashboardService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    /**
     * Get dashboard data including total spending, top categories, and recent expenses
     * Falls back to mock data if real data is not available
     */
    public Map<String, Object> getDashboardData() {
        Map<String, Object> dashboardData = new HashMap<>();
        
        try {
            // Try to get real data from database
            List<Expense> allExpenses = expenseRepository.findAll();
            
            if (allExpenses.isEmpty()) {
                // If no real data, use mock data
                return getMockDashboardData();
            }
            
            // Calculate total spending
            BigDecimal totalSpending = allExpenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Get top categories
            Map<String, Object> categoryTotals = getCategoryTotals(allExpenses);
            
            // Get recent expenses
            List<Map<String, Object>> recentExpenses = getRecentExpenses(allExpenses);
            
            // Build response
            dashboardData.put("totalSpending", totalSpending);
            dashboardData.put("categoryTotals", categoryTotals);
            dashboardData.put("recentExpenses", recentExpenses);
            dashboardData.put("isRealData", true);
            
            return dashboardData;
            
        } catch (Exception e) {
            // If any error occurs, fall back to mock data
            return getMockDashboardData();
        }
    }
    
    /**
     * Generate mock dashboard data
     */
    private Map<String, Object> getMockDashboardData() {
        Map<String, Object> mockData = new HashMap<>();
        
        // Mock total spending
        mockData.put("totalSpending", BigDecimal.valueOf(1250.75));
        
        // Mock category totals
        Map<String, Object> categoryTotals = new HashMap<>();
        List<String> categories = new ArrayList<>(Arrays.asList(
            "Food & Dining", "Transportation", "Housing", "Entertainment", "Shopping"
        ));
        List<BigDecimal> amounts = new ArrayList<>(Arrays.asList(
            BigDecimal.valueOf(450.25),
            BigDecimal.valueOf(320.50),
            BigDecimal.valueOf(200.00),
            BigDecimal.valueOf(150.00),
            BigDecimal.valueOf(130.00)
        ));
        
        categoryTotals.put("categories", categories);
        categoryTotals.put("amounts", amounts);
        
        // Mock recent expenses
        List<Map<String, Object>> recentExpenses = new ArrayList<>();
        
        Map<String, Object> expense1 = new HashMap<>();
        expense1.put("id", 1L);
        expense1.put("amount", BigDecimal.valueOf(45.75));
        expense1.put("category", "Food & Dining");
        expense1.put("note", "Grocery shopping");
        expense1.put("date", LocalDateTime.now().minusDays(1));
        
        Map<String, Object> expense2 = new HashMap<>();
        expense2.put("id", 2L);
        expense2.put("amount", BigDecimal.valueOf(32.50));
        expense2.put("category", "Transportation");
        expense2.put("note", "Uber ride");
        expense2.put("date", LocalDateTime.now().minusDays(2));
        
        Map<String, Object> expense3 = new HashMap<>();
        expense3.put("id", 3L);
        expense3.put("amount", BigDecimal.valueOf(120.00));
        expense3.put("category", "Entertainment");
        expense3.put("note", "Concert tickets");
        expense3.put("date", LocalDateTime.now().minusDays(3));
        
        Map<String, Object> expense4 = new HashMap<>();
        expense4.put("id", 4L);
        expense4.put("amount", BigDecimal.valueOf(65.25));
        expense4.put("category", "Shopping");
        expense4.put("note", "New clothes");
        expense4.put("date", LocalDateTime.now().minusDays(4));
        
        Map<String, Object> expense5 = new HashMap<>();
        expense5.put("id", 5L);
        expense5.put("amount", BigDecimal.valueOf(200.00));
        expense5.put("category", "Housing");
        expense5.put("note", "Utility bill");
        expense5.put("date", LocalDateTime.now().minusDays(5));
        
        recentExpenses.add(expense1);
        recentExpenses.add(expense2);
        recentExpenses.add(expense3);
        recentExpenses.add(expense4);
        recentExpenses.add(expense5);
        
        mockData.put("categoryTotals", categoryTotals);
        mockData.put("recentExpenses", recentExpenses);
        mockData.put("isRealData", false);
        
        return mockData;
    }
    
    /**
     * Calculate category totals from real expense data
     */
    private Map<String, Object> getCategoryTotals(List<Expense> expenses) {
        Map<String, Object> result = new HashMap<>();
        
        // Group expenses by category and sum amounts
        Map<Long, BigDecimal> categoryAmounts = expenses.stream()
            .collect(Collectors.groupingBy(
                Expense::getCategoryId,
                Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
            ));
        
        // Sort categories by amount (descending)
        List<Map.Entry<Long, BigDecimal>> sortedEntries = new ArrayList<>(categoryAmounts.entrySet());
        sortedEntries.sort(Map.Entry.<Long, BigDecimal>comparingByValue().reversed());
        
        // Extract top 5 categories
        List<String> categories = new ArrayList<>();
        List<BigDecimal> amounts = new ArrayList<>();
        
        sortedEntries.stream().limit(5).forEach(entry -> {
            Long categoryId = entry.getKey();
            BigDecimal amount = entry.getValue();
            
            categories.add(categoryMap.getOrDefault(categoryId, "Category " + categoryId));
            amounts.add(amount);
        });
        
        result.put("categories", categories);
        result.put("amounts", amounts);
        
        return result;
    }
    
    /**
     * Get recent expenses from real expense data
     */
    private List<Map<String, Object>> getRecentExpenses(List<Expense> expenses) {
        // Sort expenses by date (most recent first)
        List<Expense> sortedExpenses = expenses.stream()
            .sorted(Comparator.comparing(Expense::getDate).reversed())
            .limit(5)
            .collect(Collectors.toList());
        
        // Convert to response format
        return sortedExpenses.stream().map(expense -> {
            Map<String, Object> expenseMap = new HashMap<>();
            expenseMap.put("id", expense.getId());
            expenseMap.put("amount", expense.getAmount());
            expenseMap.put("category", categoryMap.getOrDefault(expense.getCategoryId(), "Category " + expense.getCategoryId()));
            expenseMap.put("note", expense.getNote());
            expenseMap.put("date", expense.getDate());
            return expenseMap;
        }).collect(Collectors.toList());
    }
}