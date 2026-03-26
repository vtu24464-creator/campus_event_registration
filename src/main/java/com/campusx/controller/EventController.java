package com.campusx.controller;

import com.campusx.entity.Event;
import com.campusx.repository.EventRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * EventController — mirrors Node.js routes/events.js
 * GET /api/events?category=&status=&search=&month=
 * GET /api/events/{id}
 */
@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventRepository eventRepo;

    // ── GET /api/events ───────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getEvents(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String month) {

        Specification<Event> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (category != null && !category.equals("all") && !category.isBlank())
                predicates.add(cb.equal(root.get("category"), category));

            if (status != null && !status.equals("all") && !status.isBlank())
                predicates.add(cb.equal(root.get("status"), status));

            if (month != null && !month.equals("all") && !month.isBlank()) {
                // MySQL: MONTHNAME(event_date) = 'March' — use native function
                predicates.add(cb.equal(
                        cb.function("MONTHNAME", String.class, root.get("eventDate")), month));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)));
            }

            // ORDER BY event_date ASC
            query.orderBy(cb.asc(root.get("eventDate")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Event> events = eventRepo.findAll(spec);
        return ResponseEntity.ok(events);
    }

    // ── GET /api/events/{id} ──────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getEvent(@PathVariable Long id) {
        return eventRepo.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body(Map.of("error", "Event not found")));
    }
}
