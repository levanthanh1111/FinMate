package com.finmate.api.repository;

import com.finmate.api.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    List<Expense> findByCategory(String category);
    
    List<Expense> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT e FROM Expense e WHERE YEAR(e.date) = ?1 AND MONTH(e.date) = ?2")
    List<Expense> findByYearAndMonth(int year, int month);
    
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE YEAR(e.date) = ?1 AND MONTH(e.date) = ?2 GROUP BY e.category ORDER BY SUM(e.amount) DESC")
    List<Object[]> findMonthlySummaryByCategory(int year, int month);
    
    @Query("SELECT YEAR(e.date), MONTH(e.date), SUM(e.amount) FROM Expense e GROUP BY YEAR(e.date), MONTH(e.date) ORDER BY YEAR(e.date), MONTH(e.date)")
    List<Object[]> findMonthlyTotals();
}