package com.foodorder.gateway.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Standard API response wrapper for all gateway responses.
 * 
 * @param <T> The type of data in the response
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    
    private Integer statusCode;
    private String message;
    private T data;
    private Long timestamp;
    
    /**
     * Creates a success response.
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .statusCode(200)
                .message("Success")
                .data(data)
                .timestamp(System.currentTimeMillis())
                .build();
    }
    
    /**
     * Creates a success response with custom message.
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .statusCode(200)
                .message(message)
                .data(data)
                .timestamp(System.currentTimeMillis())
                .build();
    }
    
    /**
     * Creates an error response.
     */
    public static <T> ApiResponse<T> error(Integer statusCode, String message) {
        return ApiResponse.<T>builder()
                .statusCode(statusCode)
                .message(message)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}
