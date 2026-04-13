package iuh.fit.edu.orderservice.service;

import iuh.fit.edu.orderservice.config.ServiceClientProperties;
import iuh.fit.edu.orderservice.exception.BadRequestException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class ExternalServiceClient {

    private final RestTemplate restTemplate;
    private final ServiceClientProperties serviceClientProperties;

    public ExternalServiceClient(RestTemplate restTemplate, ServiceClientProperties serviceClientProperties) {
        this.restTemplate = restTemplate;
        this.serviceClientProperties = serviceClientProperties;
    }

    public UserInfo findUserById(Long userId) {
        String url = serviceClientProperties.getUserService().getBaseUrl() + "/api/users";
        List<Map<String, Object>> users = fetchList(url, "Cannot validate user from User Service");
        for (Map<String, Object> user : users) {
            Long id = getAsLong(user, Set.of("id", "userId"));
            if (id != null && userId.equals(id)) {
                String fullName = getAsString(user, Set.of("fullName", "full_name", "name", "username"));
                return new UserInfo(id, fullName);
            }
        }
        return null;
    }

    public Map<Long, FoodInfo> findFoodsByIds(Set<Long> foodIds) {
        String url = serviceClientProperties.getFoodService().getBaseUrl() + "/foods";
        List<Map<String, Object>> foods = fetchList(url, "Cannot load foods from Food Service");
        Map<Long, FoodInfo> result = new HashMap<>();
        Set<Long> normalizedIds = new HashSet<>(foodIds);

        for (Map<String, Object> food : foods) {
            Long id = getAsLong(food, Set.of("id", "foodId"));
            if (id == null || !normalizedIds.contains(id)) {
                continue;
            }
            String name = getAsString(food, Set.of("name", "foodName", "title"));
            BigDecimal price = getAsDecimal(food, Set.of("price", "unitPrice"));
            result.put(id, new FoodInfo(id, name, price));
        }

        return result;
    }

    private List<Map<String, Object>> fetchList(String url, String errorMessage) {
        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {
                }
            );
            List<Map<String, Object>> body = response.getBody();
            if (body == null) {
                throw new BadRequestException(errorMessage + ": empty response");
            }
            return body;
        } catch (RestClientException ex) {
            try {
                ResponseEntity<Map<String, Object>> wrappedResponse = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {
                    }
                );
                Object data = wrappedResponse.getBody() != null ? wrappedResponse.getBody().get("data") : null;
                if (data instanceof List<?> rawList) {
                    List<Map<String, Object>> mapped = rawList.stream()
                        .filter(Map.class::isInstance)
                        .map(item -> (Map<String, Object>) item)
                        .toList();
                    return mapped;
                }
            } catch (RestClientException ignored) {
                // Fall through to final error below.
            }
            throw new BadRequestException(errorMessage + ": " + ex.getMessage());
        }
    }

    private String getAsString(Map<String, Object> map, Set<String> keys) {
        for (String key : keys) {
            Object value = map.get(key);
            if (value != null) {
                return String.valueOf(value);
            }
        }
        return null;
    }

    private Long getAsLong(Map<String, Object> map, Set<String> keys) {
        for (String key : keys) {
            Object value = map.get(key);
            if (value != null) {
                try {
                    return Long.parseLong(String.valueOf(value));
                } catch (NumberFormatException ex) {
                    return null;
                }
            }
        }
        return null;
    }

    private BigDecimal getAsDecimal(Map<String, Object> map, Set<String> keys) {
        for (String key : keys) {
            Object value = map.get(key);
            if (value != null) {
                try {
                    return new BigDecimal(String.valueOf(value));
                } catch (NumberFormatException ex) {
                    throw new BadRequestException("Invalid price format from Food Service");
                }
            }
        }
        throw new BadRequestException("Food data missing price field");
    }

    public record UserInfo(Long id, String fullName) {
    }

    public record FoodInfo(Long id, String name, BigDecimal price) {
    }
}