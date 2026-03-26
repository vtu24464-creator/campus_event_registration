package com.campusx.dto;

/**
 * DashboardStatsResponse — mirrors Node.js /api/dashboard/stats response shape.
 */
public class DashboardStatsResponse {

    private long totalEvents;
    private long registered;
    private long upcoming;
    private long certificates;
    private long unreadNotifs;

    public DashboardStatsResponse(long totalEvents, long registered,
            long upcoming, long certificates, long unreadNotifs) {
        this.totalEvents = totalEvents;
        this.registered = registered;
        this.upcoming = upcoming;
        this.certificates = certificates;
        this.unreadNotifs = unreadNotifs;
    }

    public long getTotalEvents() {
        return totalEvents;
    }

    public long getRegistered() {
        return registered;
    }

    public long getUpcoming() {
        return upcoming;
    }

    public long getCertificates() {
        return certificates;
    }

    public long getUnreadNotifs() {
        return unreadNotifs;
    }
}
