package com.foodorder.user.dto;

import java.time.LocalDateTime;

import com.foodorder.user.entity.UserRole;

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
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private UserRole role;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
