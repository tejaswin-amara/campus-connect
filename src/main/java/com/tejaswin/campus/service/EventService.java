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
import java.nio.file.Files;
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

    private final Path uploadBaseDir;
    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp", ".gif");

    /**
     * Constructs the EventService with required repositories, logger and resolves
     * the base
     * upload directory.
     *
     * @param eventRepository        repository for events
     * @param registrationRepository repository for registrations
     * @param userRepository         repository for users
     * @param auditLogger            logger for security events
     * @param uploadDir              configured upload directory (relative or
     *                               absolute)
     */
    public EventService(EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            UserRepository userRepository,
            SecurityAuditLogger auditLogger,
            @org.springframework.beans.factory.annotation.Value("${app.upload-dir:uploads}") String uploadDir) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.auditLogger = auditLogger;
        String effectiveDir = (uploadDir == null || uploadDir.isBlank()) ? "uploads" : uploadDir;
        this.uploadBaseDir = java.nio.file.Paths.get(effectiveDir).toAbsolutePath().normalize();
    }

    /**
     * Fetches all events ordered by start time descending.
     *
     * @return list of events, never null
     */
    @Transactional(readOnly = true)
    public List<Event> findAllEvents() {
        return eventRepository.findAllByOrderByDateTimeDesc();
    }

    @Transactional(readOnly = true)
    public Page<Event> findAllEventsPage(Pageable pageable) {
        return eventRepository.findAllByOrderByDateTimeDesc(pageable);
    }

    /**
     * Persists an event. Logs an AUDIT message indicating create or update.
     *
     * @param event event to save
     */
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

    /**
     * Finds an event by id.
     *
     * @param id event identifier, non-null
     * @return event or null if not found
     */
    @Transactional(readOnly = true)
    public Event findEventById(@NonNull Long id) {
        return eventRepository.findById(id).orElse(null);
    }

    /**
     * Searches events by title or venue containing the query (case-insensitive).
     * Falls back to all events if query is null/blank.
     *
     * @param query search text, may be null/blank
     * @return list of events matching criteria
     */
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

    /**
     * Returns events by category ordered by start time desc.
     * If category is null/blank or 'all', returns all events.
     *
     * @param category category filter
     * @return list of events
     */
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

    /**
     * Registers user interest in an event for analytics (status INTERESTED).
     * No-op if a registration already exists for the user-event pair.
     *
     * @param eventId event id
     * @param userId  user id
     * @return true if created, false if already existed or invalid ids
     */
    @Transactional
    @CircuitBreaker(name = "registrationService", fallbackMethod = "registrationFallback")
    public boolean registerStudent(@NonNull Long eventId, @NonNull Long userId) {
        // Just track unique interest/clicks for analytics
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
        registration.setStatus("INTERESTED"); // Changed from CONFIRMED

        registrationRepository.save(registration);
        return true;
    }

    /**
     * Fallback for registration circuit breaker.
     */
    public boolean registrationFallback(Long eventId, Long userId, Throwable t) {
        logger.error("Circuit breaker triggered for registration (event:{}, user:{}): {}", eventId, userId,
                t.getMessage());
        return false;
    }

    /**
     * Deletes an event and its registrations. Best-effort deletion of associated
     * image file
     * under the configured upload directory.
     *
     * @param id event id
     */
    @Transactional
    public void deleteEvent(@NonNull Long id) {
        // 1. Get event to find image path
        Event event = eventRepository.findById(id).orElse(null);
        if (event != null && event.getImageUrl() != null) {
            deleteImageByUrl(event.getImageUrl());
        }

        registrationRepository.deleteByEventId(id);
        eventRepository.deleteById(id);
        logger.warn("AUDIT: Event deleted (ID: {})", id);
    }

    // Analytics
    /**
     * @return total number of events
     */
    @Transactional(readOnly = true)
    public long getTotalEventsCount() {
        return eventRepository.count();
    }

    /**
     * @return total number of registrations across all events
     */
    @Transactional(readOnly = true)
    public long getTotalRegistrationsCount() {
        return registrationRepository.count();
    }

    /**
     * @return list of all registrations
     */
    @Transactional(readOnly = true)
    public List<Registration> getAllRegistrations() {
        return registrationRepository.findAll();
    }

    /**
     * Counts events strictly after now.
     *
     * @return number of upcoming events
     */
    @Transactional(readOnly = true)
    public long getUpcomingEventsCount() {
        return eventRepository.countByDateTimeAfter(LocalDateTime.now());
    }

    /**
     * Counts events currently happening (start <= now && end >= now).
     *
     * @return number of ongoing events
     */
    @Transactional(readOnly = true)
    public long getOngoingEventsCount() {
        return eventRepository.countOngoingEvents(LocalDateTime.now());
    }

    /**
     * @param eventId event id
     * @return number of registrations for the event
     */
    @Transactional(readOnly = true)
    public long getRegistrationCount(Long eventId) {
        return registrationRepository.countByEventId(eventId);
    }

    /**
     * Builds a map of eventId -> registration count for the provided events.
     * Initializes counts to zero then overlays results from an aggregate query.
     *
     * @param events list of events to get counts for
     * @return map of eventId -> registration count
     */
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

    /**
     * @return map of category name -> event count, preserving repository order
     */
    @Transactional(readOnly = true)
    public Map<String, Long> getCategoryCounts() {
        Map<String, Long> map = new LinkedHashMap<>();
        List<Object[]> results = eventRepository.countEventsByCategory();
        for (Object[] row : results) {
            map.put((String) row[0], (Long) row[1]);
        }
        return map;
    }

    /**
     * @return count of events not considered upcoming (total - upcoming)
     */
    @Transactional(readOnly = true)
    public long getPastEventsCount() {
        return eventRepository.countPastEvents(LocalDateTime.now());
    }

    /**
     * Exports all events as CSV (UTF-8). Null-safe for optional fields.
     *
     * @return CSV bytes
     */
    @Transactional(readOnly = true)
    public byte[] getAllEventsAsCsv() {
        List<Event> events = findAllEvents();
        StringBuilder csv = new StringBuilder();
        // Header
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
        String escaped = data.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\n") || escaped.contains("\"")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    /**
     * Saves an uploaded image to the filesystem, sanitizing the filename
     * and checking for allowed extensions and path traversal.
     */
    public String saveUploadedImage(MultipartFile imageFile, String username) {
        String originalFilename = imageFile.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            return null;
        }

        String sanitizedFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String ext = "";
        int i = sanitizedFilename.lastIndexOf('.');
        if (i > 0) {
            ext = sanitizedFilename.substring(i).toLowerCase();
        }

        if (!ALLOWED_IMAGE_EXTENSIONS.contains(ext)) {
            auditLogger.logFileUpload(username, originalFilename, imageFile.getSize(), "REJECTED_INVALID_EXTENSION");
            return null;
        }

        try {
            String fileName = UUID.randomUUID().toString() + ext;
            Path targetPath = uploadBaseDir.resolve(fileName).normalize();

            if (!targetPath.startsWith(uploadBaseDir)) {
                auditLogger.logFileUpload(username, originalFilename, imageFile.getSize(), "REJECTED_PATH_TRAVERSAL");
                return null;
            }

            if (!Files.exists(uploadBaseDir)) {
                Files.createDirectories(uploadBaseDir);
            }

            if (Files.isSymbolicLink(targetPath)) {
                auditLogger.logFileUpload(username, originalFilename, imageFile.getSize(), "REJECTED_SYMLINK");
                return null;
            }

            try (var inputStream = imageFile.getInputStream()) {
                Files.copy(inputStream, targetPath,
                        java.nio.file.StandardCopyOption.REPLACE_EXISTING,
                        java.nio.file.LinkOption.NOFOLLOW_LINKS);
            }
            auditLogger.logFileUpload(username, originalFilename, imageFile.getSize(), "SUCCESS");
            return "/uploads/" + fileName;
        } catch (Exception e) {
            auditLogger.logFileUpload(username, originalFilename, imageFile.getSize(), "ERROR: " + e.getMessage());
            logger.error("Failed to save uploaded image for user {}: {}", username, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Deletes an image from the filesystem given its URL.
     */
    public void deleteImageByUrl(String imageUrl) {
        if (imageUrl != null && imageUrl.startsWith("/uploads/")) {
            try {
                String filename = imageUrl.substring("/uploads/".length());
                Path path = uploadBaseDir.resolve(filename).normalize();
                if (path.startsWith(uploadBaseDir)) {
                    Files.deleteIfExists(path);
                    logger.info("AUDIT: Deleted image file: {}", path);
                } else {
                    logger.warn("Security: Path traversal attempt prevented during deletion: {}", imageUrl);
                }
            } catch (Exception e) {
                logger.error("Failed to delete image file: {}", imageUrl, e);
            }
        }
    }
}
