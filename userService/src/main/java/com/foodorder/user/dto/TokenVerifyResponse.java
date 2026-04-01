package com.foodorder.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenVerifyResponse {
    private boolean valid;
    private Long userId;
    private String username;
    private String email;
    private String role;
    private String message;
}
