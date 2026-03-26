package com.campusx.controller;

import com.campusx.config.SecurityUtils;
import com.campusx.entity.ActivityLog;
import com.campusx.entity.Wishlist;
import com.campusx.repository.ActivityLogRepository;
import com.campusx.repository.WishlistRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * WishlistController — mirrors Node.js routes/wishlist.js
 * GET /api/wishlist
 * POST /api/wishlist
 * DELETE /api/wishlist/{eventId}
 */
@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistRepository wishlistRepo;
    @Autowired
    private ActivityLogRepository activityLogRepo;

    // ── GET /api/wishlist ─────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getWishlist() {
        Long userId = SecurityUtils.getCurrentUserId();

        List<Object[]> rows = wishlistRepo.findWishlistWithEventByUserId(userId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] r : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", r[0]);
            map.put("saved_at", r[1]);
            map.put("event_id", r[2]);
            map.put("title", r[3]);
            map.put("category", r[4]);
            map.put("event_date", r[5]);
            map.put("venue", r[6]);
            map.put("icon_emoji", r[7]);
            map.put("status", r[8]);
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    // ── POST /api/wishlist ────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> addToWishlist(@RequestBody Map<String, Object> body) {
        Long userId = SecurityUtils.getCurrentUserId();

        Object eventIdObj = body.get("event_id");
        if (eventIdObj == null)
            return ResponseEntity.badRequest().body(Map.of("error", "event_id required"));

        Long eventId = Long.parseLong(eventIdObj.toString());

        // INSERT IGNORE equivalent — skip if already exists
        if (wishlistRepo.findByUserIdAndEventId(userId, eventId).isEmpty()) {
            Wishlist w = new Wishlist();
            w.setUserId(userId);
            w.setEventId(eventId);
            wishlistRepo.save(w);
        }

        try {
            ActivityLog log = new ActivityLog();
            log.setUserId(userId);
            log.setActionType("wishlist_add");
            log.setDescription("Added event to wishlist");
            log.setEventId(eventId);
            activityLogRepo.save(log);
        } catch (Exception ignored) {
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Added to wishlist"));
    }

    // ── DELETE /api/wishlist/{eventId} ────────────────────────
    @DeleteMapping("/{eventId}")
    @Transactional
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long eventId) {
        Long userId = SecurityUtils.getCurrentUserId();

        wishlistRepo.deleteByUserIdAndEventId(userId, eventId);

        try {
            ActivityLog log = new ActivityLog();
            log.setUserId(userId);
            log.setActionType("wishlist_remove");
            log.setDescription("Removed event from wishlist");
            log.setEventId(eventId);
            activityLogRepo.save(log);
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok(Map.of("message", "Removed from wishlist"));
    }
}
