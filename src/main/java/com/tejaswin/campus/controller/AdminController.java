package com.tejaswin.campus.controller;

import com.tejaswin.campus.model.Event;
import com.tejaswin.campus.model.User;
import com.tejaswin.campus.service.EventService;
import com.tejaswin.campus.service.SessionService;
import com.tejaswin.campus.exception.EventNotFoundException;
import com.tejaswin.campus.exception.InvalidImageException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Controller
@RequestMapping("/admin")
@Validated
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    private final EventService eventService;
    private final SessionService sessionService;

    public AdminController(EventService eventService, SessionService sessionService) {
        this.eventService = eventService;
        this.sessionService = sessionService;
    }

    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public String adminDashboard(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            Model model) {

        long totalEvents = eventService.getTotalEventsCount();
        long totalRegistrations = eventService.getTotalRegistrationsCount();
        long upcomingEvents = eventService.getUpcomingEventsCount();
        long ongoingEvents = eventService.getOngoingEventsCount();
        long pastEvents = eventService.getPastEventsCount();

        org.springframework.data.domain.Page<Event> eventsPage;
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);

        if (search != null && !search.isBlank()) {
            eventsPage = eventService.searchEventsPage(search.trim(), pageable);
            model.addAttribute("searchQuery", search.trim());
        } else if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
            eventsPage = eventService.findEventsByStatusPage(status.trim(), pageable);
            model.addAttribute("activeStatus", status.trim());
        } else {
            eventsPage = eventService.findAllEventsPage(pageable);
        }

        java.util.Map<Long, Long> eventRegistrationCounts = eventService
                .getRegistrationCountsMap(eventsPage.getContent());
        java.util.Map<String, Long> categoryCountsMap = eventService.getCategoryCounts();

        model.addAttribute("totalEvents", totalEvents);
        model.addAttribute("totalRegistrations", totalRegistrations);
        model.addAttribute("upcomingEvents", upcomingEvents);
        model.addAttribute("ongoingEvents", ongoingEvents);
        model.addAttribute("pastEvents", pastEvents);
        model.addAttribute("categoryCounts", categoryCountsMap);
        model.addAttribute("eventRegistrationCounts", eventRegistrationCounts);

        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        model.addAttribute("sysMemoryUsed", usedMemory / (1024 * 1024));
        model.addAttribute("sysMemoryTotal", totalMemory / (1024 * 1024));
        model.addAttribute("sysCores", runtime.availableProcessors());

        model.addAttribute("events", eventsPage.getContent());
        model.addAttribute("currentPage", eventsPage.getNumber());
        model.addAttribute("totalPages", eventsPage.getTotalPages());
        model.addAttribute("totalItems", eventsPage.getTotalElements());
        model.addAttribute("user", sessionService.getLoggedInUser());
        model.addAttribute("newEvent", new Event());
        model.addAttribute("now", LocalDateTime.now());
        return "admin_dashboard";
    }

    @PostMapping("/add-event")
    @Transactional
    public String addEvent(@RequestParam @Size(max = 255, message = "Title too long") String title,
            @RequestParam @Size(max = 2000, message = "Description too long") String description,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTime,
            @RequestParam String venue,
            @RequestParam String category,
            @RequestParam(required = false) String registrationLink,
            @RequestParam(required = false) Integer maxCapacity,
            @RequestParam(required = false) MultipartFile imageFile,
            @RequestParam(required = false) String responsesLink,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDateTime,
            RedirectAttributes redirectAttributes,
            HttpServletRequest request) {

        if (endDateTime != null && endDateTime.isBefore(dateTime)) {
            redirectAttributes.addFlashAttribute("error", "End date cannot be before start date!");
            return "redirect:/admin/dashboard";
        }

        if (!isValidUrl(registrationLink) || !isValidUrl(responsesLink)) {
            redirectAttributes.addFlashAttribute("error", "Invalid URL format for links!");
            return "redirect:/admin/dashboard";
        }

        if (maxCapacity != null && maxCapacity < 1) {
            redirectAttributes.addFlashAttribute("error", "Max capacity must be at least 1!");
            return "redirect:/admin/dashboard";
        }

        try {
            Event event = new Event();
            event.setTitle(title);
            event.setDescription(description);
            event.setDateTime(dateTime);
            event.setVenue(venue);
            event.setCategory(category);
            event.setRegistrationLink(registrationLink);
            event.setMaxCapacity(maxCapacity);
            event.setResponsesLink(responsesLink);
            event.setEndDateTime(endDateTime);

            if (dateTime.isBefore(LocalDateTime.now())) {
                redirectAttributes.addFlashAttribute("error", "Event start date must be in the future!");
                return "redirect:/admin/dashboard";
            }

            User loggedInUser = sessionService.getLoggedInUser();
            if (loggedInUser == null) {
                logger.warn("AUDIT: Event addition attempted without active admin session.");
                return "redirect:/admin/login";
            }

            if (imageFile != null && !imageFile.isEmpty()) {
                boolean saved = eventService.saveUploadedImage(imageFile, loggedInUser.getUsername(), event);
                if (!saved) {
                    throw new InvalidImageException("Invalid image file. Allowed: JPG, PNG, WebP, GIF.");
                }
            }

            eventService.saveEvent(event);
            redirectAttributes.addFlashAttribute("success", "Event added successfully!");
        } catch (Exception e) {

            logger.error("Failed to add event: {}", e.getMessage(), e);
            throw e;
        }
        return "redirect:/admin/dashboard";
    }

    @PostMapping("/edit-event")
    @Transactional
    public String editEvent(@RequestParam @NonNull Long id,
            @RequestParam @Size(max = 255, message = "Title too long") String title,
            @RequestParam @Size(max = 2000, message = "Description too long") String description,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTime,
            @RequestParam String venue,
            @RequestParam String category,
            @RequestParam(required = false) String registrationLink,
            @RequestParam(required = false) Integer maxCapacity,
            @RequestParam(required = false) MultipartFile imageFile,
            @RequestParam(required = false) String responsesLink,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDateTime,
            RedirectAttributes redirectAttributes,
            HttpServletRequest request) {

        if (endDateTime != null && endDateTime.isBefore(dateTime)) {
            redirectAttributes.addFlashAttribute("error", "End date cannot be before start date!");
            return "redirect:/admin/dashboard";
        }

        if (!isValidUrl(registrationLink) || !isValidUrl(responsesLink)) {
            redirectAttributes.addFlashAttribute("error", "Invalid URL format for links!");
            return "redirect:/admin/dashboard";
        }

        if (maxCapacity != null && maxCapacity < 1) {
            redirectAttributes.addFlashAttribute("error", "Max capacity must be at least 1!");
            return "redirect:/admin/dashboard";
        }

        Event event = eventService.findEventById(id);
        if (event == null) {
            throw new EventNotFoundException("Event not found with ID: " + id);
        }

        try {
            event.setTitle(title);
            event.setDescription(description);
            event.setDateTime(dateTime);
            event.setVenue(venue);
            event.setCategory(category);
            event.setRegistrationLink(registrationLink);
            event.setMaxCapacity(maxCapacity);
            event.setResponsesLink(responsesLink);
            event.setEndDateTime(endDateTime);

            User loggedInUser = sessionService.getLoggedInUser();
            if (loggedInUser == null) {
                logger.warn("AUDIT: Event edit attempted without active admin session for ID: {}", id);
                return "redirect:/admin/login";
            }

            if (imageFile != null && !imageFile.isEmpty()) {
                boolean saved = eventService.saveUploadedImage(imageFile, loggedInUser.getUsername(), event);

                if (!saved) {
                    throw new InvalidImageException("Invalid image file. Allowed: JPG, PNG, WebP, GIF.");
                }
            }

            eventService.saveEvent(event);
            redirectAttributes.addFlashAttribute("success", "Event updated successfully!");
        } catch (Exception e) {

            logger.error("Failed to edit event (ID: {}): {}", id, e.getMessage(), e);
            throw e;
        }
        return "redirect:/admin/dashboard";
    }

    @PostMapping("/delete-event/{id}")
    @Transactional
    public String deleteEvent(@PathVariable @NonNull Long id,
            RedirectAttributes redirectAttributes) {

        eventService.deleteEvent(id);
        redirectAttributes.addFlashAttribute("success", "Event deleted successfully!");
        return "redirect:/admin/dashboard";
    }

    @GetMapping("/export-events")
    public ResponseEntity<byte[]> exportEvents() {

        byte[] csvData = eventService.getAllEventsAsCsv();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=campus_events_report.csv")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv")
                .body(csvData);
    }

    private boolean isValidUrl(String url) {
        if (url == null || url.isBlank())
            return true;
        String lower = url.toLowerCase();
        return lower.startsWith("http://") || lower.startsWith("https://");
    }
}
