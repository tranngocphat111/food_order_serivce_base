package iuh.fit.edu.orderservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateOrderItemRequest(
    @NotNull(message = "foodId is required")
    Long foodId,
    @Min(value = 1, message = "quantity must be >= 1")
    int quantity
) {
}