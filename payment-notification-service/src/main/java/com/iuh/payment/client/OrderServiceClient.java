package com.iuh.payment.client;

import com.iuh.payment.config.AppProperties.IntegrationProperties;
import com.iuh.payment.exception.IntegrationException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class OrderServiceClient {

    private final RestTemplate restTemplate;
    private final IntegrationProperties integrationProperties;

    public OrderServiceClient(RestTemplate restTemplate, IntegrationProperties integrationProperties) {
        this.restTemplate = restTemplate;
        this.integrationProperties = integrationProperties;
    }

    public OrderSnapshot getOrderSnapshot(Long orderId) {
        String url = integrationProperties.getOrderService().getBaseUrl()
                + integrationProperties.getOrderService().getGetOrderPath();

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {
                    },
                    Map.of("orderId", orderId)
            );

            Map<String, Object> body = response.getBody();
            if (body == null) {
                throw new IntegrationException("Order Service returned empty order response");
            }

            String orderCode = asString(body.get("orderCode"));
            BigDecimal totalAmount = asBigDecimal(body.get("totalAmount"));
            Long userId = asLong(body.get("userId"));

            if (orderCode == null || totalAmount == null || userId == null) {
                throw new IntegrationException("Order Service response missing orderCode/totalAmount/userId");
            }

            return new OrderSnapshot(orderId, orderCode, userId, totalAmount);
        } catch (RestClientException ex) {
            throw new IntegrationException("Unable to fetch order details from Order Service", ex);
        }
    }

    public void markOrderPaid(Long orderId) {
        String url = integrationProperties.getOrderService().getBaseUrl()
                + integrationProperties.getOrderService().getUpdateStatusPath();

        Map<String, Object> request = new HashMap<>();
        request.put("status", "CONFIRMED");

        Map<String, Long> uriVars = Map.of("orderId", orderId);

        try {
            ResponseEntity<Void> response = restTemplate.exchange(
                    url,
                    HttpMethod.PUT,
                    new HttpEntity<>(request),
                    Void.class,
                    uriVars
            );
            HttpStatusCode status = response.getStatusCode();
            if (!status.is2xxSuccessful()) {
                throw new IntegrationException("Order Service returned error status: " + status.value());
            }
        } catch (RestClientException ex) {
            throw new IntegrationException("Unable to update order status to CONFIRMED", ex);
        }
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Long asLong(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private BigDecimal asBigDecimal(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return new BigDecimal(String.valueOf(value));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    public record OrderSnapshot(Long orderId, String orderCode, Long userId, BigDecimal totalAmount) {
    }
}
