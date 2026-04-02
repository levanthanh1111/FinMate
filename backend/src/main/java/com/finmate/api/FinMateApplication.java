package com.finmate.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FinMateApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinMateApplication.class, args);
    }
}
