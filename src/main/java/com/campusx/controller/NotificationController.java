package com.campusx.controller;

import com.campusx.config.SecurityUtils;
import com.campusx.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * NotificationController — mirrors Node.js routes/notifications.js
 * GET /api/notifications
 * PATCH /api/notifications/{id}/read
 * DELETE /api/notifications (clear all)
 * DELETE /api/notifications/{id} (dismiss one)
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notifRepo;

    // ── GET /api/notifications ────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getNotifications() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(notifRepo.findTop20ByUserIdOrderByCreatedAtDesc(userId));
    }

    // ── PATCH /api/notifications/{id}/read ───────────────────
    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        notifRepo.markAsRead(id, userId);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    // ── DELETE /api/notifications (clear all) ─────────────────
    @DeleteMapping
    public ResponseEntity<?> clearAll() {
        Long userId = SecurityUtils.getCurrentUserId();
        notifRepo.deleteByUserId(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications cleared"));
    }

    // ── DELETE /api/notifications/{id} (dismiss one) ──────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> dismiss(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        notifRepo.deleteByIdAndUserId(id, userId);
        return ResponseEntity.ok(Map.of("message", "Notification dismissed"));
    }
}
