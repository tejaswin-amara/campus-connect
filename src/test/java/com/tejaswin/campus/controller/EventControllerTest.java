package com.tejaswin.campus.controller;

import com.tejaswin.campus.model.Event;
import com.tejaswin.campus.model.User;
import com.tejaswin.campus.service.EventService;
import com.tejaswin.campus.service.SessionService;
import com.tejaswin.campus.security.SecurityAuditLogger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EventService eventService;

    @MockBean
    private SessionService sessionService;

    @MockBean
    private SecurityAuditLogger auditLogger;

    private User studentUser;

    @BeforeEach
    void setUp() {
        studentUser = new User();
        studentUser.setId(10L);
        studentUser.setUsername("student");
        studentUser.setRole("STUDENT");

        when(sessionService.getLoggedInUser()).thenReturn(studentUser);
    }

    @Test
    void showStudentDashboard_ShouldReturnDashboardWithEvents() throws Exception {
        Event event = new Event();
        event.setDateTime(java.time.LocalDateTime.now().plusDays(1));
        org.springframework.data.domain.Page<Event> page = new org.springframework.data.domain.PageImpl<>(
                List.of(event));
        when(eventService.findAllEventsPage(org.mockito.ArgumentMatchers.any())).thenReturn(page);

        mockMvc.perform(get("/student/dashboard"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard"))
                .andExpect(model().attributeExists("events"));
    }

    @Test
    void searchEvents_ShouldReturnFilteredEvents() throws Exception {
        Event event = new Event();
        event.setDateTime(java.time.LocalDateTime.now().plusDays(1));
        org.springframework.data.domain.Page<Event> page = new org.springframework.data.domain.PageImpl<>(
                List.of(event));
        when(eventService.searchEventsPage(org.mockito.ArgumentMatchers.eq("spring"),
                org.mockito.ArgumentMatchers.any())).thenReturn(page);

        mockMvc.perform(get("/student/dashboard").param("search", "spring"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard"))
                .andExpect(model().attributeExists("searchQuery"));
    }

    @Test
    void filterEvents_ShouldReturnCategorizedEvents() throws Exception {
        Event event = new Event();
        event.setDateTime(java.time.LocalDateTime.now().plusDays(1));
        org.springframework.data.domain.Page<Event> page = new org.springframework.data.domain.PageImpl<>(
                List.of(event));
        when(eventService.findEventsByCategoryPage(org.mockito.ArgumentMatchers.eq("tech"),
                org.mockito.ArgumentMatchers.any())).thenReturn(page);

        mockMvc.perform(get("/student/dashboard").param("category", "tech"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard"))
                .andExpect(model().attributeExists("activeCategory"));
    }

    @Test
    void showEventDetails_WithValidId_ShouldReturnEventDetailTemplate() throws Exception {
        Event event = new Event();
        event.setId(1L);
        when(eventService.findEventById(1L)).thenReturn(event);

        mockMvc.perform(get("/student/event/1"))
                .andExpect(status().isOk())
                .andExpect(view().name("event_detail"))
                .andExpect(model().attributeExists("event"));
    }

    @Test
    void registerExternal_ShouldRedirectToExternalLink() throws Exception {
        Event event = new Event();
        event.setId(1L);
        event.setRegistrationLink("https://external.com");
        when(eventService.findEventById(1L)).thenReturn(event);

        mockMvc.perform(get("/student/register-external/1"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("https://external.com"));
    }
}
