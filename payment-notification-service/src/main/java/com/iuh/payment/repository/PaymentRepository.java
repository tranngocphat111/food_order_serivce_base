package com.iuh.payment.repository;

import com.iuh.payment.domain.PaymentRecord;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<PaymentRecord, Long> {
	Optional<PaymentRecord> findTopByOrderIdOrderByIdDesc(Long orderId);

	Optional<PaymentRecord> findTopByTransactionRefOrderByIdDesc(String transactionRef);
}
