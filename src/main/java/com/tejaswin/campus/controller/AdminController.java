package com.tejaswin.campus.controller;

import com.tejaswin.campus.model.Event;
import com.tejaswin.campus.model.User;
import com.tejaswin.campus.service.EventService;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.tejaswin.campus.config.AppConfig;
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

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp", ".gif");

    private final EventService eventService;

    private final Path uploadBaseDir;

    public AdminController(EventService eventService, AppConfig appConfig) {
        this.eventService = eventService;
        this.uploadBaseDir = Paths.get(appConfig.getUploadDir()).toAbsolutePath().normalize();
    }

    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public String adminDashboard(HttpSession session, Model model) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user == null || !"ADMIN".equals(user.getRole())) {
            return "redirect:/";
        }

        List<Event> events = eventService.findAllEvents();
        // Analytics
        model.addAttribute("totalEvents", events.size());
        model.addAttribute("categoryCounts", eventService.getCategoryCounts());
        model.addAttribute("upcomingEvents", eventService.getUpcomingEventsCount());
        model.addAttribute("pastEvents", eventService.getPastEventsCount());

        // System Health
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        model.addAttribute("sysMemoryUsed", usedMemory / (1024 * 1024)); // MB
        model.addAttribute("sysMemoryTotal", totalMemory / (1024 * 1024)); // MB
        model.addAttribute("sysCores", runtime.availableProcessors());

        model.addAttribute("events", events);
        model.addAttribute("user", user);
        model.addAttribute("newEvent", new Event());
        model.addAttribute("now", LocalDateTime.now());
        return "admin_dashboard";
    }

    @PostMapping("/add-event")
    public String addEvent(@RequestParam String title,
            @RequestParam String description,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTime,
            @RequestParam String venue,
            @RequestParam String category,
            @RequestParam(required = false) String registrationLink,
            @RequestParam(required = false) Integer maxCapacity,
            @RequestParam(required = false) MultipartFile imageFile,
            @RequestParam(required = false) String responsesLink,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDateTime,
            HttpSession session,
            RedirectAttributes redirectAttributes) {

        User user = (User) session.getAttribute("loggedInUser");
        if (user == null || !"ADMIN".equals(user.getRole())) {
            return "redirect:/";
        }

        // Integrity Check: End Date > Start Date
        if (endDateTime != null && endDateTime.isBefore(dateTime)) {
            redirectAttributes.addFlashAttribute("error", "End date cannot be before start date!");
            return "redirect:/admin/dashboard";
        }

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

        if (imageFile != null && !imageFile.isEmpty()) {
            String savedUrl = saveUploadedImage(imageFile);
            if (savedUrl != null) {
                event.setImageUrl(savedUrl);
            } else {
                redirectAttributes.addFlashAttribute("error", "Invalid image file. Allowed: JPG, PNG, WebP, GIF.");
                return "redirect:/admin/dashboard";
            }
        }

        eventService.saveEvent(event);
        redirectAttributes.addFlashAttribute("success", "Event added successfully!");
        return "redirect:/admin/dashboard";
    }

    @PostMapping("/edit-event")
    public String editEvent(@RequestParam @NonNull Long id,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTime,
            @RequestParam String venue,
            @RequestParam String category,
            @RequestParam(required = false) String registrationLink,
            @RequestParam(required = false) Integer maxCapacity,
            @RequestParam(required = false) MultipartFile imageFile,
            @RequestParam(required = false) String responsesLink,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDateTime,
            HttpSession session,
            RedirectAttributes redirectAttributes) {

        User user = (User) session.getAttribute("loggedInUser");
        if (user == null || !"ADMIN".equals(user.getRole())) {
            return "redirect:/";
        }

        // Integrity Check: End Date > Start Date
        if (endDateTime != null && endDateTime.isBefore(dateTime)) {
            redirectAttributes.addFlashAttribute("error", "End date cannot be before start date!");
            return "redirect:/admin/dashboard";
        }

        Event event = eventService.findEventById(id);
        if (event != null) {
            event.setTitle(title);
            event.setDescription(description);
            event.setDateTime(dateTime);
            event.setVenue(venue);
            event.setCategory(category);
            event.setRegistrationLink(registrationLink);
            event.setMaxCapacity(maxCapacity);
            event.setResponsesLink(responsesLink);
            event.setEndDateTime(endDateTime);

            if (imageFile != null && !imageFile.isEmpty()) {
                String oldUrl = event.getImageUrl();
                String savedUrl = saveUploadedImage(imageFile);

                // --- FIX: Stop execution if validation fails ---
                if (savedUrl == null) {
                    redirectAttributes.addFlashAttribute("error", "Invalid image file. Allowed: JPG, PNG, WebP, GIF.");
                    return "redirect:/admin/dashboard";
                }

                event.setImageUrl(savedUrl);
                // Best-effort delete of old image to prevent orphaned files
                if (oldUrl != null && oldUrl.startsWith("/uploads/")) {
                    try {
                        String oldFile = oldUrl.substring("/uploads/".length());
                        Path oldPath = uploadBaseDir.resolve(oldFile).normalize();
                        if (oldPath.startsWith(uploadBaseDir)) {
                            Files.deleteIfExists(oldPath);
                            logger.info("AUDIT: Deleted old image file: {}", oldPath);
                        } else {
                            logger.warn("Security: Path traversal attempt prevented during edit deletion: {}",
                                    oldUrl);
                        }
                    } catch (Exception e) {
                        logger.warn("Failed to delete old image file: {}", oldUrl, e);
                    }
                }
            }

            eventService.saveEvent(event);
            redirectAttributes.addFlashAttribute("success", "Event updated successfully!");
        } else {
            redirectAttributes.addFlashAttribute("error", "Event not found!");
        }
        return "redirect:/admin/dashboard";
    }

    @PostMapping("/delete-event/{id}")
    public String deleteEvent(@PathVariable @NonNull Long id,
            HttpSession session,
            RedirectAttributes redirectAttributes) {

        User user = (User) session.getAttribute("loggedInUser");
        if (user == null || !"ADMIN".equals(user.getRole())) {
            return "redirect:/";
        }

        eventService.deleteEvent(id);
        redirectAttributes.addFlashAttribute("success", "Event deleted successfully!");
        return "redirect:/admin/dashboard";
    }

    @GetMapping("/export-events")
    public ResponseEntity<byte[]> exportEvents(HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user == null || !"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).build();
        }

        byte[] csvData = eventService.getAllEventsAsCsv();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=campus_events_report.csv")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv")
                .body(csvData);
    }

    // --- Private Helpers ---

    /**
     * Validates and saves an uploaded image file.
     * 
     * @return the URL path to the saved image, or null if validation fails.
     */
    private String saveUploadedImage(MultipartFile imageFile) {
        String originalFilename = imageFile.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            return null;
        }

        // Sanitize: replace any character that is not alphanumeric, dot, underscore, or
        // hyphen with '_'
        String sanitizedFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");

        if (sanitizedFilename.contains("..")) {
            logger.warn("Security: Path traversal attempt detected in filename: {}", originalFilename);
            return null;
        }

        // Extension check (O(1))
        String ext = "";
        int i = sanitizedFilename.lastIndexOf('.');
        if (i > 0) {
            ext = sanitizedFilename.substring(i); // includes the dot, e.g. ".jpg"
        }

        if (!ALLOWED_IMAGE_EXTENSIONS.contains(ext.toLowerCase())) {
            logger.warn("Rejected upload with invalid extension: {}", originalFilename);
            return null;
        }

        try {
            String fileName = UUID.randomUUID().toString() + ext;
            Path targetPath = uploadBaseDir.resolve(fileName).normalize();

            // Ensure we don't traverse outside the upload directory
            if (!targetPath.startsWith(uploadBaseDir)) {
                logger.warn("Security: Path traversal attempt prevented for file: {}", fileName);
                return null;
            }

            if (!Files.exists(uploadBaseDir)) {
                Files.createDirectories(uploadBaseDir);
            }

            // Explicit TOCTOU Symlink check
            if (Files.isSymbolicLink(targetPath)) {
                logger.warn("Security: Attempted to overwrite symbolic link: {}", targetPath);
                return null;
            }

            try (var inputStream = imageFile.getInputStream()) {
                Files.copy(inputStream, targetPath,
                        java.nio.file.StandardCopyOption.REPLACE_EXISTING,
                        java.nio.file.LinkOption.NOFOLLOW_LINKS);
            }
            return "/uploads/" + fileName;
        } catch (java.io.IOException e) {
            logger.error("Failed to save uploaded image: {}", originalFilename, e);
            return null;
        }
    }
}
