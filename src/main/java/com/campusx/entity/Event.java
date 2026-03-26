package com.campusx.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Event entity — maps to the `events` table.
 */
@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * MySQL ENUM: 'technical','cultural','hackathon','sports','academic','workshop'
     */
    @Column(nullable = false, length = 20)
    private String category;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(nullable = false, length = 255)
    private String venue;

    @Column(nullable = false)
    private int capacity = 100;

    @Column(name = "seats_filled", nullable = false)
    private int seatsFilled = 0;

    /** MySQL ENUM: 'open','filling','full','cancelled' */
    @Column(nullable = false, length = 15)
    private String status = "open";

    @Column(name = "icon_emoji", length = 10)
    private String iconEmoji = "🎓";

    @Column(name = "is_featured", nullable = false)
    private boolean isFeatured = false;

    @Column(name = "banner_url", length = 500)
    private String bannerUrl;

    @Column(name = "prize_pool", length = 100)
    private String prizePool;

    @Column(name = "organizer", length = 200)
    private String organizer;

    @Column(name = "contact_email", length = 200)
    private String contactEmail;

    @Column(name = "registration_fee", precision = 10, scale = 2, nullable = false)
    private BigDecimal registrationFee = BigDecimal.ZERO;

    @Column(name = "payment_required", nullable = false)
    private boolean paymentRequired = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ─────────────────────────────────────

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public int getSeatsFilled() {
        return seatsFilled;
    }

    public void setSeatsFilled(int seatsFilled) {
        this.seatsFilled = seatsFilled;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getIconEmoji() {
        return iconEmoji;
    }

    public void setIconEmoji(String iconEmoji) {
        this.iconEmoji = iconEmoji;
    }

    public boolean isFeatured() {
        return isFeatured;
    }

    public void setFeatured(boolean featured) {
        isFeatured = featured;
    }

    public String getBannerUrl() {
        return bannerUrl;
    }

    public void setBannerUrl(String bannerUrl) {
        this.bannerUrl = bannerUrl;
    }

    public String getPrizePool() {
        return prizePool;
    }

    public void setPrizePool(String prizePool) {
        this.prizePool = prizePool;
    }

    public String getOrganizer() {
        return organizer;
    }

    public void setOrganizer(String organizer) {
        this.organizer = organizer;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public java.math.BigDecimal getRegistrationFee() {
        return registrationFee;
    }

    public void setRegistrationFee(java.math.BigDecimal registrationFee) {
        this.registrationFee = registrationFee;
    }

    public boolean isPaymentRequired() {
        return paymentRequired;
    }

    public void setPaymentRequired(boolean paymentRequired) {
        this.paymentRequired = paymentRequired;
    }
}
