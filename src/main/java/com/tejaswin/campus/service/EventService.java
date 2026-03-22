package com.tejaswin.campus.service;

import com.tejaswin.campus.model.Event;
import com.tejaswin.campus.model.Registration;
import com.tejaswin.campus.model.User;
import com.tejaswin.campus.repository.EventRepository;
import com.tejaswin.campus.repository.RegistrationRepository;
import com.tejaswin.campus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;
import com.tejaswin.campus.security.SecurityAuditLogger;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class EventService {
    private static final Logger logger = LoggerFactory.getLogger(EventService.class);

    private final EventRepository eventRepository;

    private final RegistrationRepository registrationRepository;

    private final UserRepository userRepository;
    private final SecurityAuditLogger auditLogger;

    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp", ".gif");

    public EventService(EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            UserRepository userRepository,
            SecurityAuditLogger auditLogger) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.auditLogger = auditLogger;
    }

    @Transactional(readOnly = true)
    public List<Event> findAllEvents() {
        return eventRepository.findAllByOrderByDateTimeDesc();
    }

    @Transactional(readOnly = true)
    public Page<Event> findAllEventsPage(Pageable pageable) {
        return eventRepository.findAllByOrderByDateTimeDesc(pageable);
    }

    @Transactional
    public void saveEvent(Event event) {
        boolean isNew = event.getId() == null;
        eventRepository.save(event);
        if (isNew) {
            logger.info("AUDIT: Event created: '{}' (ID: {})", event.getTitle(), event.getId());
        } else {
            logger.info("AUDIT: Event updated: '{}' (ID: {})", event.getTitle(), event.getId());
        }
    }

    @Transactional(readOnly = true)
    public Event findEventById(@NonNull Long id) {
        return eventRepository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<Event> searchEvents(String query) {
        if (query == null || query.trim().isEmpty()) {
            return findAllEvents();
        }
        return eventRepository.findByTitleContainingIgnoreCaseOrVenueContainingIgnoreCase(query.trim(), query.trim());
    }

    @Transactional(readOnly = true)
    public Page<Event> searchEventsPage(String query, Pageable pageable) {
        if (query == null || query.trim().isEmpty()) {
            return findAllEventsPage(pageable);
        }
        return eventRepository.findByTitleContainingIgnoreCaseOrVenueContainingIgnoreCase(query.trim(), query.trim(),
                pageable);
    }

    @Transactional(readOnly = true)
    public Page<Event> findEventsByStatusPage(String status, Pageable pageable) {
        LocalDateTime now = LocalDateTime.now();
        if ("Upcoming".equalsIgnoreCase(status)) {
            return eventRepository.findByDateTimeAfterOrderByDateTimeAsc(now, pageable);
        } else if ("Ongoing".equalsIgnoreCase(status)) {
            return eventRepository.findOngoingEventsPage(now, pageable);
        } else if ("Past".equalsIgnoreCase(status)) {
            return eventRepository.findPastEventsPage(now, pageable);
        }
        return findAllEventsPage(pageable);
    }

    @Transactional(readOnly = true)
    public List<Event> findEventsByCategory(String category) {
        if (category == null || category.trim().isEmpty() || "all".equalsIgnoreCase(category)) {
            return findAllEvents();
        }
        return eventRepository.findByCategoryOrderByDateTimeDesc(category);
    }

    @Transactional(readOnly = true)
    public Page<Event> findEventsByCategoryPage(String category, Pageable pageable) {
        if (category == null || category.trim().isEmpty() || "all".equalsIgnoreCase(category)) {
            return findAllEventsPage(pageable);
        }
        return eventRepository.findByCategoryOrderByDateTimeDesc(category, pageable);
    }

    @Transactional
    @CircuitBreaker(name = "registrationService", fallbackMethod = "registrationFallback")
    public boolean registerStudent(@NonNull Long eventId, @NonNull Long userId) {

        if (registrationRepository.existsByUserIdAndEventId(userId, eventId)) {
            return false;
        }

        Event event = eventRepository.findById(eventId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);

        if (event == null || user == null) {
            return false;
        }

        Registration registration = new Registration();
        registration.setUser(user);
        registration.setEvent(event);
        registration.setRegistrationDate(LocalDateTime.now());
        registration.setStatus("INTERESTED");

        registrationRepository.save(registration);
        return true;
    }

    public boolean registrationFallback(Long eventId, Long userId, Throwable t) {
        logger.error("Circuit breaker triggered for registration (event:{}, user:{}): {}", eventId, userId,
                t.getMessage());
        return false;
    }

    @Transactional
    public void deleteEvent(@NonNull Long id) {

        Event event = eventRepository.findById(id).orElse(null);
        if (event != null && event.getImageUrl() != null) {

        }

        registrationRepository.deleteByEventId(id);
        eventRepository.deleteById(id);
        logger.warn("AUDIT: Event deleted (ID: {})", id);
    }

    @Transactional(readOnly = true)
    public long getTotalEventsCount() {
        return eventRepository.count();
    }

    @Transactional(readOnly = true)
    public long getTotalRegistrationsCount() {
        return registrationRepository.count();
    }

    @Transactional(readOnly = true)
    public List<Registration> getAllRegistrations() {
        return registrationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public long getUpcomingEventsCount() {
        return eventRepository.countByDateTimeAfter(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public long getOngoingEventsCount() {
        return eventRepository.countOngoingEvents(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public long getRegistrationCount(Long eventId) {
        return registrationRepository.countByEventId(eventId);
    }

    @Transactional(readOnly = true)
    public Map<Long, Long> getRegistrationCountsMap(List<Event> events) {
        Map<Long, Long> counts = new HashMap<>();
        if (events == null || events.isEmpty())
            return counts;

        for (Event e : events) {
            counts.put(e.getId(), 0L);
        }

        List<Object[]> results = registrationRepository.countRegistrationsGroupedByEvent();
        for (Object[] row : results) {
            Long eventId = (Long) row[0];
            Long count = (Long) row[1];
            if (counts.containsKey(eventId)) {
                counts.put(eventId, count);
            }
        }
        return counts;
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getCategoryCounts() {
        Map<String, Long> map = new LinkedHashMap<>();
        List<Object[]> results = eventRepository.countEventsByCategory();
        for (Object[] row : results) {
            map.put((String) row[0], (Long) row[1]);
        }
        return map;
    }

    @Transactional(readOnly = true)
    public long getPastEventsCount() {
        return eventRepository.countPastEvents(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public byte[] getAllEventsAsCsv() {
        List<Event> events = findAllEvents();
        StringBuilder csv = new StringBuilder();

        csv.append(
                "ID,Title,Category,Venue,Start DateTime,End DateTime,Capacity,Registration Link,Responses Link,Status\n");

        LocalDateTime now = LocalDateTime.now();
        for (Event event : events) {
            csv.append(event.getId()).append(",");
            csv.append(escapeCsv(event.getTitle())).append(",");
            csv.append(escapeCsv(event.getCategory())).append(",");
            csv.append(escapeCsv(event.getVenue())).append(",");
            LocalDateTime start = event.getDateTime();
            LocalDateTime end = event.getEndDateTime();
            csv.append(start != null ? start : "").append(",");
            csv.append(end != null ? end : "").append(",");
            csv.append(event.getMaxCapacity() != null ? event.getMaxCapacity() : "Unlimited").append(",");
            csv.append(escapeCsv(event.getRegistrationLink())).append(",");
            csv.append(escapeCsv(event.getResponsesLink())).append(",");

            String status;
            if (start == null) {
                status = "Unknown";
            } else if (start.isAfter(now)) {
                status = "Upcoming";
            } else if (end != null && end.isAfter(now)) {
                status = "Ongoing";
            } else {
                status = "Past";
            }
            csv.append(status).append("\n");
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCsv(String data) {
        if (data == null)
            return "";

        if (data.startsWith("=") || data.startsWith("+") || data.startsWith("-") || data.startsWith("@")) {
            data = "'" + data;
        }
        String escaped = data.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\n") || escaped.contains("\"")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    public boolean saveUploadedImage(MultipartFile imageFile, String username, Event event) {
        String originalFilename = imageFile.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            return false;
        }

        String sanitizedFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String ext = "";
        int i = sanitizedFilename.lastIndexOf('.');
        if (i > 0) {
            ext = sanitizedFilename.substring(i).toLowerCase();
        }

        if (!ALLOWED_IMAGE_EXTENSIONS.contains(ext)) {
            auditLogger.logFileUpload(username, originalFilename, imageFile.getSize(), "REJECTED_INVALID_EXTENSION");
            return false;
        }

        try {
            event.setImageData(imageFile.getBytes());
            event.setImageMimeType(imageFile.getContentType());

            event.setImageUrl("/api/public/events/image/" + UUID.randomUUID().toString());

            auditLogger.logFileUpload(username, originalFilename, imageFile.getSize(), "SUCCESS (DB)");
            return true;
        } catch (Exception e) {
            auditLogger.logFileUpload(username, originalFilename, imageFile.getSize(), "ERROR: " + e.getMessage());
            logger.error("Failed to process uploaded image for user {}: {}", username, e.getMessage(), e);
            return false;
        }
    }

    public void deleteImageByUrl(String imageUrl) {

    }
}
