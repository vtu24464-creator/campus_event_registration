package com.campusx.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Certificate entity — maps to the `certificates` table.
 */
@Entity
@Table(name = "certificates", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "event_id" }))
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "certificate_url", length = 500)
    private String certificateUrl;

    @Column(name = "issued_at", updatable = false)
    private LocalDateTime issuedAt;

    @PrePersist
    void prePersist() {
        issuedAt = LocalDateTime.now();
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

    public String getCertificateUrl() {
        return certificateUrl;
    }

    public void setCertificateUrl(String certificateUrl) {
        this.certificateUrl = certificateUrl;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }
}
