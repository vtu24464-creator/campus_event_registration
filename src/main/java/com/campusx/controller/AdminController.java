package com.campusx.controller;

import com.campusx.entity.*;
import com.campusx.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.math.BigDecimal;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.*;

/**
 * AdminController — /api/admin/**
 * All endpoints are publicly permitted in SecurityConfig (frontend-gated).
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private EventRepository eventRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private CertificateRepository certRepo;
    @Autowired
    private RegistrationRepository regRepo;
    @Autowired
    private AdminPaymentSettingsRepository paySettingsRepo;

    // ── GET /api/admin/stats ──────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalEvents", eventRepo.count());
        stats.put("totalUsers", userRepo.count());
        stats.put("totalRegistrations", regRepo.count());
        stats.put("totalCertificates", certRepo.count());

        // Revenue: sum of amount_paid for paid registrations
        Object revenue = regRepo.totalRevenue();
        stats.put("totalRevenue", revenue != null ? revenue : 0);

        return ResponseEntity.ok(stats);
    }

    // ── POST /api/admin/events ────────────────────────────────
    @PostMapping("/events")
    public ResponseEntity<?> createEvent(@RequestBody Map<String, Object> body) {
        try {
            Event event = new Event();
            event.setTitle((String) body.getOrDefault("title", "New Event"));
            event.setDescription((String) body.get("description"));

            String cat = (String) body.getOrDefault("category", "technical");
            event.setCategory(cat);

            String dateStr = (String) body.get("eventDate");
            if (dateStr != null && !dateStr.isBlank())
                event.setEventDate(LocalDate.parse(dateStr));

            event.setVenue((String) body.getOrDefault("venue", "TBD"));

            Object cap = body.get("capacity");
            event.setCapacity(cap instanceof Number ? ((Number) cap).intValue() : 100);

            event.setStatus("open");
            event.setIconEmoji(getIconForCategory(cat));
            event.setBannerUrl((String) body.getOrDefault("bannerUrl", "/banners/" + cat + ".png"));
            event.setPrizePool((String) body.get("prizePool"));
            event.setOrganizer((String) body.get("organizer"));
            event.setContactEmail((String) body.get("contactEmail"));

            Object featured = body.get("isFeatured");
            if (featured instanceof Boolean)
                event.setFeatured((Boolean) featured);

            // Payment fields
            Object fee = body.get("registrationFee");
            if (fee != null) {
                BigDecimal feeVal = new BigDecimal(fee.toString());
                event.setRegistrationFee(feeVal);
                event.setPaymentRequired(feeVal.compareTo(BigDecimal.ZERO) > 0);
            }

            Event saved = eventRepo.save(event);
            return ResponseEntity.status(201)
                    .body(Map.of("id", saved.getId(), "message", "Event created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET /api/admin/events ─────────────────────────────────
    @GetMapping("/events")
    public ResponseEntity<?> getAllEvents() {
        return ResponseEntity.ok(eventRepo.findAll());
    }

    // ── GET /api/admin/events/{id}/registrations ──────────────
    @GetMapping("/events/{id}/registrations")
    public ResponseEntity<?> getEventRegistrations(@PathVariable Long id) {
        List<Object[]> rows = regRepo.findRegistrationsByEventId(id);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("regId", r[0]);
            m.put("userId", r[1]);
            m.put("firstName", r[2]);
            m.put("lastName", r[3]);
            m.put("email", r[4]);
            m.put("rollNumber", r[5]);
            m.put("department", r[6]);
            m.put("phone", r[7]);
            m.put("status", r[8]);
            m.put("registeredAt", r[9]);
            m.put("paymentStatus", r.length > 10 ? r[10] : "not_required");
            m.put("transactionId", r.length > 11 ? r[11] : null);
            m.put("amountPaid", r.length > 12 ? r[12] : null);
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    // ── GET /api/admin/certificates ───────────────────────────
    @GetMapping("/certificates")
    public ResponseEntity<?> getAllCertificates() {
        List<Object[]> rows = certRepo.findAllCertificatesForAdmin();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r[0]);
            m.put("userId", r[1]);
            m.put("firstName", r[2]);
            m.put("lastName", r[3]);
            m.put("rollNumber", r[4]);
            m.put("eventTitle", r[5]);
            m.put("category", r[6]);
            m.put("participationType", r[7] != null ? r[7] : "participation");
            m.put("issuedAt", r[8]);
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    // ── GET /api/admin/payments ───────────────────────────────
    @GetMapping("/payments")
    public ResponseEntity<?> getPendingPayments() {
        List<Object[]> rows = regRepo.findPaymentPendingRegistrations();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("regId", r[0]);
            m.put("firstName", r[1]);
            m.put("lastName", r[2]);
            m.put("rollNumber", r[3]);
            m.put("email", r[4]);
            m.put("eventTitle", r[5]);
            m.put("amountPaid", r[6]);
            m.put("transactionId", r[7]);
            m.put("paymentStatus", r[8]);
            m.put("registeredAt", r[9]);
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    // ── POST /api/admin/payments/{id}/approve ─────────────────
    @PostMapping("/payments/{id}/approve")
    public ResponseEntity<?> approvePayment(@PathVariable Long id) {
        return regRepo.findById(id).map(reg -> {
            reg.setPaymentStatus("paid");
            reg.setStatus("confirmed");
            regRepo.save(reg);
            return ResponseEntity.ok(Map.of("message", "Payment approved"));
        }).orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Registration not found")));
    }

    // ── POST /api/admin/payments/{id}/reject ──────────────────
    @PostMapping("/payments/{id}/reject")
    public ResponseEntity<?> rejectPayment(@PathVariable Long id) {
        return regRepo.findById(id).map(reg -> {
            reg.setPaymentStatus("rejected");
            reg.setStatus("cancelled");
            regRepo.save(reg);
            return ResponseEntity.ok(Map.of("message", "Payment rejected"));
        }).orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Registration not found")));
    }

    // ── POST /api/admin/upload-qr ─────────────────────────────
    @PostMapping("/upload-qr")
    public ResponseEntity<?> uploadQr(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Empty file"));
        }
        try {
            String fileName = "admin_qr_" + System.currentTimeMillis() + ".png";
            String uploadDir = "src/main/resources/static/banners/";

            File targetDir = new File(uploadDir);
            if (!targetDir.exists())
                targetDir.mkdirs();

            Path path = Paths.get(uploadDir + fileName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

            return ResponseEntity.ok(Map.of("url", "/banners/" + fileName));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET /api/admin/payment-settings ──────────────────────
    @GetMapping("/payment-settings")
    public ResponseEntity<?> getPaymentSettings() {
        return ResponseEntity.ok(paySettingsRepo.findById(1)
                .orElseGet(AdminPaymentSettings::new));
    }

    // ── POST /api/admin/payment-settings ─────────────────────
    @PostMapping("/payment-settings")
    public ResponseEntity<?> savePaymentSettings(@RequestBody Map<String, Object> body) {
        AdminPaymentSettings s = paySettingsRepo.findById(1)
                .orElseGet(() -> {
                    AdminPaymentSettings n = new AdminPaymentSettings();
                    n.setId(1);
                    return n;
                });
        if (body.get("upiId") != null)
            s.setUpiId(body.get("upiId").toString());
        if (body.get("upiPhone") != null)
            s.setUpiPhone(body.get("upiPhone").toString());
        if (body.get("bankName") != null)
            s.setBankName(body.get("bankName").toString());
        if (body.get("bankAccount") != null)
            s.setBankAccount(body.get("bankAccount").toString());
        if (body.get("ifscCode") != null)
            s.setIfscCode(body.get("ifscCode").toString());
        if (body.get("accountName") != null)
            s.setAccountName(body.get("accountName").toString());
        if (body.get("qrCodePath") != null)
            s.setQrCodePath(body.get("qrCodePath").toString());
        if (body.get("payNote") != null)
            s.setPayNote(body.get("payNote").toString());
        paySettingsRepo.save(s);
        return ResponseEntity.ok(Map.of("message", "Payment settings saved"));
    }

    // ── helpers ───────────────────────────────────────────────
    private String getIconForCategory(String cat) {
        return switch (cat != null ? cat : "") {
            case "hackathon" -> "⚡";
            case "cultural" -> "🎵";
            case "sports" -> "🏆";
            case "academic" -> "📚";
            case "workshop" -> "🎨";
            default -> "💻";
        };
    }
}
