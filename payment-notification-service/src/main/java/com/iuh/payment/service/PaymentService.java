package com.iuh.payment.service;

import com.iuh.payment.client.NotificationClient;
import com.iuh.payment.client.OrderServiceClient;
import com.iuh.payment.domain.PaymentRecord;
import com.iuh.payment.domain.PaymentStatus;
import com.iuh.payment.dto.PaymentRequest;
import com.iuh.payment.dto.PaymentResponse;
import com.iuh.payment.repository.PaymentRepository;
import java.time.Instant;
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
        orderServiceClient.markOrderPaid(request.getOrderId(), request.getPaymentMethod());

        PaymentRecord record = new PaymentRecord();
        record.setOrderId(request.getOrderId());
        record.setUserId(request.getUserId());
        record.setMethod(request.getPaymentMethod());
        record.setStatus(PaymentStatus.SUCCESS);
        record.setPaidAt(Instant.now());
        record.setMessage("Thanh toan thanh cong");

        PaymentRecord saved = paymentRepository.save(record);

        notificationClient.notifyPaymentSuccess(saved.getUserId(), saved.getOrderId());

        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(saved.getId());
        response.setOrderId(saved.getOrderId());
        response.setUserId(saved.getUserId());
        response.setPaymentMethod(saved.getMethod());
        response.setPaymentStatus(saved.getStatus());
        response.setPaidAt(saved.getPaidAt());
        response.setMessage(saved.getMessage());

        return response;
    }
}
