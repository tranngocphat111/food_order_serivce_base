package com.foodorder.gateway.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import com.foodorder.gateway.dto.TokenVerifyResponse;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenVerificationService {

	private final WebClient webClient;

	@Value("${gateway.auth.service-url}")
	private String userServiceUrl;

	@Value("${gateway.auth.verify-token-endpoint}")
	private String verifyTokenEndpoint;

	    /**
	     * Verifies if the provided JWT token is valid by calling the USER-SERVICE.
	     * 
	     * @param token The JWT token to verify
	     * @return Mono<TokenVerifyResponse> containing verification result
	     */
	    public Mono<TokenVerifyResponse> verifyToken(String token) {
		String url = userServiceUrl + verifyTokenEndpoint;

		log.debug("Verifying token with USER-SERVICE at: {}", url);

		return webClient.post()
			.uri(url)
			.contentType(MediaType.TEXT_PLAIN)
			.bodyValue(token)
			.exchangeToMono(response -> {
			    if (response.statusCode().is2xxSuccessful()) {
				return response.bodyToMono(TokenVerifyResponse.class);
			    }
			    return response.bodyToMono(String.class)
				    .defaultIfEmpty("Token verification failed")
				    .map(message -> TokenVerifyResponse.builder()
					    .valid(false)
					    .message(message)
					    .build());
			})
			.doOnSuccess(response -> log.debug("Token verification result received: valid={}", response != null && response.isValid()))
			.doOnError(error -> log.error("Token verification failed: {}", error.getMessage()))
			.onErrorReturn(TokenVerifyResponse.builder()
				.valid(false)
				.message("Token verification failed")
				.build());
	    }

	/**
	 * Extracts the Bearer token from the Authorization header.
	 * 
	 * Format: "Bearer <token>"
	 * 
	 * @param authHeader The Authorization header value
	 * @return The token or null if not in expected format
	 */
	public String extractBearerToken(String authHeader) {
		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			String token = authHeader.substring(7).trim();
			log.debug("Bearer token extracted successfully");
			return token;
		}
		log.warn("Invalid or missing Bearer token in Authorization header");
		return null;
	}

}
