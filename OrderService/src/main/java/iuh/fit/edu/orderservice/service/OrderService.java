package iuh.fit.edu.orderservice.service;

import iuh.fit.edu.orderservice.dto.CreateOrderItemRequest;
import iuh.fit.edu.orderservice.dto.CreateOrderRequest;
import iuh.fit.edu.orderservice.exception.BadRequestException;
import iuh.fit.edu.orderservice.exception.NotFoundException;
import iuh.fit.edu.orderservice.model.Order;
import iuh.fit.edu.orderservice.model.OrderItem;
import iuh.fit.edu.orderservice.model.OrderStatus;
import iuh.fit.edu.orderservice.repository.OrderRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ExternalServiceClient externalServiceClient;

    public OrderService(OrderRepository orderRepository, ExternalServiceClient externalServiceClient) {
        this.orderRepository = orderRepository;
        this.externalServiceClient = externalServiceClient;
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        ExternalServiceClient.UserInfo user = externalServiceClient.findUserById(request.userId());
        if (user == null) {
            throw new NotFoundException("User not found: " + request.userId());
        }

        Set<Long> foodIds = request.items().stream()
            .map(CreateOrderItemRequest::foodId)
            .collect(java.util.stream.Collectors.toSet());

        Map<Long, ExternalServiceClient.FoodInfo> foodMap = externalServiceClient.findFoodsByIds(foodIds);
        List<Long> missingFoodIds = foodIds.stream().filter(id -> !foodMap.containsKey(id)).toList();
        if (!missingFoodIds.isEmpty()) {
            String missing = missingFoodIds.stream().map(String::valueOf).collect(java.util.stream.Collectors.joining(", "));
            throw new NotFoundException("Foods not found: " + missing);
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CreateOrderItemRequest itemRequest : request.items()) {
            ExternalServiceClient.FoodInfo food = foodMap.get(itemRequest.foodId());
            BigDecimal subtotal = food.price().multiply(BigDecimal.valueOf(itemRequest.quantity()));
            totalAmount = totalAmount.add(subtotal);
            OrderItem orderItem = new OrderItem();
            orderItem.setFoodId(food.id());
            orderItem.setFoodName(food.name());
            orderItem.setQuantity(itemRequest.quantity());
            orderItem.setUnitPrice(food.price());
            orderItem.setSubtotal(subtotal);
            orderItems.add(orderItem);
        }

        LocalDateTime now = LocalDateTime.now();
        Order order = new Order();
        order.setOrderCode(generateOrderCode(now));
        order.setUserId(request.userId());
        order.setUserName(user.fullName());
        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.PENDING);
        order.setNote(request.note());
        order.setDeliveryAddress(request.deliveryAddress());
        order.setCreatedAt(now);
        order.setUpdatedAt(now);
        order.setItems(orderItems);

        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public List<Order> getOrders() {
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @Transactional(readOnly = true)
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
            .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));
    }

    @Transactional
    public Order updateStatus(Long orderId, String status) {
        Order order = getOrderById(orderId);
        OrderStatus nextStatus = parseOrderStatus(status);
        order.setStatus(nextStatus);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    private String generateOrderCode(LocalDateTime now) {
        String datePart = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "ORD-" + datePart + "-";
        long sequence = orderRepository.countByOrderCodeStartingWith(prefix) + 1;
        return prefix + String.format("%03d", sequence);
    }

    private OrderStatus parseOrderStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            throw new BadRequestException("status is required");
        }
        try {
            return OrderStatus.valueOf(rawStatus.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid status. Allowed values: PENDING, CONFIRMED, PREPARING, READY, DELIVERED, CANCELLED");
        }
    }
}