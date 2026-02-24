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

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class EventService {

    private static final Logger logger = LoggerFactory.getLogger(EventService.class);

    private final EventRepository eventRepository;

    private final RegistrationRepository registrationRepository;

    private final UserRepository userRepository;

    private final Path uploadBaseDir;

    /**
     * Constructs the EventService with required repositories and resolves the base
     * upload directory.
     *
     * @param eventRepository        repository for events
     * @param registrationRepository repository for registrations
     * @param userRepository         repository for users
     * @param uploadDir              configured upload directory (relative or
     *                               absolute)
     */
    public EventService(EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            UserRepository userRepository,
            @Value("${app.upload-dir:uploads}") String uploadDir) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        String effectiveDir = (uploadDir == null || uploadDir.isBlank()) ? "uploads" : uploadDir;
        this.uploadBaseDir = Paths.get(effectiveDir).toAbsolutePath().normalize();
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

    /**
     * Registers user interest in an event for analytics (status INTERESTED).
     * No-op if a registration already exists for the user-event pair.
     *
     * @param eventId event id
     * @param userId  user id
     * @return true if created, false if already existed or invalid ids
     */
    @Transactional
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
            try {
                String imageUrl = event.getImageUrl();
                if (imageUrl.startsWith("/uploads/")) {
                    String filename = imageUrl.substring("/uploads/".length());
                    Path path = uploadBaseDir.resolve(filename).normalize();
                    if (path.startsWith(uploadBaseDir)) {
                        Files.deleteIfExists(path);
                        logger.info("AUDIT: Deleted image file: {}", path);
                    } else {
                        logger.warn("Security: Path traversal attempt prevented during deletion: {}", imageUrl);
                    }
                }
            } catch (Exception e) {
                logger.error("Failed to delete image file for event ID: {}", id, e);
            }
        }

        registrationRepository.deleteByEventId(id);
        eventRepository.deleteById(id);
        logger.warn("AUDIT: Event deleted (ID: {})", id);
    }

    // Analytics
    /**
     * @return total number of registrations across all events
     */
    @Transactional(readOnly = true)
    public long getTotalRegistrations() {
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
     * @param events events to include
     * @return map of counts (never null)
     */
    @Transactional(readOnly = true)
    public Map<Long, Long> getRegistrationCountsMap(List<Event> events) {
        Map<Long, Long> counts = new HashMap<>();
        // Initialize all events with 0
        for (Event event : events) {
            counts.put(event.getId(), 0L);
        }
        // Single aggregate query — fixes N+1
        List<Object[]> results = registrationRepository.countRegistrationsGroupedByEvent();
        for (Object[] row : results) {
            Long eventId = (Long) row[0];
            Long count = (Long) row[1];
            counts.put(eventId, count);
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
        long total = eventRepository.count();
        long upcoming = getUpcomingEventsCount();
        return total - upcoming;
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
        csv.append("ID,Title,Category,Venue,Start DateTime,End DateTime,Capacity,Status\n");

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
            String status;
            if (start == null) {
                status = "Unknown";
            } else {
                status = start.isAfter(LocalDateTime.now()) ? "Upcoming" : "Past";
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
}
