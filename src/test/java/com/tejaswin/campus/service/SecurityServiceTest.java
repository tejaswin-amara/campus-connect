package com.tejaswin.campus.service;

import com.tejaswin.campus.model.Club;
import com.tejaswin.campus.model.Event;
import com.tejaswin.campus.model.User;
import com.tejaswin.campus.repository.EventRepository;
import com.tejaswin.campus.repository.UserRepository;
import com.tejaswin.campus.security.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SecurityServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SecurityService securityService;

    private Club club1;
    private Club club2;
    private Event event1;
    private Event event2;
    private CustomUserDetails organizerClub1;
    private CustomUserDetails organizerClub2;
    private CustomUserDetails adminUser;

    @BeforeEach
    void setUp() {
        club1 = new Club(1L, "ACM", "acm", "Technical", "Desc", "logo.png");
        club2 = new Club(2L, "GDSC", "gdsc", "Technical", "Desc", "logo.png");

        event1 = new Event();
        event1.setId(10L);
        event1.setTitle("ACM Hackathon");
        event1.setClub(club1);

        event2 = new Event();
        event2.setId(20L);
        event2.setTitle("GDSC Workshop");
        event2.setClub(club2);

        organizerClub1 = new CustomUserDetails(1L, "lead1", "lead1@campus.edu", "pass", "ROLE_ORGANIZER",
                1L, "ACM", "KLH01", "CSE", List.of(new SimpleGrantedAuthority("ROLE_ORGANIZER")));

        organizerClub2 = new CustomUserDetails(2L, "lead2", "lead2@campus.edu", "pass", "ROLE_ORGANIZER",
                2L, "GDSC", "KLH02", "CSE", List.of(new SimpleGrantedAuthority("ROLE_ORGANIZER")));

        adminUser = new CustomUserDetails(3L, "admin", "admin@campus.edu", "pass", "ROLE_ADMIN",
                null, null, "ADM01", "Admin", List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
    }

    @Test
    void isClubLead_WhenOrganizerMatchesClub_ShouldReturnTrue() {
        assertTrue(securityService.isClubLead(organizerClub1, 1L));
        assertFalse(securityService.isClubLead(organizerClub1, 2L));
    }

    @Test
    void isClubLead_WhenAdmin_ShouldAlwaysReturnTrue() {
        assertTrue(securityService.isClubLead(adminUser, 1L));
        assertTrue(securityService.isClubLead(adminUser, 2L));
    }

    @Test
    void isClubLead_WhenNullUserOrClub_ShouldReturnFalse() {
        assertFalse(securityService.isClubLead((CustomUserDetails) null, 1L));
        assertFalse(securityService.isClubLead(organizerClub1, null));
    }

    @Test
    void canManageEvent_WhenOrganizerOwnsEventClub_ShouldReturnTrue() {
        when(eventRepository.findById(10L)).thenReturn(Optional.of(event1));
        assertTrue(securityService.canManageEvent(organizerClub1, 10L));
    }

    @Test
    void canManageEvent_WhenOrganizerFromOtherClub_ShouldReturnFalse() {
        when(eventRepository.findById(20L)).thenReturn(Optional.of(event2));
        assertFalse(securityService.canManageEvent(organizerClub1, 20L));
    }

    @Test
    void canManageEvent_WhenAdmin_ShouldAlwaysReturnTrue() {
        assertTrue(securityService.canManageEvent(adminUser, 10L));
        assertTrue(securityService.canManageEvent(adminUser, 20L));
    }

    @Test
    void canManageEvent_WhenEventNotFoundOrNoClub_ShouldReturnFalse() {
        when(eventRepository.findById(999L)).thenReturn(Optional.empty());
        assertFalse(securityService.canManageEvent(organizerClub1, 999L));

        Event unassigned = new Event();
        unassigned.setId(30L);
        when(eventRepository.findById(30L)).thenReturn(Optional.of(unassigned));
        assertFalse(securityService.canManageEvent(organizerClub1, 30L));
    }
}
