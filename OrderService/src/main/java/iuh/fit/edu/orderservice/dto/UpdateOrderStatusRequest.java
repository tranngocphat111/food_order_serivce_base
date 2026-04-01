package iuh.fit.edu.orderservice.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateOrderStatusRequest(
    @NotBlank(message = "status is required")
    String status
) {
}