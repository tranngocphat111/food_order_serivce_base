package com.foodorder.user.service;

import java.time.LocalDateTime;
import java.time.Instant;

import org.springframework.stereotype.Service;

import com.foodorder.user.entity.TokenBlacklist;
import com.foodorder.user.repository.TokenBlacklistRepository;
import com.foodorder.user.util.JwtTokenProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {
    private final TokenBlacklistRepository tokenBlacklistRepository;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Add token to blacklist (on logout)
     */
    public void blacklistToken(String token) {
        try {
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            Long expirationTime = jwtTokenProvider.getExpirationTimeFromToken(token);
            LocalDateTime expiresAt = LocalDateTime.ofInstant(
                Instant.ofEpochMilli(expirationTime),
                java.time.ZoneId.systemDefault()
            );

            TokenBlacklist blacklist = TokenBlacklist.builder()
                    .token(token)
                    .userId(userId)
                    .blacklistedAt(LocalDateTime.now())
                    .expiresAt(expiresAt)
                    .build();

            tokenBlacklistRepository.save(blacklist);
            log.info("Token blacklisted for user ID: {}", userId);
        } catch (Exception e) {
            log.error("Error blacklisting token: {}", e.getMessage());
        }
    }

    /**
     * Check if token is blacklisted
     */
    public boolean isTokenBlacklisted(String token) {
        return tokenBlacklistRepository.existsByToken(token);
    }

    /**
     * Clean expired tokens from blacklist
     */
    public void cleanExpiredTokens() {
        // This can be scheduled with @Scheduled
        log.info("Cleaning expired tokens from blacklist");
    }
}
