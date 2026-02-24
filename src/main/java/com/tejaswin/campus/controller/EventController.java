package com.tejaswin.campus.controller;

import com.tejaswin.campus.model.Event;
import com.tejaswin.campus.model.User;
import com.tejaswin.campus.service.EventService;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequestMapping("/student")
public class EventController {

    private static final Logger logger = LoggerFactory.getLogger(EventController.class);

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping("/dashboard")
    public String studentDashboard(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            HttpSession session, Model model) {

        User user = (User) session.getAttribute("loggedInUser");
        logger.debug("Dashboard accessed. User in session? {}", (user != null));
        if (user == null) {
            logger.warn("No user in session. Redirecting to root.");
            return "redirect:/";
        }

        List<Event> events;
        if (search != null && !search.trim().isEmpty()) {
            events = eventService.searchEvents(search);
            model.addAttribute("searchQuery", search);
        } else if (category != null && !category.trim().isEmpty() && !"all".equalsIgnoreCase(category)) {
            events = eventService.findEventsByCategory(category);
            model.addAttribute("activeCategory", category);
        } else {
            events = eventService.findAllEvents();
        }

        model.addAttribute("events", events);
        model.addAttribute("user", user);
        model.addAttribute("now", java.time.LocalDateTime.now());
        return "dashboard";
    }

    @GetMapping("/register-external/{eventId}")
    public String registerExternal(@PathVariable @NonNull Long eventId, HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user == null) {
            return "redirect:/";
        }

        // Track interest for analytics
        eventService.registerStudent(eventId, user.getId());

        Event event = eventService.findEventById(eventId);
        if (event != null && event.getRegistrationLink() != null && !event.getRegistrationLink().isEmpty()) {

            // --- FIX: Implement the tracking logic ---
            logger.info("ANALYTICS: User {} ({}) clicked registration link for Event ID: {}",
                    user.getUsername(), user.getId(), eventId);

            String link = event.getRegistrationLink().trim();
            // Security: Only allow HTTP/HTTPS redirects to prevent open-redirect attacks
            if (link.startsWith("http://") || link.startsWith("https://")) {
                return "redirect:" + link;
            }
            logger.warn("SECURITY: Blocked redirect to untrusted URL scheme for event {}: {}", eventId, link);
        }

        return "redirect:/student/event/" + eventId;
    }

    @GetMapping("/event/{id}")
    public String eventDetail(@PathVariable Long id, HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user == null) {
            return "redirect:/";
        }
        return "redirect:/student/dashboard?open=" + id;
    }
}
