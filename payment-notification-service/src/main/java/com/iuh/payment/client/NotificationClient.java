package com.iuh.payment.client;

import com.iuh.payment.config.AppProperties.IntegrationProperties;
import com.iuh.payment.exception.IntegrationException;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class NotificationClient {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationClient.class);

    private final RestTemplate restTemplate;
    private final IntegrationProperties integrationProperties;

    public NotificationClient(RestTemplate restTemplate, IntegrationProperties integrationProperties) {
        this.restTemplate = restTemplate;
        this.integrationProperties = integrationProperties;
    }

    public void notifyPaymentSuccess(Long userId, Long orderId) {
        String message = "User " + userId + " da dat don #" + orderId + " thanh cong";
        String mode = integrationProperties.getNotification().getMode();

        if ("LOG".equalsIgnoreCase(mode)) {
            LOGGER.info("[NOTIFICATION] {}", message);
            return;
        }

        if ("REST".equalsIgnoreCase(mode)) {
            sendNotificationByRest(userId, orderId, message);
            return;
        }

        throw new IntegrationException("notification.mode khong hop le. Chi nhan LOG hoac REST");
    }

    private void sendNotificationByRest(Long userId, Long orderId, String message) {
        String endpoint = integrationProperties.getNotification().getEndpoint();
        if (!StringUtils.hasText(endpoint)) {
            throw new IntegrationException("notification.endpoint dang de trong khi mode=REST");
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", userId);
        payload.put("orderId", orderId);
        payload.put("message", message);

        try {
            ResponseEntity<Void> response = restTemplate.exchange(
                    endpoint,
                    HttpMethod.POST,
                    new HttpEntity<>(payload),
                    Void.class
            );
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new IntegrationException("Notification API tra ve ma loi: " + response.getStatusCode().value());
            }
        } catch (RestClientException ex) {
            throw new IntegrationException("Khong goi duoc Notification API", ex);
        }
    }
}
