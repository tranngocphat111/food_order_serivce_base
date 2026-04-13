package com.foodorder.gateway.config;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

/**
 * Global CORS configuration for the API Gateway.
 * 
	 * This configuration allows the frontend to make cross-origin requests
 * to the gateway, which then forwards requests to microservices.
 * 
 * @author Your Name
 * @version 1.0.0
 */
@Configuration
public class GlobalCorsConfig {

	@Value("${gateway.cors.allowed-origins}")
	private String allowedOrigins;

	@Value("${gateway.cors.allowed-methods}")
	private String allowedMethods;

	@Value("${gateway.cors.allowed-headers}")
	private String allowedHeaders;

	@Value("${gateway.cors.max-age}")
	private Long maxAge;

	/**
	 * Configures CORS settings for all routes.
	 * 
	 * Features:
	 * - Allows requests from frontend (localhost:5173)
	 * - Supports all necessary HTTP methods
	 * - Allows all headers
	 * - Exposes Authorization and Content-Type headers
	 * - Allows credentials (cookies, authorization headers)
	 * - 1-hour max age for preflight requests
	 * 
	 * @return CorsConfigurationSource with CORS settings
	 */
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		
		// Allow frontend origins from configuration
		config.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
				.map(String::trim)
				.filter(origin -> !origin.isBlank())
				.collect(Collectors.toList()));
		
		// Allow common HTTP methods
		config.setAllowedMethods(Arrays.stream(allowedMethods.split(","))
				.map(String::trim)
				.collect(Collectors.toList()));
		
		// Allow all headers from client
		config.setAllowedHeaders(List.of(allowedHeaders));
		
		// Expose additional headers to client
		config.setExposedHeaders(Arrays.asList(
				"Authorization",
				"Content-Type",
				"X-Total-Count",
				"X-Page-Number",
				"X-Page-Size"
		));
		
		// Allow credentials (important for auth)
		config.setAllowCredentials(true);
		
		// Cache preflight requests for 1 hour (3600 seconds)
		config.setMaxAge(maxAge);
		
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		
		return source;
	}

}
