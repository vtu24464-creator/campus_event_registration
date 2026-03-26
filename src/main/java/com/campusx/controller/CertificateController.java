package com.campusx.controller;

import com.campusx.config.SecurityUtils;
import com.campusx.repository.CertificateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * CertificateController
 * GET /api/certificates — list for current user
 * GET /api/certificates/{id} — single cert detail for preview page
 */
@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    @Autowired
    private CertificateRepository certRepo;

    // ── GET /api/certificates ─────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getCertificates() {
        Long userId = SecurityUtils.getCurrentUserId();

        List<Object[]> rows = certRepo.findCertificatesWithEventByUserId(userId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] r : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", r[0]);
            map.put("user_id", r[1]);
            map.put("event_id", r[2]);
            map.put("certificate_url", r[3]);
            map.put("issued_at", r[4]);
            map.put("title", r[5]);
            map.put("category", r[6]);
            map.put("icon_emoji", r[7]);
            map.put("participation_type", r[8] != null ? r[8] : "participation");
            map.put("position", r[9]);
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    // ── GET /api/certificates/{id} ────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getCertificate(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();

        List<Object[]> rows = certRepo.findCertificateDetailById(id);
        if (rows.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Certificate not found"));
        }

        Object[] r = rows.get(0);
        Long certUserId = r[1] != null ? ((Number) r[1]).longValue() : null;

        // Only the owner or an admin can view
        if (certUserId != null && !userId.equals(certUserId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", r[0]);
        map.put("userId", r[1]);
        map.put("issuedAt", r[2]);
        map.put("participationType", r[3] != null ? r[3] : "participation");
        map.put("position", r[4]);
        // Event
        map.put("title", r[5]);
        map.put("category", r[6]);
        map.put("eventDate", r[7]);
        map.put("venue", r[8]);
        map.put("organizer", r[9]);
        // User
        map.put("firstName", r[10]);
        map.put("lastName", r[11]);
        map.put("rollNumber", r[12]);
        map.put("department", r[13]);
        map.put("year", r[14]);

        return ResponseEntity.ok(map);
    }
}
