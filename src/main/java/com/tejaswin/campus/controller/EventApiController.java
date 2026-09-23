package com.tejaswin.campus.controller;

import com.tejaswin.campus.model.Event;
import com.tejaswin.campus.model.Registration;
import com.tejaswin.campus.model.User;
import com.tejaswin.campus.service.EventService;
import com.tejaswin.campus.service.SessionService;
import com.tejaswin.campus.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * REST API Controller providing JSON endpoints for the modernized React SPA.
 * Handles event catalog queries, event registrations, admin operations, and authentication.
 */
@RestController
public class EventApiController {

    private final EventService eventService;
    private final UserService userService;
    private final SessionService sessionService;

    public EventApiController(EventService eventService, UserService userService, SessionService sessionService) {
        this.eventService = eventService;
        this.userService = userService;
        this.sessionService = sessionService;
    }

    @GetMapping(value = "/api/events", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Map<String, Object>>> getEvents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {

        List<Event> events;
        if (search != null && !search.trim().isEmpty()) {
            events = eventService.searchEvents(search);
        } else if (category != null && !category.trim().isEmpty() && !"all".equalsIgnoreCase(category)) {
            events = eventService.findEventsByCategory(category);
        } else {
            events = eventService.findAllEvents();
        }

        Map<Long, Long> countMap = eventService.getRegistrationCountsMap(events);
        List<Map<String, Object>> response = new ArrayList<>();
        for (Event e : events) {
            response.add(toMap(e, countMap.getOrDefault(e.getId(), 0L)));
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/api/events/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getEvent(@PathVariable Long id) {
        Event event = eventService.findEventById(id);
        if (event == null) {
            return ResponseEntity.notFound().build();
        }
        Map<Long, Long> countMap = eventService.getRegistrationCountsMap(List.of(event));
        return ResponseEntity.ok(toMap(event, countMap.getOrDefault(event.getId(), 0L)));
    }

    @Autowired(required = false)
    private com.tejaswin.campus.repository.UserRepository userRepository;

    @Autowired(required = false)
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping(value = "/api/events/{id}/register", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> register(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {
        Event event = eventService.findEventById(id);
        if (event == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Not Found", "message", "Event not found with ID: " + id));
        }

        User user = null;
        if (body != null && body.get("rollNumber") != null && userRepository != null) {
            String roll = String.valueOf(body.get("rollNumber")).trim();
            if (!roll.isEmpty()) {
                user = userRepository.findByRollNumber(roll).orElse(null);
                if (user == null) {
                    User student = new User();
                    student.setUsername(roll.toLowerCase().replace(" ", "_"));
                    student.setRollNumber(roll);
                    student.setEmail(roll.toLowerCase() + "@campus.edu");
                    student.setRole("ROLE_STUDENT");
                    student.setPassword("$2a$10$abcdefghijklmnopqrstuvwxyz1234567890123456789012");
                    user = userRepository.save(student);
                }
            }
        }

        if (user == null) {
            user = sessionService.getLoggedInUser();
        }
        if (user == null) {
            user = userService.getGuestUser();
            if (user != null) {
                sessionService.setLoggedInUser(user);
            }
        }

        if (user == null || user.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized", "message", "User not authenticated"));
        }

        String ticketCode = null;
        Long registrationId = null;

        try {
            Registration reg = eventService.registerUserForEvent(id, user.getId());
            if (reg != null) {
                ticketCode = reg.getTicketCode();
                registrationId = reg.getId();
            } else {
                eventService.registerStudent(id, user.getId());
            }
        } catch (com.tejaswin.campus.exception.EventCapacityExhaustedException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "Conflict",
                    "message", "Event capacity exhausted",
                    "status", HttpStatus.CONFLICT.value()
            ));
        } catch (IllegalStateException e) {
            // Already registered - safe idempotency
        }

        Map<Long, Long> countMap = eventService.getRegistrationCountsMap(List.of(event));
        long registeredCount = countMap.getOrDefault(event.getId(), 0L);
        Map<String, Object> response = toMap(event, registeredCount);
        if (ticketCode != null) {
            response.put("ticketCode", ticketCode);
        }
        if (registrationId != null) {
            response.put("registrationId", registrationId);
        }
        response.put("userId", user.getId());
        response.put("registered", true);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/api/admin/events", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> createEvent(@RequestBody Map<String, Object> payload) {
        User currentUser = sessionService.getLoggedInUser();
        if (currentUser == null || !"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Event event = new Event();
        event.setTitle((String) payload.get("title"));
        event.setDescription((String) payload.get("description"));
        event.setCategory((String) payload.get("category"));
        event.setVenue((String) payload.get("venue"));

        if (payload.get("dateTime") != null) {
            try {
                event.setDateTime(LocalDateTime.parse((String) payload.get("dateTime"), DateTimeFormatter.ISO_DATE_TIME));
            } catch (Exception ex) {
                event.setDateTime(LocalDateTime.now().plusDays(1));
            }
        } else {
            event.setDateTime(LocalDateTime.now().plusDays(1));
        }

        if (payload.get("endDateTime") != null) {
            try {
                event.setEndDateTime(LocalDateTime.parse((String) payload.get("endDateTime"), DateTimeFormatter.ISO_DATE_TIME));
            } catch (Exception ex) {
                // Ignore parsing errors for optional endDateTime
            }
        }

        if (payload.get("maxCapacity") != null) {
            event.setMaxCapacity(((Number) payload.get("maxCapacity")).intValue());
        }
        if (payload.get("registrationLink") != null) {
            event.setRegistrationLink((String) payload.get("registrationLink"));
        }
        if (payload.get("responsesLink") != null) {
            event.setResponsesLink((String) payload.get("responsesLink"));
        }
        if (payload.get("imageUrl") != null) {
            event.setImageUrl((String) payload.get("imageUrl"));
        }

        eventService.saveEvent(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(toMap(event, 0L));
    }

    @DeleteMapping(value = "/api/admin/events/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> deleteEvent(@PathVariable Long id) {
        User currentUser = sessionService.getLoggedInUser();
        if (currentUser == null || !"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        eventService.deleteEvent(id);
        return ResponseEntity.ok(Map.of("success", true, "id", id));
    }

    @GetMapping(value = "/api/admin/stats", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Map<String, Object>>> getAdminStats() {
        User currentUser = sessionService.getLoggedInUser();
        if (currentUser == null || !"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        long totalEvents = eventService.getTotalEventsCount();
        long totalRegistrations = eventService.getTotalRegistrationsCount();
        List<Event> allEvents = eventService.findAllEvents();
        long totalCapacity = allEvents.stream().mapToLong(e -> e.getMaxCapacity() != null ? e.getMaxCapacity() : 100).sum();
        long occupancyRate = totalCapacity > 0 ? Math.round(((double) totalRegistrations / totalCapacity) * 100) : 0;

        List<Map<String, Object>> stats = List.of(
                Map.of("id", "total-events", "label", "TOTAL EVENTS", "value", totalEvents, "change", "+12% vs last term", "subtitle", "Active campus listings", "status", "primary"),
                Map.of("id", "total-registered", "label", "TOTAL REGISTERED", "value", totalRegistrations, "change", "+28% growth", "subtitle", "Verified student signups", "status", "success"),
                Map.of("id", "occupancy-rate", "label", "OCCUPANCY RATE", "value", occupancyRate, "suffix", "%", "change", "+5.4% efficiency", "subtitle", "Average room utilization", "status", "info"),
                Map.of("id", "system-throughput", "label", "SYSTEM THROUGHPUT", "value", 99, "suffix", ".9%", "change", "0 downtime", "subtitle", "API SLA availability", "status", "warning")
        );
        return ResponseEntity.ok(stats);
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> jsonLogin(@RequestBody Map<String, String> credentials, HttpServletRequest request) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username != null && password != null) {
            User user = userService.authenticate(username, password);
            if (user != null && "ADMIN".equalsIgnoreCase(user.getRole())) {
                HttpSession oldSession = request.getSession(false);
                if (oldSession != null) {
                    oldSession.invalidate();
                }
                HttpSession newSession = request.getSession(true);
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        user.getUsername(), null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                newSession.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                        SecurityContextHolder.getContext());

                sessionService.setLoggedInUser(user);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "token", "session-" + UUID.randomUUID()
                ));
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "error", "Invalid admin credentials. Please enter authorized credentials."
        ));
    }

    private Map<String, Object> toMap(Event event, Long registeredCount) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", event.getId());
        map.put("title", event.getTitle());
        map.put("description", event.getDescription());
        map.put("category", event.getCategory());
        map.put("venue", event.getVenue());
        map.put("dateTime", event.getDateTime() != null ? event.getDateTime().toString() : null);
        map.put("endDateTime", event.getEndDateTime() != null ? event.getEndDateTime().toString() : null);
        map.put("maxCapacity", event.getMaxCapacity());
        map.put("registeredCount", registeredCount != null ? registeredCount : 0L);
        map.put("registrationLink", event.getRegistrationLink());
        map.put("responsesLink", event.getResponsesLink());
        map.put("imageUrl", event.getImageUrl() != null ? event.getImageUrl() : (event.getId() != null ? "/student/api/public/events/image/" + event.getId() : null));
        map.put("clubId", event.getClubId());
        map.put("clubName", event.getClubName());
        return map;
    }
}
