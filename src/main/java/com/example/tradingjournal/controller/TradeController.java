package com.example.tradingjournal.controller;

import com.example.tradingjournal.model.Trade;
import com.example.tradingjournal.service.TradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trades")
public class TradeController {

    @Autowired
    private TradeService tradeService;

    @GetMapping
    public ResponseEntity<List<Trade>> getAllTrades(Authentication authentication) {
        String userId = authentication.getName();
        List<Trade> trades = tradeService.getAllTradesForUser(userId);
        return ResponseEntity.ok(trades);
    }

    @GetMapping("/open")
    public ResponseEntity<List<Trade>> getOpenTrades(Authentication authentication) {
        String userId = authentication.getName();
        List<Trade> trades = tradeService.getOpenTradesForUser(userId);
        return ResponseEntity.ok(trades);
    }

    @GetMapping("/closed")
    public ResponseEntity<List<Trade>> getClosedTrades(Authentication authentication) {
        String userId = authentication.getName();
        List<Trade> trades = tradeService.getClosedTradesForUser(userId);
        return ResponseEntity.ok(trades);
    }

    @PostMapping
    public ResponseEntity<Trade> addTrade(@RequestBody Trade trade, Authentication authentication) {
        trade.setUserId(authentication.getName());
        Trade newTrade = tradeService.addTrade(trade);
        return ResponseEntity.ok(newTrade);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trade> updateTrade(@PathVariable String id, @RequestBody Trade trade, Authentication authentication) {
        trade.setId(id);
        trade.setUserId(authentication.getName());
        Trade updatedTrade = tradeService.updateTrade(trade);
        return ResponseEntity.ok(updatedTrade);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrade(@PathVariable String id) {
        tradeService.deleteTrade(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<Trade> closeTrade(@PathVariable String id, @RequestBody Trade.Exit exit) {
        Trade closedTrade = tradeService.closeTrade(id, exit);
        return ResponseEntity.ok(closedTrade);
    }

    @GetMapping("/{id}/profit-loss")
    public ResponseEntity<Map<String, Object>> getProfitLoss(@PathVariable String id) {
        Trade trade = tradeService.getTrade(id);
        double profitLoss = tradeService.calculateProfitLoss(trade);
        double profitLossPercentage = (profitLoss / (trade.getQuantity() * trade.getEntryPrice())) * 100;
        
        Map<String, Object> result = Map.of(
            "profitLoss", profitLoss,
            "profitLossPercentage", profitLossPercentage
        );
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/import")
    public ResponseEntity<?> importTrades(@RequestParam("file") MultipartFile file, Authentication authentication) {
        String userId = authentication.getName();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] values = line.split(",");
                Trade trade = new Trade();
                trade.setUserId(userId);
                trade.setSymbol(values[0]);
                trade.setEntryDate(LocalDate.parse(values[1]));
                trade.setInstrumentType(values[2]);
                trade.setOptionType(values[3].equals("N/A") ? null : values[3]);
                trade.setQuantity(Integer.parseInt(values[4]));
                trade.setEntryPrice(Double.parseDouble(values[5]));
                trade.setStrategy(values[6]);
                trade.setOpen(true);
                tradeService.addTrade(trade);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error importing trades: " + e.getMessage());
        }
        return ResponseEntity.ok().body("Trades imported successfully");
    }
}