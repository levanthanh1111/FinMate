package com.finmate.api.controller;

import com.finmate.api.model.asset.InvestmentAsset;
import com.finmate.api.model.asset.InvestmentTransaction;
import com.finmate.api.model.asset.PortfolioDetail;
import com.finmate.api.service.InvestmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/investments")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class InvestmentController {

    private final InvestmentService investmentService;

    @PostMapping("/assets")
    public ResponseEntity<InvestmentAsset> createAsset(@RequestBody InvestmentAsset asset) {
        InvestmentAsset createdAsset = investmentService.createAsset(asset);
        return new ResponseEntity<>(createdAsset, HttpStatus.CREATED);
    }

    @PostMapping("/transactions")
    public ResponseEntity<InvestmentTransaction> recordTransaction(@RequestBody InvestmentTransaction transaction) {
        InvestmentTransaction recordedTransaction = investmentService.recordTransaction(transaction);
        return new ResponseEntity<>(recordedTransaction, HttpStatus.CREATED);
    }

    @GetMapping("/assets/user/{userId}")
    public List<InvestmentAsset> getAssetsByUserId(@PathVariable Long userId) {
        return investmentService.getAssetsByUserId(userId);
    }

    @GetMapping("/transactions/{assetId}")
    public List<InvestmentTransaction> getTransactionsByAssetId(@PathVariable Long assetId) {
        return investmentService.getTransactionsByAssetId(assetId);
    }

    @GetMapping("/portfolio/{assetId}")
    public PortfolioDetail getPortfolioDetail(@PathVariable Long assetId, @RequestParam BigDecimal currentPrice) {
        return investmentService.getPortfolioDetail(assetId, currentPrice);
    }
}
