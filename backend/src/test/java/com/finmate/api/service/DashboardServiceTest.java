package com.finmate.api.service;

import com.finmate.api.model.Expense;
import com.finmate.api.repository.ExpenseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

public class DashboardServiceTest {

    @InjectMocks
    private DashboardService dashboardService;

    @Mock
    private ExpenseRepository expenseRepository;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetDashboardData_WithRealData() {
        // Arrange
        List<Expense> mockExpenses = new ArrayList<>();
        
        // Create mock expenses
        Expense expense1 = new Expense();
        expense1.setId(1L);
        expense1.setAmount(new BigDecimal("100.00"));
        expense1.setCategoryId(1L); // Food & Dining
        expense1.setNote("Grocery shopping");
        expense1.setDate(LocalDateTime.now().minusDays(1));
        
        Expense expense2 = new Expense();
        expense2.setId(2L);
        expense2.setAmount(new BigDecimal("50.00"));
        expense2.setCategoryId(2L); // Transportation
        expense2.setNote("Uber ride");
        expense2.setDate(LocalDateTime.now().minusDays(2));
        
        mockExpenses.add(expense1);
        mockExpenses.add(expense2);
        
        when(expenseRepository.findAll()).thenReturn(mockExpenses);
        
        // Act
        Map<String, Object> result = dashboardService.getDashboardData();
        
        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("totalSpending"));
        assertTrue(result.containsKey("categoryTotals"));
        assertTrue(result.containsKey("recentExpenses"));
        assertTrue(result.containsKey("isRealData"));
        assertTrue((Boolean) result.get("isRealData"));
        
        // Verify total spending
        assertEquals(new BigDecimal("150.00"), result.get("totalSpending"));
        
        // Verify recent expenses
        List<Map<String, Object>> recentExpenses = (List<Map<String, Object>>) result.get("recentExpenses");
        assertEquals(2, recentExpenses.size());
    }

    @Test
    public void testGetDashboardData_WithEmptyData_ReturnsMockData() {
        // Arrange
        when(expenseRepository.findAll()).thenReturn(new ArrayList<>());
        
        // Act
        Map<String, Object> result = dashboardService.getDashboardData();
        
        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("totalSpending"));
        assertTrue(result.containsKey("categoryTotals"));
        assertTrue(result.containsKey("recentExpenses"));
        assertTrue(result.containsKey("isRealData"));
        assertFalse((Boolean) result.get("isRealData"));
        
        // Verify mock data structure
        Map<String, Object> categoryTotals = (Map<String, Object>) result.get("categoryTotals");
        assertTrue(categoryTotals.containsKey("categories"));
        assertTrue(categoryTotals.containsKey("amounts"));
        
        List<Map<String, Object>> recentExpenses = (List<Map<String, Object>>) result.get("recentExpenses");
        assertTrue(recentExpenses.size() > 0);
    }

    @Test
    public void testGetDashboardData_WithException_ReturnsMockData() {
        // Arrange
        when(expenseRepository.findAll()).thenThrow(new RuntimeException("Database error"));
        
        // Act
        Map<String, Object> result = dashboardService.getDashboardData();
        
        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("isRealData"));
        assertFalse((Boolean) result.get("isRealData"));
    }
}