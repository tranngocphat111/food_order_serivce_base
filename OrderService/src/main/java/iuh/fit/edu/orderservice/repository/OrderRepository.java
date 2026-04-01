package iuh.fit.edu.orderservice.repository;

import iuh.fit.edu.orderservice.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
    long countByOrderCodeStartingWith(String prefix);
}
