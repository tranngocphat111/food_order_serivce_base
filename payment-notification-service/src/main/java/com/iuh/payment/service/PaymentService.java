package com.iuh.payment.service;

import com.iuh.payment.client.NotificationClient;
import com.iuh.payment.client.OrderServiceClient;
import com.iuh.payment.client.OrderServiceClient.OrderSnapshot;
import com.iuh.payment.domain.PaymentRecord;
import com.iuh.payment.domain.PaymentStatus;
import com.iuh.payment.dto.PaymentRequest;
import com.iuh.payment.dto.PaymentResponse;
import com.iuh.payment.exception.IntegrationException;
import com.iuh.payment.repository.PaymentRepository;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private final OrderServiceClient orderServiceClient;
    private final NotificationClient notificationClient;
    private final PaymentRepository paymentRepository;

    public PaymentService(OrderServiceClient orderServiceClient,
                          NotificationClient notificationClient,
                          PaymentRepository paymentRepository) {
        this.orderServiceClient = orderServiceClient;
        this.notificationClient = notificationClient;
        this.paymentRepository = paymentRepository;
    }

    public PaymentResponse createPayment(PaymentRequest request) {
        OrderSnapshot orderSnapshot = orderServiceClient.getOrderSnapshot(request.getOrderId());

        if (!orderSnapshot.userId().equals(request.getUserId())) {
            throw new IntegrationException("User id does not match the owner of this order");
        }

        orderServiceClient.markOrderPaid(request.getOrderId());

        PaymentRecord record = new PaymentRecord();
        record.setPaymentCode(generatePaymentCode(request.getOrderId()));
        record.setOrderId(request.getOrderId());
        record.setOrderCode(orderSnapshot.orderCode());
        record.setUserId(orderSnapshot.userId());
        record.setAmount(orderSnapshot.totalAmount());
        record.setPaymentMethod(request.getPaymentMethod());
        record.setStatus(PaymentStatus.SUCCESS);
        record.setTransactionRef(generateTransactionRef(request.getPaymentMethod().name(), request.getOrderId()));
        record.setNote("Thanh toan thanh cong");
        record.setPaidAt(Instant.now());

        PaymentRecord saved = paymentRepository.save(record);

        notificationClient.notifyPaymentSuccess(saved.getUserId(), saved.getOrderId());

        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(saved.getId());
        response.setPaymentCode(saved.getPaymentCode());
        response.setOrderId(saved.getOrderId());
        response.setOrderCode(saved.getOrderCode());
        response.setUserId(saved.getUserId());
        response.setAmount(saved.getAmount());
        response.setPaymentMethod(saved.getPaymentMethod());
        response.setPaymentStatus(saved.getStatus());
        response.setTransactionRef(saved.getTransactionRef());
        response.setNote(saved.getNote());
        response.setPaidAt(saved.getPaidAt());
        response.setMessage(saved.getNote());
        return response;
    }

    private String generatePaymentCode(Long orderId) {
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "PAY-" + ts + "-" + orderId;
    }

    private String generateTransactionRef(String method, Long orderId) {
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return method + "-" + orderId + "-" + ts;
    }
}
