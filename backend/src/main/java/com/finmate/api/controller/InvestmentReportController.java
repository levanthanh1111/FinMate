package com.finmate.api.controller;

import com.finmate.api.dto.InvestmentMonthlyProfitLoss;
import com.finmate.api.dto.InvestmentOverviewReport;
import com.finmate.api.dto.InvestmentTransactionReportRow;
import com.finmate.api.dto.InvestmentTransactionReportSummary;
import com.finmate.api.service.InvestmentReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/investment-reports")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class InvestmentReportController {

    private final InvestmentReportingService investmentReportingService;

    @GetMapping("/transactions")
    public List<InvestmentTransactionReportRow> getTransactionReportRows(
            @RequestParam(required = false) Long portfolioId,
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate
    ) {
        return investmentReportingService.getTransactionReportRows(portfolioId, assetId, type, startDate, endDate);
    }

    @GetMapping("/transactions/summary")
    public InvestmentTransactionReportSummary getTransactionReportSummary(
            @RequestParam(required = false) Long portfolioId,
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate
    ) {
        return investmentReportingService.getTransactionReportSummary(portfolioId, assetId, type, startDate, endDate);
    }

    @GetMapping("/monthly-profit-loss")
    public List<InvestmentMonthlyProfitLoss> getMonthlyProfitLoss(
            @RequestParam(required = false) Long portfolioId,
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate
    ) {
        return investmentReportingService.getMonthlyProfitLoss(portfolioId, assetId, startDate, endDate);
    }

    @GetMapping("/overview")
    public InvestmentOverviewReport getOverview(
            @RequestParam(required = false) Long portfolioId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate
    ) {
        return investmentReportingService.getOverviewReport(portfolioId, startDate, endDate);
    }
}
