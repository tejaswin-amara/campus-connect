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
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

import java.nio.charset.StandardCharsets;
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

import com.tejaswin.campus.event.RegistrationCompletedEvent;
import com.tejaswin.campus.exception.EventCapacityExhaustedException;
import com.tejaswin.campus.exception.EventNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;

@Service
public class EventService {
    private static final Logger logger = LoggerFactory.getLogger(EventService.class);

    private final EventRepository eventRepository;

    private final RegistrationRepository registrationRepository;

    private final UserRepository userRepository;
    private final SecurityAuditLogger auditLogger;
    private final ApplicationEventPublisher eventPublisher;

    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp", ".gif");

    /**
     * Constructs the EventService with required repositories and logger.
     */
    public EventService(EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            UserRepository userRepository,
            SecurityAuditLogger auditLogger) {
        this(eventRepository, registrationRepository, userRepository, auditLogger, null);
    }

    /**
     * Constructs the EventService with event publisher for domain telemetry events.
     */
    @Autowired
    public EventService(EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            UserRepository userRepository,
            SecurityAuditLogger auditLogger,
            @Autowired(required = false) ApplicationEventPublisher eventPublisher) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.auditLogger = auditLogger;
        this.eventPublisher = eventPublisher;
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
     * Registers a user for an event with pessimistic write lock, capacity check, and domain event emission.
     * Throws EventCapacityExhaustedException if capacity is reached.
     *
     * @param eventId event identifier
     * @param userId user identifier
     * @return saved Registration entity
     */
    @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
    public Registration registerUserForEvent(@NonNull Long eventId, @NonNull Long userId) {
        Event event = eventRepository.findByIdWithPessimisticLock(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with ID: " + eventId));

        if (event.getStatus() != null && "CANCELLED".equalsIgnoreCase(event.getStatus().trim())) {
            throw new IllegalStateException("Cannot register for a cancelled event");
        }

        long confirmedCount = registrationRepository.countByEventId(eventId);
        if (event.getMaxCapacity() != null && event.getMaxCapacity() > 0 && confirmedCount >= event.getMaxCapacity()) {
            throw new EventCapacityExhaustedException("Event capacity exhausted for event: " + event.getTitle());
        }

        if (registrationRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new IllegalStateException("User " + userId + " is already registered for event: " + eventId);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        Registration registration = new Registration();
        registration.setUser(user);
        registration.setEvent(event);
        registration.setRegistrationDate(LocalDateTime.now());
        registration.setStatus("CONFIRMED");
        registration.setCheckedIn(false);
        registration.setTicketCode("TKT-" + event.getId() + "-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        Registration saved = registrationRepository.save(registration);
        if (eventPublisher != null) {
            eventPublisher.publishEvent(new RegistrationCompletedEvent(saved));
        }
        logger.info("AUDIT: User {} registered for event {} (Ticket: {})", user.getUsername(), event.getId(), saved.getTicketCode());
        return saved;
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
        try {
            registerUserForEvent(eventId, userId);
            return true;
        } catch (EventNotFoundException | EventCapacityExhaustedException | IllegalStateException | IllegalArgumentException e) {
            logger.warn("Registration rejected for event {} user {}: {}", eventId, userId, e.getMessage());
            return false;
        }
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
        // Prevent CSV injection (Formula Injection)
        if (data.startsWith("=") || data.startsWith("+") || data.startsWith("-") || data.startsWith("@")) {
            data = "'" + data;
        }
        String escaped = data.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\n") || escaped.contains("\"")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    /**
     * Saves an uploaded image to the Event object (for DB storage), sanitizing the
     * filename
     * and checking for allowed extensions.
     */
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
            // We'll keep the imageUrl as a marker for now, or just set it to a special path
            // that our new controller will handle.
            event.setImageUrl("/api/public/events/image/" + UUID.randomUUID().toString()); // Placeholder to indicate
                                                                                           // image exists

            auditLogger.logFileUpload(username, originalFilename, imageFile.getSize(), "SUCCESS (DB)");
            return true;
        } catch (Exception e) {
            auditLogger.logFileUpload(username, originalFilename, imageFile.getSize(), "ERROR: " + e.getMessage());
            logger.error("Failed to process uploaded image for user {}: {}", username, e.getMessage(), e);
            return false;
        }
    }
}
