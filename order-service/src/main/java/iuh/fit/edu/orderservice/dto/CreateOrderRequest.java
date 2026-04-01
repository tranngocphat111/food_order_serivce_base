package iuh.fit.edu.orderservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CreateOrderRequest(
    @NotNull(message = "userId is required")
    Long userId,
    @NotEmpty(message = "items must not be empty")
    @Valid
    List<CreateOrderItemRequest> items,
    String note,
    String deliveryAddress
) {
}