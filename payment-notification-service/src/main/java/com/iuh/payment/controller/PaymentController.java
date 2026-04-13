package com.iuh.payment.controller;

import com.iuh.payment.dto.ApiResponse;
import com.iuh.payment.dto.NotificationResponse;
import com.iuh.payment.dto.PaymentCallbackRequest;
import com.iuh.payment.dto.PaymentRequest;
import com.iuh.payment.dto.PaymentResponse;
import com.iuh.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse createPayment(@Valid @RequestBody PaymentRequest request) {
        return paymentService.createPayment(request);
    }

    @PostMapping("/notification-events")
    public ApiResponse<NotificationResponse> handlePaymentCallback(
            @Valid @RequestBody PaymentCallbackRequest request) {
        NotificationResponse notification = paymentService.processPaymentCallback(request);
        return new ApiResponse<>(200, notification.getMessage(), notification);
    }
}
