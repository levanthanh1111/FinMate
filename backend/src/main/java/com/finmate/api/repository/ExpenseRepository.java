package com.finmate.api.repository;

import com.finmate.api.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    List<Expense> findByCategoryIdOrderByDateDesc(Long categoryId);
    
    List<Expense> findByDateBetweenOrderByDateDesc(LocalDateTime startDate, LocalDateTime endDate);

    List<Expense> findByCategoryIdAndDateBetweenOrderByDateDesc(Long categoryId, LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT e FROM Expense e WHERE YEAR(e.date) = ?1 AND MONTH(e.date) = ?2")
    List<Expense> findByYearAndMonth(int year, int month);
    
    @Query(value = """
                SELECT 
                    c.name AS category_name,
                    SUM(amount) AS total_amount
                FROM expenses e
                INNER JOIN categories c
                    ON e.category_id = c.id
                WHERE date >= make_date(:year, :month, 1)
                  AND date < make_date(:year, :month, 1) + INTERVAL '1 month'
                GROUP BY c.name
                ORDER BY total_amount DESC
            """, nativeQuery = true)
    List<Object[]> findMonthlySummaryByCategory(int year, int month);
    
    @Query("SELECT YEAR(e.date), MONTH(e.date), SUM(e.amount) FROM Expense e GROUP BY YEAR(e.date), MONTH(e.date) ORDER BY YEAR(e.date), MONTH(e.date)")
    List<Object[]> findMonthlyTotals();
}