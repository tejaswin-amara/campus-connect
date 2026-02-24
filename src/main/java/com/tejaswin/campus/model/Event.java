package com.tejaswin.campus.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Description is required")
    @Column(length = 2000)
    private String description;

    @NotNull(message = "Date and Time is required")
    private LocalDateTime dateTime;
    private LocalDateTime endDateTime;

    @NotBlank(message = "Venue is required")
    private String venue;

    @NotBlank(message = "Category is required")
    private String category; // Technical, Cultural, Sports, Workshop, Seminar

    @URL(message = "Invalid registration link URL")
    @Pattern(regexp = "^https?://.*", message = "Must be a valid HTTP/HTTPS URL")
    @Size(max = 1000, message = "URL too long")
    @Column(length = 1000)
    private String registrationLink;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer maxCapacity;

    @Column(length = 1000)
    private String imageUrl;

    @URL(message = "Invalid responses link URL")
    @Pattern(regexp = "^https?://.*", message = "Must be a valid HTTP/HTTPS URL")
    @Size(max = 1000, message = "URL too long")
    @Column(length = 1000)
    private String responsesLink;

    public Event() {
    }

    public Event(Long id, String title, String description, LocalDateTime dateTime, String venue, String category) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dateTime = dateTime;
        this.venue = venue;
        this.category = category;
    }

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

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getRegistrationLink() {
        return registrationLink;
    }

    public void setRegistrationLink(String registrationLink) {
        this.registrationLink = registrationLink;
    }

    public Integer getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getResponsesLink() {
        return responsesLink;
    }

    public void setResponsesLink(String responsesLink) {
        this.responsesLink = responsesLink;
    }

    public LocalDateTime getEndDateTime() {
        return endDateTime;
    }

    public void setEndDateTime(LocalDateTime endDateTime) {
        this.endDateTime = endDateTime;
    }
}
