package com.foodorder.user.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.foodorder.user.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthCompatController {

    private final UserService userService;

    @GetMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {

        String token = extractBearerToken(authorizationHeader);
        String newAccessToken = userService.refreshAccessToken(token);

        if (newAccessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "statusCode", 401,
                            "message", "Unable to refresh access token"));
        }

        return ResponseEntity.ok(Map.of(
                "statusCode", 200,
                "message", "Refresh token successful",
                "data", Map.of("access_token", newAccessToken)));
    }

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return null;
        }
        if (authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7).trim();
        }
        return authorizationHeader.trim();
    }
}
