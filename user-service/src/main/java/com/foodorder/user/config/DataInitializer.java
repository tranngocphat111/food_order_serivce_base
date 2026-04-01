package com.foodorder.user.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.foodorder.user.entity.User;
import com.foodorder.user.entity.UserRole;
import com.foodorder.user.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class DataInitializer {

    @Bean
    public CommandLineRunner initializeData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // User data will be initialized from food_ordering_db.sql script
            // This class is kept for reference but data initialization is handled by SQL script

            long userCount = userRepository.count();
            if (userCount == 0) {
                log.warn("⚠️  No users found! Please run food_ordering_db.sql script to initialize data");
            } else {
                log.info("✅ Database initialized with {} users", userCount);
            }
        };
    }
}

