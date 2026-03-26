package com.campusx.controller;

import com.campusx.config.SecurityUtils;
import com.campusx.entity.*;
import com.campusx.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

/**
 * RegistrationController
 * GET /api/registrations
 * POST /api/registrations — register (roll_number required)
 * PATCH /api/registrations/{id}/cancel
 * POST /api/registrations/{id}/payment — submit transaction_id after paying
 */
@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    @Autowired
    private RegistrationRepository regRepo;
    @Autowired
    private EventRepository eventRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private NotificationRepository notifRepo;
    @Autowired
    private ActivityLogRepository activityLogRepo;

    // ── GET /api/registrations ────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getRegistrations() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<Object[]> rows = regRepo.findRegistrationsWithEventByUserId(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", r[0]);
            map.put("user_id", r[1]);
            map.put("event_id", r[2]);
            map.put("phone", r[3]);
            map.put("status", r[4]);
            map.put("registered_at", r[5]);
            map.put("updated_at", r[6]);
            map.put("title", r[7]);
            map.put("category", r[8]);
            map.put("event_date", r[9]);
            map.put("venue", r[10]);
            map.put("icon_emoji", r[11]);
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    // ── POST /api/registrations ───────────────────────────────
    @PostMapping
    @Transactional
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        Long userId = SecurityUtils.getCurrentUserId();

        // ── Validate event_id ─────────────────────────────────
        Object eventIdObj = body.get("event_id");
        if (eventIdObj == null)
            return ResponseEntity.badRequest().body(Map.of("error", "event_id required"));
        Long eventId = Long.parseLong(eventIdObj.toString());

        // ── Validate roll_number ──────────────────────────────
        String rollNumber = body.get("roll_number") != null ? body.get("roll_number").toString().trim() : "";
        if (rollNumber.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Roll number is required"));

        // ── Check event ───────────────────────────────────────
        Optional<Event> optEvent = eventRepo.findById(eventId);
        if (optEvent.isEmpty())
            return ResponseEntity.status(404).body(Map.of("error", "Event not found"));
        Event event = optEvent.get();

        if ("full".equals(event.getStatus()))
            return ResponseEntity.badRequest().body(Map.of("error", "Event is full"));
        if ("cancelled".equals(event.getStatus()))
            return ResponseEntity.badRequest().body(Map.of("error", "Event is cancelled"));

        // ── Check duplicate ───────────────────────────────────
        Optional<Registration> optExisting = regRepo.findByUserIdAndEventId(userId, eventId);
        Registration reg;
        if (optExisting.isPresent()) {
            reg = optExisting.get();
            if (!"cancelled".equals(reg.getStatus())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Already registered for this event"));
            }
            // Re-use cancelled registration
            reg.setRollNumber(rollNumber);
        } else {
            // ── Create registration ───────────────────────────────
            reg = new Registration();
            reg.setUserId(userId);
            reg.setEventId(eventId);
            reg.setRollNumber(rollNumber);
        }

        reg.setPhone(body.get("phone") != null ? body.get("phone").toString() : null);

        boolean isPaid = event.isPaymentRequired()
                && event.getRegistrationFee() != null
                && event.getRegistrationFee().compareTo(BigDecimal.ZERO) > 0;

        if (isPaid) {
            reg.setStatus("pending");
            reg.setPaymentStatus("pending_verification");
            reg.setAmountPaid(event.getRegistrationFee());
        } else {
            reg.setStatus("confirmed");
            reg.setPaymentStatus("not_required");
        }

        Registration saved = regRepo.save(reg);

        // ── Increment seats_filled ────────────────────────────
        int newFilled = event.getSeatsFilled() + 1;
        String newStatus = newFilled >= event.getCapacity() ? "full"
                : newFilled >= event.getCapacity() * 0.85 ? "filling" : "open";
        event.setSeatsFilled(newFilled);
        event.setStatus(newStatus);
        eventRepo.save(event);

        // ── Activity log ──────────────────────────────────────
        try {
            ActivityLog log = new ActivityLog();
            log.setUserId(userId);
            log.setActionType("registered");
            log.setDescription("Registered for " + event.getTitle());
            log.setEventId(eventId);
            activityLogRepo.save(log);
        } catch (Exception ignored) {
        }

        // ── Notification ──────────────────────────────────────
        try {
            Notification notif = new Notification();
            notif.setUserId(userId);
            if (isPaid) {
                notif.setTitle("Payment Required");
                notif.setMessage(
                        "Pay ₹" + event.getRegistrationFee() + " to confirm your spot for " + event.getTitle() + ".");
                notif.setType("warning");
            } else {
                notif.setTitle("Registration Confirmed");
                notif.setMessage("You are registered for " + event.getTitle() + " on " + event.getEventDate() + ".");
                notif.setType("success");
            }
            notifRepo.save(notif);
        } catch (Exception ignored) {
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id", saved.getId());
        resp.put("paymentRequired", isPaid);
        resp.put("fee", event.getRegistrationFee());
        resp.put("message", isPaid ? "Proceed to payment" : "Registration successful");
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    // ── POST /api/registrations/{id}/payment ─────────────────
    @PostMapping("/{id}/payment")
    @Transactional
    public ResponseEntity<?> submitPayment(@PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (id == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid ID"));
        Optional<Registration> opt = regRepo.findById(id);
        if (opt.isEmpty() || !opt.get().getUserId().equals(userId))
            return ResponseEntity.status(404).body(Map.of("error", "Registration not found"));

        Registration reg = opt.get();
        if ("paid".equals(reg.getPaymentStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Payment already completed for this event"));
        }

        String txnId = body.get("transaction_id") != null ? body.get("transaction_id").toString().trim() : "";
        if (txnId.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Transaction ID is required"));

        // Duplicate transaction check
        if (regRepo.findByTransactionId(txnId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Duplicate transaction ID. This has already been submitted."));
        }

        reg.setTransactionId(txnId);
        reg.setPaymentStatus("pending_verification");

        if (body.get("screenshot") != null)
            reg.setPaymentScreenshot(body.get("screenshot").toString());

        regRepo.save(reg);

        // Notify admin (would be via push/email; here we just log)
        try {
            Notification notif = new Notification();
            notif.setUserId(userId);
            notif.setTitle("Payment Submitted");
            notif.setMessage("Transaction ID " + txnId + " submitted. Awaiting admin verification.");
            notif.setType("info");
            notifRepo.save(notif);
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok(Map.of("message", "Payment submitted. Awaiting admin verification."));
    }

    // ── GET /api/registrations/{id}/detail ──────────────────
    @GetMapping("/{id}/detail")
    public ResponseEntity<?> getRegistrationDetail(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (id == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid ID"));
        Optional<Registration> opt = regRepo.findById(id);

        if (opt.isEmpty() || !opt.get().getUserId().equals(currentUserId)) {
            return ResponseEntity.status(404).body(Map.of("error", "Registration not found"));
        }

        Registration reg = opt.get();
        if ("paid".equals(reg.getPaymentStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Payment already completed for this event"));
        }

        Long eventId = reg.getEventId();
        Long regUserId = reg.getUserId();

        if (eventId == null || regUserId == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Registration data is corrupt"));
        }

        Optional<Event> optEvent = eventRepo.findById(eventId);
        Optional<User> optUser = userRepo.findById(regUserId);

        if (optEvent.isEmpty() || optUser.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Related data not found"));
        }

        Event event = optEvent.get();
        if (event.getRegistrationFee() == null || event.getRegistrationFee().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "This is a free event, no payment required"));
        }

        User user = optUser.get();

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("regId", reg.getId());
        resp.put("firstName", user.getFirstName());
        resp.put("lastName", user.getLastName());
        resp.put("rollNumber", reg.getRollNumber());
        resp.put("eventTitle", event.getTitle());
        resp.put("registrationFee", event.getRegistrationFee());
        resp.put("category", event.getCategory());
        resp.put("paymentStatus", reg.getPaymentStatus());

        return ResponseEntity.ok(resp);
    }

    // ── PATCH /api/registrations/{id}/cancel ──────────────────
    @PatchMapping("/{id}/cancel")
    @Transactional
    public ResponseEntity<?> cancel(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (id == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid ID"));
        Optional<Registration> optReg = regRepo.findById(id);
        if (optReg.isEmpty() || !optReg.get().getUserId().equals(userId))
            return ResponseEntity.status(404).body(Map.of("error", "Registration not found"));

        Registration reg = optReg.get();
        reg.setStatus("cancelled");
        regRepo.save(reg);

        Long eventId = reg.getEventId();
        if (eventId != null) {
            eventRepo.findById(eventId).ifPresent(event -> {
                int newFilled = Math.max(event.getSeatsFilled() - 1, 0);
                event.setSeatsFilled(newFilled);
                eventRepo.save(event);
            });
        }

        return ResponseEntity.ok(Map.of("message", "Registration cancelled"));
    }
}
