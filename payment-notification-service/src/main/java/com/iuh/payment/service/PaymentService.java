package com.iuh.payment.service;

import com.iuh.payment.client.NotificationClient;
import com.iuh.payment.client.OrderServiceClient;
import com.iuh.payment.client.OrderServiceClient.OrderSnapshot;
import com.iuh.payment.domain.Notification;
import com.iuh.payment.domain.PaymentRecord;
import com.iuh.payment.domain.PaymentStatus;
import com.iuh.payment.dto.NotificationResponse;
import com.iuh.payment.dto.PaymentCallbackRequest;
import com.iuh.payment.dto.PaymentRequest;
import com.iuh.payment.dto.PaymentResponse;
import com.iuh.payment.exception.IntegrationException;
import com.iuh.payment.repository.NotificationRepository;
import com.iuh.payment.repository.PaymentRepository;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private final OrderServiceClient orderServiceClient;
    private final NotificationClient notificationClient;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;

    public PaymentService(OrderServiceClient orderServiceClient,
                          NotificationClient notificationClient,
                          PaymentRepository paymentRepository,
                          NotificationRepository notificationRepository) {
        this.orderServiceClient = orderServiceClient;
        this.notificationClient = notificationClient;
        this.paymentRepository = paymentRepository;
        this.notificationRepository = notificationRepository;
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

    public NotificationResponse processPaymentCallback(PaymentCallbackRequest request) {
        boolean isSuccess = isSuccessStatus(request.getPaymentStatus());
        PaymentRecord payment = resolvePaymentRecord(request.getPaymentRef());
        String notificationType = isSuccess ? "PAYMENT_SUCCESS" : "PAYMENT_FAILED";
        String message = isSuccess
                ? "Thanh toan don hang #" + payment.getOrderCode() + " thanh cong"
                : "Thanh toan don hang #" + payment.getOrderCode() + " that bai";

        Notification notification = new Notification();
        notification.setUserId(payment.getUserId());
        notification.setOrderId(payment.getOrderId());
        notification.setPaymentId(payment.getId());
        notification.setType(notificationType);
        notification.setMessage(message);
        notification.setIsRead(Boolean.FALSE);
        notification.setCreatedAt(Instant.now());

        Notification saved = notificationRepository.save(notification);

        if (isSuccess) {
            orderServiceClient.markOrderPaid(payment.getOrderId());
        }

        NotificationResponse response = new NotificationResponse();
        response.setId(saved.getId());
        response.setUserId(saved.getUserId());
        response.setOrderId(saved.getOrderId());
        response.setPaymentId(saved.getPaymentId());
        response.setType(saved.getType());
        response.setMessage(saved.getMessage());
        response.setIsRead(saved.getIsRead());
        response.setCreatedAt(saved.getCreatedAt());
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

    private boolean isSuccessStatus(String paymentStatus) {
        if (paymentStatus == null) {
            return false;
        }
        String normalized = paymentStatus.trim().toUpperCase();
        return "PAYMENT_SUCCEED".equals(normalized) || "SUCCESS".equals(normalized);
    }

    private Long tryParseOrderId(String paymentRef) {
        if (paymentRef == null || paymentRef.isBlank()) {
            return null;
        }
        try {
            return Long.parseLong(paymentRef.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private PaymentRecord resolvePaymentRecord(String paymentRef) {
        if (paymentRef == null || paymentRef.isBlank()) {
            throw new IntegrationException("paymentRef is required");
        }

        Optional<PaymentRecord> byTransactionRef = paymentRepository
                .findTopByTransactionRefOrderByIdDesc(paymentRef.trim());
        if (byTransactionRef.isPresent()) {
            return byTransactionRef.get();
        }

        Long parsedOrderId = tryParseOrderId(paymentRef);
        if (parsedOrderId != null) {
            return paymentRepository.findTopByOrderIdOrderByIdDesc(parsedOrderId)
                    .orElseThrow(() -> new IntegrationException("Khong tim thay payment theo paymentRef/orderId"));
        }

        throw new IntegrationException("Khong tim thay payment theo paymentRef/orderId");
    }
}
