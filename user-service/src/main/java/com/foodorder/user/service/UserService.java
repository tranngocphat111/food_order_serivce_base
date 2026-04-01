package com.foodorder.user.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.foodorder.user.dto.AuthResponse;
import com.foodorder.user.dto.LoginRequest;
import com.foodorder.user.dto.RegisterRequest;
import com.foodorder.user.dto.TokenVerifyResponse;
import com.foodorder.user.dto.UserResponse;
import com.foodorder.user.entity.User;
import com.foodorder.user.entity.UserRole;
import com.foodorder.user.repository.UserRepository;
import com.foodorder.user.util.JwtTokenProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistService tokenBlacklistService;

    /**
     * Register new user
     */
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering user with username: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Username already exists")
                    .build();
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Email already exists")
                    .build();
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Passwords do not match")
                    .build();
        }

        if (request.getPassword().length() < 6) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Password must be at least 6 characters")
                    .build();
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(UserRole.USER)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with id: {}", savedUser.getId());

        String token = jwtTokenProvider.generateToken(savedUser);

        return AuthResponse.builder()
                .success(true)
                .message("User registered successfully")
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .token(token)
                .build();
    }

    /**
     * Login user
     */
    public AuthResponse login(LoginRequest request) {
        log.info("Logging in user with username: {}", request.getUsername());

        User user = userRepository.findByUsername(request.getUsername())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Invalid credentials for username: {}", request.getUsername());
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid username or password")
                    .build();
        }

        if (!user.getIsActive()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("User account is inactive")
                    .build();
        }

        log.info("User logged in successfully: {}", user.getUsername());

        String token = jwtTokenProvider.generateToken(user);

        return AuthResponse.builder()
                .success(true)
                .message("Login successful")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .token(token)
                .build();
    }

    /**
     * Get all users
     */
    public List<UserResponse> getAllUsers() {
        log.info("Fetching all users");
        return userRepository.findAll()
                .stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get user by id
     */
    public UserResponse getUserById(Long id) {
        log.info("Fetching user with id: {}", id);
        User user = userRepository.findById(id).orElse(null);
        if (user != null) {
            return convertToUserResponse(user);
        }
        return null;
    }

    /**
     * Get user by username
     */
    public UserResponse getUserByUsername(String username) {
        log.info("Fetching user with username: {}", username);
        User user = userRepository.findByUsername(username).orElse(null);
        if (user != null) {
            return convertToUserResponse(user);
        }
        return null;
    }

    /**
     * Verify token and return details
     */
    public TokenVerifyResponse verifyToken(String token) {
        log.info("Verifying token");

        if (tokenBlacklistService.isTokenBlacklisted(token)) {
            return TokenVerifyResponse.builder()
                    .valid(false)
                    .message("Token has been blacklisted (user logged out)")
                    .build();
        }

        if (!jwtTokenProvider.validateToken(token)) {
            return TokenVerifyResponse.builder()
                    .valid(false)
                    .message("Invalid or expired token")
                    .build();
        }

        try {
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            String username = jwtTokenProvider.getUsernameFromToken(token);
            String email = jwtTokenProvider.getEmailFromToken(token);
            String role = jwtTokenProvider.getRoleFromToken(token);

            return TokenVerifyResponse.builder()
                    .valid(true)
                    .userId(userId)
                    .username(username)
                    .email(email)
                    .role(role)
                    .message("Token is valid")
                    .build();
        } catch (Exception e) {
            log.error("Error verifying token: {}", e.getMessage());
            return TokenVerifyResponse.builder()
                    .valid(false)
                    .message("Error verifying token")
                    .build();
        }
    }

    /**
     * Logout - blacklist token
     */
    public void logout(String token) {
        log.info("Logging out user - blacklisting token");
        tokenBlacklistService.blacklistToken(token);
    }

    /**
     * Convert User entity to UserResponse DTO
     */
    private UserResponse convertToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
