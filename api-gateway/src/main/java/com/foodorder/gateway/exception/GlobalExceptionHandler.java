package com.foodorder.gateway.exception;

import java.nio.charset.StandardCharsets;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Global exception handler for the API Gateway.
 */
@Slf4j
@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalExceptionHandler implements ErrorWebExceptionHandler {

	@Override
	public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
		HttpStatus httpStatus = resolveStatus(ex);
		String message = resolveMessage(ex);

		log.error("Unhandled exception in gateway: {} - Message: {}", ex.getClass().getName(), message, ex);

		exchange.getResponse().setStatusCode(httpStatus);
		exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

		String errorJson = String.format(
				"{\"statusCode\": %d, \"message\": \"%s\", \"timestamp\": %d}",
				httpStatus.value(),
				escapeJson(message),
				System.currentTimeMillis());

		DataBufferFactory bufferFactory = exchange.getResponse().bufferFactory();
		DataBuffer buffer = bufferFactory.wrap(errorJson.getBytes(StandardCharsets.UTF_8));
		return exchange.getResponse().writeWith(Mono.just(buffer));
	}

	private HttpStatus resolveStatus(Throwable ex) {
		if (ex instanceof IllegalArgumentException) {
			return HttpStatus.BAD_REQUEST;
		}
		if (ex instanceof SecurityException) {
			return HttpStatus.FORBIDDEN;
		}
		return HttpStatus.INTERNAL_SERVER_ERROR;
	}

	private String resolveMessage(Throwable ex) {
		return ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred";
	}

	private String escapeJson(String text) {
		return text
				.replace("\\", "\\\\")
				.replace("\"", "\\\"")
				.replace("\n", "\\n")
				.replace("\r", "\\r")
				.replace("\t", "\\t");
	}
}
