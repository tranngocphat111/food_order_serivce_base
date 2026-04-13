package com.foodorder.gateway.filter;

import com.foodorder.gateway.service.TokenVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferFactory;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

/**
 * JWT Authentication filter for verifying tokens before forwarding requests.
 * 
 * This filter:
 * - Extracts the JWT token from the Authorization header
 * - Validates the token by calling the USER-SERVICE /api/users/verify-token endpoint
 * - Returns 401 Unauthorized if token is missing or invalid
 * - Forwards the request if token is valid
 * 
 * @author Your Name
 * @version 1.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements GatewayFilter {

	private final TokenVerificationService tokenVerificationService;

	// Endpoints that do not require authentication
	private static final List<String> PUBLIC_ENDPOINTS = Arrays.asList(
			"/api/users/login",
			"/api/users/register",
			"/api/users/verify-token",
			"/api/v1/auth/refresh",
			"/health",
			"/actuator"
	);

	@Override
	public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
		ServerHttpRequest request = exchange.getRequest();
		String path = request.getPath().toString();
		HttpMethod method = request.getMethod();

		if (HttpMethod.OPTIONS.equals(method)) {
			return chain.filter(exchange);
		}

		// Check if endpoint is public
		if (isPublicEndpoint(path)) {
			log.debug("Public endpoint accessed: {}", path);
			return chain.filter(exchange);
		}

		String authHeader = request.getHeaders().getFirst("Authorization");

		// Check if Authorization header exists
		if (authHeader == null || authHeader.isEmpty()) {
			log.warn("Missing Authorization header for path: {}", path);
			return sendUnauthorized(exchange, "Missing Authorization header");
		}

		// Extract token from "Bearer <token>"
		String token = extractToken(authHeader);
		if (token == null) {
			log.warn("Invalid Authorization header format for path: {}", path);
			return sendUnauthorized(exchange, "Invalid Authorization header format");
		}

		log.debug("Token extracted for path: {}, token: {}...", path, token.substring(0, Math.min(20, token.length())));

		return tokenVerificationService.verifyToken(token)
				.flatMap(verificationResponse -> {
					if (verificationResponse != null && verificationResponse.isValid()) {
						return chain.filter(exchange);
					}

					String message = verificationResponse != null && verificationResponse.getMessage() != null
							? verificationResponse.getMessage()
							: "Invalid or expired token";
					log.warn("Token rejected for path: {} with message: {}", path, message);
					return sendUnauthorized(exchange, message);
				});
	}

	/**
	 * Checks if the requested path is a public endpoint that doesn't require authentication.
	 * 
	 * @param path The request path
	 * @return true if endpoint is public, false otherwise
	 */
	private boolean isPublicEndpoint(String path) {
		return PUBLIC_ENDPOINTS.stream()
				.anyMatch(path::startsWith);
	}

	/**
	 * Extracts the JWT token from the Authorization header.
	 * Expected format: "Bearer <token>"
	 * 
	 * @param authHeader The Authorization header value
	 * @return The token or null if not in expected format
	 */
	private String extractToken(String authHeader) {
		if (authHeader.startsWith("Bearer ")) {
			return authHeader.substring(7).trim();
		}
		return null;
	}

	/**
	 * Sends a 401 Unauthorized response.
	 * 
	 * @param exchange The server web exchange
	 * @param message The error message
	 * @return Mono<Void> representing the completed response
	 */
	private Mono<Void> sendUnauthorized(ServerWebExchange exchange, String message) {
		ServerHttpResponse response = exchange.getResponse();
		response.setStatusCode(HttpStatus.UNAUTHORIZED);
		response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

		String body = String.format("{\"statusCode\": 401, \"message\": \"%s\"}", message);
		DataBufferFactory bufferFactory = response.bufferFactory();
		DataBuffer buffer = bufferFactory.wrap(body.getBytes(java.nio.charset.StandardCharsets.UTF_8));
		return response.writeWith(Mono.just(buffer));
	}

}
