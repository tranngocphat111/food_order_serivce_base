package com.foodorder.user.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.foodorder.user.dto.AuthResponse;
import com.foodorder.user.dto.LoginRequest;
import com.foodorder.user.dto.RegisterRequest;
import com.foodorder.user.dto.TokenVerifyResponse;
import com.foodorder.user.dto.UserResponse;
import com.foodorder.user.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping(value = "/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    private final UserService userService;

    /**
     * Register new user
     * POST /api/users/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        log.info("Register endpoint called for username: {}", request.getUsername());
        AuthResponse response = userService.register(request);
        return ResponseEntity.status(response.getSuccess() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST)
                .body(response);
    }

    /**
     * Login user
     * POST /api/users/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        log.info("Login endpoint called for username: {}", request.getUsername());
        AuthResponse response = userService.login(request);
        return ResponseEntity.status(response.getSuccess() ? HttpStatus.OK : HttpStatus.UNAUTHORIZED)
                .body(response);
    }

    /**
     * Logout user - blacklist token
     * POST /api/users/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String authHeader) {
        log.info("Logout endpoint called");
        try {
            String token = authHeader.replace("Bearer ", "").trim();
            userService.logout(token);
            return ResponseEntity.ok("Logged out successfully");
        } catch (Exception e) {
            log.error("Error logging out: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error logging out: " + e.getMessage());
        }
    }

    /**
     * Get all users
     * GET /api/users
     */
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        log.info("Get all users endpoint called");
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get user by id
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        log.info("Get user by id endpoint called for id: {}", id);
        UserResponse user = userService.getUserById(id);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Get user by username
     * GET /api/users/username/{username}
     */
    @GetMapping("/username/{username}")
    public ResponseEntity<UserResponse> getUserByUsername(@PathVariable String username) {
        log.info("Get user by username endpoint called for username: {}", username);
        UserResponse user = userService.getUserByUsername(username);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Verify token with details
     * POST /api/users/verify-token
     * Can be called by other services to validate tokens
     *
     * Request body: { "token": "eyJhbGc..." }
     * Response: { "valid": true, "userId": 1, "username": "john", "email": "john@example.com", "role": "USER", "message": "Token is valid" }
     */
    @PostMapping("/verify-token")
    public ResponseEntity<TokenVerifyResponse> verifyToken(@RequestBody String token) {
        log.info("Verify token endpoint called");
        TokenVerifyResponse response = userService.verifyToken(token.trim());
        return ResponseEntity.ok(response);
    }
}

