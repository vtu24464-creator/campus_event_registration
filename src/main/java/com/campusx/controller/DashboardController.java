package com.campusx.controller;

import com.campusx.config.SecurityUtils;
import com.campusx.dto.DashboardStatsResponse;
import com.campusx.repository.ActivityLogRepository;
import com.campusx.repository.CertificateRepository;
import com.campusx.repository.EventRepository;
import com.campusx.repository.NotificationRepository;
import com.campusx.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

/**
 * DashboardController — mirrors Node.js routes/dashboard.js
 * GET /api/dashboard/stats
 * GET /api/dashboard/activity
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private EventRepository eventRepo;
    @Autowired
    private RegistrationRepository regRepo;
    @Autowired
    private CertificateRepository certRepo;
    @Autowired
    private NotificationRepository notifRepo;
    @Autowired
    private ActivityLogRepository activityLogRepo;

    // ── GET /api/dashboard/stats ──────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Long userId = SecurityUtils.getCurrentUserId();
        LocalDate today = LocalDate.now();

        long totalEvents = eventRepo.count();
        long registered = regRepo.countActiveByUserId(userId);
        long upcoming = regRepo.countUpcomingByUserId(userId, today);
        long certificates = certRepo.countByUserId(userId);
        long unreadNotifs = notifRepo.countByUserIdAndIsReadFalse(userId);

        return ResponseEntity.ok(
                new DashboardStatsResponse(totalEvents, registered, upcoming, certificates, unreadNotifs));
    }

    // ── GET /api/dashboard/activity ───────────────────────────
    @GetMapping("/activity")
    public ResponseEntity<?> getActivity() {
        Long userId = SecurityUtils.getCurrentUserId();

        List<Object[]> rows = activityLogRepo.findRecentActivityByUserId(userId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] r : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", r[0]);
            map.put("user_id", r[1]);
            map.put("action_type", r[2]);
            map.put("description", r[3]);
            map.put("event_id", r[4]);
            map.put("created_at", r[5]);
            map.put("event_title", r[6]);
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }
}
