package com.example.tradingjournal.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.util.List;

@Data
@Document(collection = "trades")
public class Trade {
    @Id
    private String id;
    private String userId;
    private String symbol;
    private LocalDate entryDate;
    private String instrumentType; // "stock" or "option"
    private String optionType; // "call" or "put", null for stocks
    private int quantity;
    private double entryPrice;
    private String strategy;
    private boolean isOpen;
    private List<Exit> exits;
    private String notes;

    @Data
    public static class Exit {
        private LocalDate date;
        private int quantity;
        private double price;
    }
}