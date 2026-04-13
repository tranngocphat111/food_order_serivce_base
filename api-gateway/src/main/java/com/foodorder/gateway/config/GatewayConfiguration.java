package com.foodorder.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Root gateway configuration marker for scanning.
 * This file ensures the config package is properly detected by Spring.
 * 
 * @author Your Name
 * @version 1.0.0
 */
@Configuration
public class GatewayConfiguration {
	
	/**
	 * Marker configuration for Spring to scan this package.
	 */
	public static final String PACKAGE = "com.foodorder.gateway.config";
}
