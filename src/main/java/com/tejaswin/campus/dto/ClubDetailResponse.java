package com.tejaswin.campus.dto;

public class ClubDetailResponse {

    private Long id;
    private String name;
    private String slug;
    private String category;
    private String description;
    private String logoUrl;
    private Long leadUserId;
    private long totalEvents;
    private long totalRsvps;
    private long totalCheckedIn;

    public ClubDetailResponse() {
    }

    public ClubDetailResponse(Long id, String name, String slug, String category, String description, String logoUrl, Long leadUserId, long totalEvents, long totalRsvps, long totalCheckedIn) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.category = category;
        this.description = description;
        this.logoUrl = logoUrl;
        this.leadUserId = leadUserId;
        this.totalEvents = totalEvents;
        this.totalRsvps = totalRsvps;
        this.totalCheckedIn = totalCheckedIn;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public Long getLeadUserId() {
        return leadUserId;
    }

    public void setLeadUserId(Long leadUserId) {
        this.leadUserId = leadUserId;
    }

    public long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(long totalEvents) {
        this.totalEvents = totalEvents;
    }

    public long getTotalRsvps() {
        return totalRsvps;
    }

    public void setTotalRsvps(long totalRsvps) {
        this.totalRsvps = totalRsvps;
    }

    public long getTotalCheckedIn() {
        return totalCheckedIn;
    }

    public void setTotalCheckedIn(long totalCheckedIn) {
        this.totalCheckedIn = totalCheckedIn;
    }
}
