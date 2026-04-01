package com.iuh.payment.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Cors cors = new Cors();

    public Cors getCors() {
        return cors;
    }

    public static class Cors {

        @NotEmpty
        private List<String> allowedOrigins = new ArrayList<>();

        public List<String> getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(List<String> allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }

    @Validated
    @ConfigurationProperties(prefix = "integration")
    public static class IntegrationProperties {

        private final OrderService orderService = new OrderService();
        private final Notification notification = new Notification();

        public OrderService getOrderService() {
            return orderService;
        }

        public Notification getNotification() {
            return notification;
        }

        public static class OrderService {

            @NotBlank
            private String baseUrl;

            @NotBlank
            private String updateStatusPath;

            public String getBaseUrl() {
                return baseUrl;
            }

            public void setBaseUrl(String baseUrl) {
                this.baseUrl = baseUrl;
            }

            public String getUpdateStatusPath() {
                return updateStatusPath;
            }

            public void setUpdateStatusPath(String updateStatusPath) {
                this.updateStatusPath = updateStatusPath;
            }
        }

        public static class Notification {

            @NotBlank
            private String mode;

            private String endpoint;

            public String getMode() {
                return mode;
            }

            public void setMode(String mode) {
                this.mode = mode;
            }

            public String getEndpoint() {
                return endpoint;
            }

            public void setEndpoint(String endpoint) {
                this.endpoint = endpoint;
            }
        }
    }
}
