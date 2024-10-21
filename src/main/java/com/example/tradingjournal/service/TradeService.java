package com.example.tradingjournal.service;

import com.example.tradingjournal.model.Trade;
import com.example.tradingjournal.repository.TradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TradeService {

    @Autowired
    private TradeRepository tradeRepository;

    public List<Trade> getAllTradesForUser(String userId) {
        return tradeRepository.findByUserId(userId);
    }

    public List<Trade> getOpenTradesForUser(String userId) {
        return tradeRepository.findByUserIdAndIsOpenTrue(userId);
    }

    public List<Trade> getClosedTradesForUser(String userId) {
        return tradeRepository.findByUserIdAndIsOpenFalse(userId);
    }

    public Trade addTrade(Trade trade) {
        trade.setOpen(true);
        return tradeRepository.save(trade);
    }

    public Trade updateTrade(Trade trade) {
        return tradeRepository.save(trade);
    }

    public void deleteTrade(String id) {
        tradeRepository.deleteById(id);
    }

    public Trade closeTrade(String id, Trade.Exit exit) {
        Trade trade = tradeRepository.findById(id).orElseThrow(() -> new RuntimeException("Trade not found"));
        if (trade.getExits() == null) {
            trade.setExits(new ArrayList<>());
        }
        trade.getExits().add(exit);
        
        int totalExitQuantity = trade.getExits().stream().mapToInt(Trade.Exit::getQuantity).sum();
        if (totalExitQuantity >= trade.getQuantity()) {
            trade.setOpen(false);
        }
        
        return tradeRepository.save(trade);
    }

    public double calculateProfitLoss(Trade trade) {
        if (trade.getExits() == null || trade.getExits().isEmpty()) {
            return 0;
        }

        double totalCost = trade.getQuantity() * trade.getEntryPrice();
        double totalRevenue = trade.getExits().stream()
                .mapToDouble(exit -> exit.getQuantity() * exit.getPrice())
                .sum();

        return totalRevenue - totalCost;
    }
}