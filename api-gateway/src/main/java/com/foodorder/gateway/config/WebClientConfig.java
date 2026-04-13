package com.foodorder.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * WebClient configuration for making HTTP requests to other microservices.
 * 
 * This configuration is used by the JWT authentication filter to verify tokens
 * with the user service.
 * 
 * @author Your Name
 * @version 1.0.0
 */
@Configuration
public class WebClientConfig {

	/**
	 * Creates a WebClient bean with custom timeout and connection pool settings.
	 * 
	 * Configuration:
	 * - Connection timeout: 5 seconds
	 * - Read timeout: 10 seconds
	 * - Write timeout: 10 seconds
	 * - Max connections per route: 500
	 * - Max pending acquisitions: 1000
	 * - Connection time-to-live: 30 seconds
	 * 
	 * @return Configured WebClient bean
	 */
	@Bean
	public WebClient webClient() {
		// Create connection provider with pool settings
		ConnectionProvider connectionProvider = ConnectionProvider.builder("custom")
				.maxConnections(500)
				.maxIdleTime(Duration.ofSeconds(20))
				.maxLifeTime(Duration.ofSeconds(30))
				.pendingAcquireMaxCount(1000)
				.build();
		
		// Configure HttpClient with timeouts
		HttpClient httpClient = HttpClient.create(connectionProvider)
				.responseTimeout(Duration.ofSeconds(10))
				.option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)
				.option(ChannelOption.SO_KEEPALIVE, true)
				.doOnConnected(conn -> conn
						.addHandlerLast(new ReadTimeoutHandler(10, TimeUnit.SECONDS))
						.addHandlerLast(new WriteTimeoutHandler(10, TimeUnit.SECONDS)));
		
		return WebClient.builder()
				.clientConnector(new ReactorClientHttpConnector(httpClient))
				.build();
	}

}
