package com.tejaswin.campus.controller;

import com.tejaswin.campus.model.Event;
import com.tejaswin.campus.model.User;
import com.tejaswin.campus.service.EventService;
import com.tejaswin.campus.service.SessionService;
import com.tejaswin.campus.security.SecurityAuditLogger;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.CacheControl;
import java.util.concurrent.TimeUnit;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import jakarta.servlet.http.HttpServletRequest;

@Controller
@RequestMapping("/student")
public class EventController {

    private static final Logger logger = LoggerFactory.getLogger(EventController.class);

    private final EventService eventService;
    private final SessionService sessionService;
    private final SecurityAuditLogger auditLogger;

    public EventController(EventService eventService, SessionService sessionService, SecurityAuditLogger auditLogger) {
        this.eventService = eventService;
        this.sessionService = sessionService;
        this.auditLogger = auditLogger;
    }

    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public String studentDashboard(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Model model) {

        User user = sessionService.getLoggedInUser();
        if (user == null) {
            return "redirect:/";
        }

        org.springframework.data.domain.Page<Event> eventsPage;
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);

        if (search != null && !search.trim().isEmpty()) {
            String sanitizedSearch = search.trim();
            if (sanitizedSearch.length() > 200) {
                sanitizedSearch = sanitizedSearch.substring(0, 200);
            }
            eventsPage = eventService.searchEventsPage(sanitizedSearch, pageable);
            model.addAttribute("searchQuery", sanitizedSearch);
        } else if (category != null && !category.trim().isEmpty() && !"all".equalsIgnoreCase(category)) {
            eventsPage = eventService.findEventsByCategoryPage(category, pageable);
            model.addAttribute("activeCategory", category);
        } else {
            eventsPage = eventService.findAllEventsPage(pageable);
        }

        if (eventsPage == null) {
            eventsPage = org.springframework.data.domain.Page.empty();
        }

        model.addAttribute("events", eventsPage.getContent());
        model.addAttribute("currentPage", eventsPage.getNumber());
        model.addAttribute("totalPages", eventsPage.getTotalPages());
        model.addAttribute("totalItems", eventsPage.getTotalElements());
        model.addAttribute("user", user);
        model.addAttribute("now", java.time.LocalDateTime.now());
        return "dashboard";
    }

    @GetMapping("/register-external/{eventId}")
    @CircuitBreaker(name = "registrationService", fallbackMethod = "registrationFallback")
    @Transactional
    public String registerExternal(@PathVariable(name = "eventId") Long eventId) {
        User user = sessionService.getLoggedInUser();
        if (user == null) {
            return "redirect:/";
        }

        if (eventId == null) {
            return "redirect:/student/dashboard";
        }

        if (user.getId() == null) {
            logger.warn("User {} has null ID, skipping registration", user.getUsername());
            return "redirect:/student/event/" + eventId;
        }

        auditLogger.logSecurityLinkClick(user.getUsername(), "REGISTER_EXTERNAL", eventId);
        Long studentId = user.getId();
        if (studentId != null) {
            eventService.registerStudent(eventId, studentId);
        }

        Event event = eventService.findEventById(eventId);
        if (event != null && event.getRegistrationLink() != null && !event.getRegistrationLink().isEmpty()) {

            String link = event.getRegistrationLink().trim();

            if (link.startsWith("http://") || link.startsWith("https://")) {
                return "redirect:" + link;
            }
            logger.warn("SECURITY: Blocked redirect to untrusted URL scheme for event {}: {}", eventId, link);
        }

        return "redirect:/student/event/" + eventId;
    }

    public String registrationFallback(Long eventId, Exception e) {
        logger.error("Circuit breaker triggered for registration of event {}: {}", eventId, e.getMessage());
        return "redirect:/student/event/" + eventId + "?error=service_unavailable";
    }

    @GetMapping("/event/{id}")
    public String eventDetail(@PathVariable Long id, Model model,
            HttpServletRequest request) {
        Event event = eventService.findEventById(id);
        if (event == null) {
            return "redirect:/student/dashboard";
        }

        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .build()
                .toUriString();
        model.addAttribute("baseUrl", baseUrl);
        model.addAttribute("event", event);
        return "event_detail";
    }

    @GetMapping("/api/public/events/image/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> getEventImage(@PathVariable Long id) {
        Event event = eventService.findEventById(id);
        if (event == null || event.getImageData() == null) {
            return ResponseEntity.notFound().build();
        }

        MediaType mediaType = MediaType.IMAGE_JPEG;
        String storedMimeType = event.getImageMimeType();
        if (storedMimeType != null) {
            try {
                mediaType = MediaType.parseMediaType(storedMimeType);
            } catch (Exception e) {
                logger.warn("Invalid MIME type stored for event {}: {}", id, storedMimeType);
            }
        }

        byte[] imageData = event.getImageData();
        if (imageData == null) {
            return ResponseEntity.notFound().build();
        }

        String etag = Integer.toHexString(java.util.Arrays.hashCode(imageData));

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable())
                .eTag(etag)
                .contentType(mediaType)
                .body(imageData);
    }
}
