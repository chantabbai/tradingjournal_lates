package com.example.tradingjournal.repository;

import com.example.tradingjournal.model.Trade;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TradeRepository extends MongoRepository<Trade, String> {
    List<Trade> findByUserId(String userId);
}