package com.tejaswin.campus.service;

import com.tejaswin.campus.model.Event;
import com.tejaswin.campus.repository.EventRepository;
import com.tejaswin.campus.repository.UserRepository;
import com.tejaswin.campus.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service("securityService")
public class SecurityService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public SecurityService(EventRepository eventRepository, UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    public boolean isClubLead(CustomUserDetails user, Long clubId) {
        if (user == null || clubId == null) return false;
        if (user.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) return true;
        return Objects.equals(user.getClubId(), clubId);
    }

    public boolean canManageEvent(CustomUserDetails user, Long eventId) {
        if (user == null || eventId == null) return false;
        if (user.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) return true;
        Event event = eventRepository.findById(eventId).orElse(null);
        return event != null && event.getClub() != null && Objects.equals(user.getClubId(), event.getClub().getId());
    }

    public boolean isClubLead(Object principal, Long clubId) {
        if (principal instanceof CustomUserDetails user) {
            return isClubLead(user, clubId);
        }
        CustomUserDetails resolved = resolveUser(principal);
        return isClubLead(resolved, clubId);
    }

    public boolean canManageEvent(Object principal, Long eventId) {
        if (principal instanceof CustomUserDetails user) {
            return canManageEvent(user, eventId);
        }
        CustomUserDetails resolved = resolveUser(principal);
        return canManageEvent(resolved, eventId);
    }

    private CustomUserDetails resolveUser(Object principal) {
        if (principal == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                principal = auth.getPrincipal();
            }
        }
        if (principal instanceof CustomUserDetails cud) {
            return cud;
        }
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails ud) {
            return userRepository.findByUsername(ud.getUsername()).map(CustomUserDetails::fromUser).orElse(null);
        }
        if (principal instanceof String username) {
            return userRepository.findByUsername(username).map(CustomUserDetails::fromUser).orElse(null);
        }
        return null;
    }
}
