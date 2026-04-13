package com.foodorder.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Instant;

/**
 * Logging filter for tracking all incoming and outgoing requests through the gateway.
 * 
 * This filter:
 * - Logs incoming requests with method, path, and query parameters
 * - Logs response status and processing time
 * - Can be used for monitoring and debugging
 * 
 * @author Your Name
 * @version 1.0.0
 */
@Slf4j
@Component
public class LoggingFilter implements GatewayFilter {

	@Override
	public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
		ServerHttpRequest request = exchange.getRequest();
		
		long startTime = Instant.now().toEpochMilli();
		String method = request.getMethod().toString();
		String path = request.getPath().toString();
		String queryParams = request.getQueryParams().isEmpty() ? "" : "?" + request.getQueryParams().toString();

		log.info(">>> [INCOMING] {} {} {}", method, path, queryParams);
		
		// Log request headers (be careful with sensitive data)
		request.getHeaders().forEach((headerName, headerValues) -> {
			if (!headerName.toLowerCase().contains("authorization")) {
				log.debug("    Header: {} = {}", headerName, headerValues);
			}
		});

		return chain.filter(exchange).then(Mono.fromRunnable(() -> {
			long endTime = Instant.now().toEpochMilli();
			long duration = endTime - startTime;
			
			int statusCode = exchange.getResponse().getStatusCode() != null 
					? exchange.getResponse().getStatusCode().value() 
					: 0;

			log.info("<<< [RESPONSE] {} {} {} ({}ms)", 
					statusCode, method, path, duration);
		}));
	}

}
