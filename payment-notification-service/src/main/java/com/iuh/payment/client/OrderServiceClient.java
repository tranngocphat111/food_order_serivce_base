package com.iuh.payment.client;

import com.iuh.payment.config.AppProperties.IntegrationProperties;
import com.iuh.payment.domain.PaymentMethod;
import com.iuh.payment.exception.IntegrationException;
import java.util.HashMap;
import java.util.Map;
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

    public void markOrderPaid(Long orderId, PaymentMethod paymentMethod) {
        String url = integrationProperties.getOrderService().getBaseUrl()
                + integrationProperties.getOrderService().getUpdateStatusPath();

        Map<String, Object> request = new HashMap<>();
        request.put("status", "PAID");
        request.put("paymentMethod", paymentMethod.name());

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
                throw new IntegrationException("Order Service trả về mã lỗi: " + status.value());
            }
        } catch (RestClientException ex) {
            throw new IntegrationException("Không thể cập nhật trạng thái order sang PAID", ex);
        }
    }
}
