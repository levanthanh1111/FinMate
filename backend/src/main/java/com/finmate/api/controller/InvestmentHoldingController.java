package com.finmate.api.controller;

import com.finmate.api.dto.InvestmentHoldingSummary;
import com.finmate.api.dto.InvestmentHoldingSummaryOverview;
import com.finmate.api.service.InvestmentHoldingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/investment-holdings")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class InvestmentHoldingController {

    private final InvestmentHoldingService investmentHoldingService;

    @GetMapping
    public List<InvestmentHoldingSummary> getHoldings(@RequestParam(required = false) Long portfolioId) {
        return investmentHoldingService.getHoldings(portfolioId);
    }

    @GetMapping("/summary")
    public InvestmentHoldingSummaryOverview getHoldingsSummary(@RequestParam(required = false) Long portfolioId) {
        return investmentHoldingService.getHoldingsSummary(portfolioId);
    }
}
