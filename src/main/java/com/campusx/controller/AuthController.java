package com.campusx.controller;

import com.campusx.config.JwtUtil;
import com.campusx.dto.AuthResponse;
import com.campusx.dto.LoginRequest;
import com.campusx.dto.RegisterRequest;
import com.campusx.entity.ActivityLog;
import com.campusx.entity.User;
import com.campusx.repository.ActivityLogRepository;
import com.campusx.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * AuthController — mirrors Node.js routes/auth.js
 * POST /api/auth/register
 * POST /api/auth/login
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepo;
    @Autowired
    private ActivityLogRepository activityLogRepo;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    // ── POST /api/auth/register ───────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {

        if (req.getFirstName() == null || req.getFirstName().isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "All fields are required"));

        // Check duplicate email or roll number
        if (userRepo.existsByEmail(req.getEmail()) || userRepo.existsByRollNumber(req.getRollNumber()))
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email or roll number already registered"));

        // Build user
        User user = new User();
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName() != null ? req.getLastName() : "");
        user.setEmail(req.getEmail());
        user.setRollNumber(req.getRollNumber());
        user.setDepartment(req.getDepartment());
        user.setYear(req.getYear() != null ? req.getYear() : "1st Year");
        user.setPhone(req.getPhone());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));

        String initials = (req.getFirstName().charAt(0) +
                (req.getLastName() != null && !req.getLastName().isEmpty()
                        ? String.valueOf(req.getLastName().charAt(0))
                        : ""))
                .toUpperCase();
        user.setAvatarInitials(initials);

        User saved = userRepo.save(user);

        // Activity log
        try {
            ActivityLog log = new ActivityLog();
            log.setUserId(saved.getId());
            log.setActionType("login");
            log.setDescription(saved.getFirstName() + " " + saved.getLastName() + " created account");
            activityLogRepo.save(log);
        } catch (Exception ignored) {
        }

        String token = jwtUtil.generateToken(saved.getId(), saved.getEmail(),
                saved.getFirstName(), saved.getLastName(), saved.getAvatarInitials());

        Map<String, Object> userMap = Map.of(
                "id", saved.getId(),
                "first_name", saved.getFirstName(),
                "last_name", saved.getLastName(),
                "email", saved.getEmail(),
                "avatar_initials", saved.getAvatarInitials());

        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token, userMap));
    }

    // ── POST /api/auth/login ──────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {

        Optional<User> optUser = userRepo.findByEmailAndIsActiveTrue(req.getEmail());
        if (optUser.isEmpty())
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));

        User user = optUser.get();
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash()))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));

        // Activity log
        try {
            ActivityLog log = new ActivityLog();
            log.setUserId(user.getId());
            log.setActionType("login");
            log.setDescription("User logged in");
            activityLogRepo.save(log);
        } catch (Exception ignored) {
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(),
                user.getFirstName(), user.getLastName(), user.getAvatarInitials());

        Map<String, Object> userMap = Map.of(
                "id", user.getId(),
                "first_name", user.getFirstName(),
                "last_name", user.getLastName(),
                "email", user.getEmail(),
                "department", user.getDepartment(),
                "year", user.getYear(),
                "avatar_initials", user.getAvatarInitials() != null ? user.getAvatarInitials() : "");

        return ResponseEntity.ok(new AuthResponse(token, userMap));
    }

    // ── GET /api/health ───────────────────────────────────────
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "time", java.time.LocalDateTime.now()));
    }
}
