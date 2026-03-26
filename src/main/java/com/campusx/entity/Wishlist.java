package com.campusx.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Wishlist entity — maps to the `wishlist` table.
 * Unique constraint prevents duplicate wishlist entries.
 */
@Entity
@Table(name = "wishlist", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "event_id" }))
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "saved_at", updatable = false)
    private LocalDateTime savedAt;

    @PrePersist
    void prePersist() {
        savedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ─────────────────────────────────────

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public LocalDateTime getSavedAt() {
        return savedAt;
    }
}
