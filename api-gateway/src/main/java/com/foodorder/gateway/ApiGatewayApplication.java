package com.foodorder.gateway;

import com.foodorder.gateway.filter.JwtAuthenticationFilter;
import com.foodorder.gateway.filter.LoggingFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

/**
 * Main entry point for the API Gateway application.
 * 
 * This gateway serves as a single entry point for all microservice requests,
 * handling routing, authentication, CORS, and logging.
 * 
 * @author Your Name
 * @version 1.0.0
 */
@SpringBootApplication
@RequiredArgsConstructor
public class ApiGatewayApplication {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	private final LoggingFilter loggingFilter;

	@Value("${gateway.routes.user-service-url}")
	private String userServiceUrl;

	@Value("${gateway.routes.food-service-url}")
	private String foodServiceUrl;

	@Value("${gateway.routes.order-service-url}")
	private String orderServiceUrl;

	@Value("${gateway.routes.payment-service-url}")
	private String paymentServiceUrl;

	public static void main(String[] args) {
		SpringApplication.run(ApiGatewayApplication.class, args);
	}

	/**
	 * Defines the routing rules for all microservices.
	 * 
	 * Routes are configured to:
	 * - Forward requests to the appropriate microservice
	 * - Strip the prefix if configured
	 * - Apply JWT authentication filter
	 * - Apply logging filter
	 * 
	 * @param builder RouteLocatorBuilder for building routes
	 * @return RouteLocator containing all configured routes
	 */
	@Bean
	public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
		return builder.routes()
				// Auth compatibility routes to user-service
				.route("user-auth-service", r -> r
						.path("/api/v1/auth/**")
						.filters(f -> f.filter(jwtAuthenticationFilter).filter(loggingFilter))
						.uri(userServiceUrl))

				// User Service Routes
				.route("user-service", r -> r
						.path("/api/users/**")
						.filters(f -> f.filter(jwtAuthenticationFilter).filter(loggingFilter))
						.uri(userServiceUrl))

				// Food Service Routes
				.route("food-service", r -> r
						.path("/foods/**")
						.filters(f -> f.filter(jwtAuthenticationFilter).filter(loggingFilter))
						.uri(foodServiceUrl))

				// Order Service Routes
				.route("order-service", r -> r
						.path("/orders/**")
						.filters(f -> f.filter(jwtAuthenticationFilter).filter(loggingFilter))
						.uri(orderServiceUrl))

				// Payment Service Routes
				.route("payment-service", r -> r
						.path("/payments/**")
						.filters(f -> f.filter(jwtAuthenticationFilter).filter(loggingFilter))
						.uri(paymentServiceUrl))

				.build();
	}

}
