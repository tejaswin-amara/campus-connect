package com.tejaswin.campus.controller;

import com.tejaswin.campus.dto.*;
import com.tejaswin.campus.exception.EventNotFoundException;
import com.tejaswin.campus.model.Club;
import com.tejaswin.campus.model.Event;
import com.tejaswin.campus.model.Registration;
import com.tejaswin.campus.model.User;
import com.tejaswin.campus.repository.ClubRepository;
import com.tejaswin.campus.repository.EventRepository;
import com.tejaswin.campus.repository.RegistrationRepository;
import com.tejaswin.campus.repository.UserRepository;
import com.tejaswin.campus.security.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/organizer")
@PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
public class OrganizerController {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;

    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public OrganizerController(EventRepository eventRepository,
                               RegistrationRepository registrationRepository,
                               ClubRepository clubRepository,
                               UserRepository userRepository,
                               @org.springframework.beans.factory.annotation.Autowired(required = false) org.springframework.context.ApplicationEventPublisher eventPublisher) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.clubRepository = clubRepository;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }

    @GetMapping(value = "/clubs/my-club", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getMyClub() {
        CustomUserDetails user = getCurrentUserDetails();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized", "message", "User not authenticated"));
        }

        Long clubId = user.getClubId();
        if (clubId == null && user.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            clubId = 1L; // Fallback to primary club for admin inspection
        }

        if (clubId == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Not Found", "message", "User is not assigned to any club"));
        }

        Club club = clubRepository.findById(clubId).orElse(null);
        if (club == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Not Found", "message", "Assigned club not found"));
        }

        long totalEvents = eventRepository.countByClubId(club.getId());
        long totalRsvps = registrationRepository.countByEvent_Club_Id(club.getId());
        long totalCheckedIn = registrationRepository.countByEvent_Club_IdAndCheckedInTrue(club.getId());

        ClubDetailResponse response = new ClubDetailResponse(
                club.getId(),
                club.getName(),
                club.getSlug(),
                club.getCategory(),
                club.getDescription(),
                club.getLogoUrl(),
                club.getLeadUserId(),
                totalEvents,
                totalRsvps,
                totalCheckedIn
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = {"/events", "/my-events"}, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getMyEvents() {
        CustomUserDetails user = getCurrentUserDetails();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized", "message", "User not authenticated"));
        }

        Long clubId = user.getClubId();
        List<Event> events;

        if (clubId == null && user.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            events = eventRepository.findAllByOrderByDateTimeDesc();
        } else if (clubId != null) {
            events = eventRepository.findByClubIdOrderByDateTimeDesc(clubId);
        } else {
            events = Collections.emptyList();
        }

        List<OrganizerEventItem> result = events.stream().map(this::toOrganizerEventItem).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping(value = "/events", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createClubEvent(@Valid @RequestBody CreateClubEventRequest request) {
        CustomUserDetails user = getCurrentUserDetails();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized", "message", "User not authenticated"));
        }

        Long clubId = user.getClubId();
        if (clubId == null && user.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            clubId = 1L; // Fallback to primary club for admin creation
        }

        if (clubId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Bad Request", "message", "User is not affiliated with any club to author events"));
        }

        Club club = clubRepository.findById(clubId).orElse(null);
        if (club == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Not Found", "message", "Assigned club not found"));
        }

        if (request.getEndDateTime() != null && request.getEndDateTime().isBefore(request.getDateTime())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Bad Request", "message", "End date cannot be before start date"));
        }

        if (request.getMaxCapacity() <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Bad Request", "message", "Max capacity must be at least 1"));
        }

        Event event = new Event();
        event.setTitle(request.getTitle().trim());
        event.setDescription(request.getDescription().trim());
        event.setDateTime(request.getDateTime());
        event.setEndDateTime(request.getEndDateTime());
        event.setVenue(request.getVenue().trim());
        event.setCategory(request.getCategory().trim());
        event.setStatus(request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "PUBLISHED");
        event.setMaxCapacity(request.getMaxCapacity());
        event.setRegistrationLink(request.getRegistrationLink());
        event.setImageUrl(request.getImageUrl());
        event.setClub(club);

        Event saved = eventRepository.save(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(toOrganizerEventItem(saved));
    }

    @GetMapping(value = "/events/{id}/attendees", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("@securityService.canManageEvent(principal, #id)")
    public ResponseEntity<?> getEventAttendees(@PathVariable Long id) {
        Event event = eventRepository.findById(id).orElse(null);
        if (event == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Not Found", "message", "Event not found with ID: " + id));
        }

        List<Registration> registrations = registrationRepository.findByEventIdWithUser(id);
        List<AttendeeItem> attendeeItems = registrations.stream().map(r -> {
            User u = r.getUser();
            return new AttendeeItem(
                    r.getId(),
                    u.getId(),
                    u.getUsername(),
                    u.getEmail(),
                    u.getRollNumber(),
                    u.getDepartment(),
                    r.isCheckedIn(),
                    r.getCheckInTime(),
                    r.getTicketCode(),
                    r.getRegistrationDate(),
                    r.getStatus()
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(attendeeItems);
    }

    @PostMapping(value = "/events/{id}/check-in", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("@securityService.canManageEvent(principal, #id)")
    public ResponseEntity<?> checkInAttendee(@PathVariable Long id, @RequestBody CheckInRequest request) {
        Event event = eventRepository.findById(id).orElse(null);
        if (event == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Not Found", "message", "Event not found with ID: " + id));
        }

        String ticketCode = request.getTicketCode() != null ? request.getTicketCode().trim() : null;
        String rollNumber = request.getRollNumber() != null ? request.getRollNumber().trim() : null;

        if ((ticketCode == null || ticketCode.isEmpty()) && (rollNumber == null || rollNumber.isEmpty())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Bad Request", "message", "Either ticketCode or rollNumber must be provided"));
        }

        Optional<Registration> regOpt = Optional.empty();
        if (ticketCode != null && !ticketCode.isEmpty()) {
            regOpt = registrationRepository.findByEventIdAndTicketCode(id, ticketCode);
        }
        if (regOpt.isEmpty() && rollNumber != null && !rollNumber.isEmpty()) {
            regOpt = registrationRepository.findByEventIdAndRollNumber(id, rollNumber);
        }

        if (regOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Not Found", "message", "Registration not found for event " + id + " matching provided credentials"));
        }

        Registration registration = regOpt.get();
        if (registration.isCheckedIn()) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("error", "Bad Request");
            error.put("message", "Attendee " + registration.getUser().getUsername() + " already checked in at " + registration.getCheckInTime());
            error.put("status", HttpStatus.BAD_REQUEST.value());
            error.put("checkInTime", registration.getCheckInTime());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        registration.setCheckedIn(true);
        registration.setCheckInTime(LocalDateTime.now());
        Registration savedReg = registrationRepository.save(registration);
        if (eventPublisher != null) {
            eventPublisher.publishEvent(new com.tejaswin.campus.event.CheckInCompletedEvent(savedReg));
        }

        CheckInResponse response = new CheckInResponse(
                true,
                "Attendee checked in successfully",
                registration.getUser().getUsername(),
                registration.getUser().getRollNumber(),
                registration.getTicketCode(),
                registration.getCheckInTime()
        );
        return ResponseEntity.ok(response);
    }

    private OrganizerEventItem toOrganizerEventItem(Event event) {
        long registeredCount = registrationRepository.countByEventId(event.getId());
        long checkedInCount = registrationRepository.countByEventIdAndCheckedInTrue(event.getId());

        OrganizerEventItem item = new OrganizerEventItem();
        item.setId(event.getId());
        item.setTitle(event.getTitle());
        item.setDescription(event.getDescription());
        item.setDateTime(event.getDateTime());
        item.setEndDateTime(event.getEndDateTime());
        item.setVenue(event.getVenue());
        item.setCategory(event.getCategory());
        item.setStatus(event.getStatus());
        item.setMaxCapacity(event.getMaxCapacity());
        item.setRegisteredCount(registeredCount);
        item.setCheckedInCount(checkedInCount);
        item.setClubId(event.getClubId());
        item.setClubName(event.getClubName());
        item.setRegistrationLink(event.getRegistrationLink());
        item.setImageUrl(event.getImageUrl());
        return item;
    }

    private CustomUserDetails getCurrentUserDetails() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        if (auth.getPrincipal() instanceof CustomUserDetails cud) {
            return cud;
        }
        if (auth.getName() != null) {
            User user = userRepository.findByUsername(auth.getName()).orElse(null);
            if (user != null) {
                return CustomUserDetails.fromUser(user);
            }
        }
        return null;
    }
}
