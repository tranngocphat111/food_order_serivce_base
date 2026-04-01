package iuh.fit.edu.orderservice.repository;

import iuh.fit.edu.orderservice.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
