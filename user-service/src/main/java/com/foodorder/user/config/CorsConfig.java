package com.foodorder.user.config;/*
 * @ (#) .java    1.0
 * Copyright (c)  IUH. All rights reserved.
 */

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/*
 * @description
 * @author: Huu Thai
 * @date:
 * @version: 1.0
 */
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://192.168.1.153:3000",
            "http://192.168.1.79:3000",
            "http://192.168.1.62:5173",
                "http://192.168.1.62:8085",
                "http://192.168.1.153:4173",
                "http://192.168.1.153:8081",
                "http://192.168.1.153:19000",
                "http://192.168.1.153:19006",
                "http://localhost:3000",   // ✅ already present but needs to be here
            "http://localhost:5173",
                "http://localhost:4173",   // ✅ add preview too
                "http://localhost:8081",   // ✅ add mobile dev
                "http://localhost:19000"   // ✅ add Expo Go
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")); // Allowed methods
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "x-no-retry"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        configuration.addExposedHeader("Set-Cookie");
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
