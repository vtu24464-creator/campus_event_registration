package com.campusx.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JwtUtil — generates and validates JSON Web Tokens.
 * Mirrors the Node.js jsonwebtoken logic: HS256, subject = userId.
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationMs; // 604800000 = 7 days

    // ── Generate token ────────────────────────────────────────
    public String generateToken(Long userId, String email, String firstName, String lastName, String avatarInitials) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("first_name", firstName)
                .claim("last_name", lastName)
                .claim("avatar_initials", avatarInitials)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getKey())
                .compact();
    }

    // ── Extract user ID from token ────────────────────────────
    public Long extractUserId(String token) {
        return Long.parseLong(parseClaims(token).getSubject());
    }

    // ── Validate token ────────────────────────────────────────
    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // ── Internal helpers ──────────────────────────────────────
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getKey() {
        // If secret is hex (64+ chars), decode as bytes; otherwise use UTF-8 bytes
        byte[] keyBytes = secret.length() >= 64
                ? hexToBytes(secret)
                : secret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private byte[] hexToBytes(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }
}
