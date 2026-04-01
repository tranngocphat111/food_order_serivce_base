package iuh.fit.edu.orderservice.dto;

import iuh.fit.edu.orderservice.model.Order;
import iuh.fit.edu.orderservice.model.OrderItem;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
    Long id,
    String orderCode,
    Long userId,
    String userName,
    List<OrderItem> items,
    BigDecimal totalAmount,
    String status,
    String note,
    String deliveryAddress,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {

    public static OrderResponse from(Order order) {
        return new OrderResponse(
            order.getId(),
            order.getOrderCode(),
            order.getUserId(),
            order.getUserName(),
            order.getItems(),
            order.getTotalAmount(),
            order.getStatus().name(),
            order.getNote(),
            order.getDeliveryAddress(),
            order.getCreatedAt(),
            order.getUpdatedAt()
        );
    }
}