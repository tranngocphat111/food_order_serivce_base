package com.iuh.payment.dto;

import jakarta.validation.constraints.NotBlank;

public class PaymentCallbackRequest {

    @NotBlank(message = "paymentRef is required")
    private String paymentRef;

    @NotBlank(message = "paymentStatus is required")
    private String paymentStatus;

    public String getPaymentRef() {
        return paymentRef;
    }

    public void setPaymentRef(String paymentRef) {
        this.paymentRef = paymentRef;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
}