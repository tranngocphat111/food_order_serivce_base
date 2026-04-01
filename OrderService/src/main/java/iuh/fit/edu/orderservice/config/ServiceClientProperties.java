package iuh.fit.edu.orderservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "external")
public class ServiceClientProperties {

    private ServiceConfig userService;
    private ServiceConfig foodService;

    public ServiceConfig getUserService() {
        return userService;
    }

    public void setUserService(ServiceConfig userService) {
        this.userService = userService;
    }

    public ServiceConfig getFoodService() {
        return foodService;
    }

    public void setFoodService(ServiceConfig foodService) {
        this.foodService = foodService;
    }

    public static class ServiceConfig {

        private String baseUrl;

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }
    }
}