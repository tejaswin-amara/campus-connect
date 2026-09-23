package com.tejaswin.campus.controller;

import com.tejaswin.campus.model.Event;
import com.tejaswin.campus.model.User;
import com.tejaswin.campus.service.EventService;
import com.tejaswin.campus.service.SessionService;
import com.tejaswin.campus.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class EventApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventService eventService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private SessionService sessionService;

    private Event testEvent;
    private User adminUser;
    private User guestUser;

    @BeforeEach
    void setUp() {
        testEvent = new Event();
        testEvent.setId(1L);
        testEvent.setTitle("Hackathon 2026");
        testEvent.setDescription("Annual Campus Hackathon");
        testEvent.setCategory("Technology");
        testEvent.setVenue("Auditorium A");
        testEvent.setDateTime(LocalDateTime.now().plusDays(2));
        testEvent.setMaxCapacity(100);

        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin");
        adminUser.setRole("ADMIN");

        guestUser = new User();
        guestUser.setId(2L);
        guestUser.setUsername("guest");
        guestUser.setRole("STUDENT");
    }

    @Test
    void getEvents_ShouldReturnEventsList() throws Exception {
        when(eventService.findAllEvents()).thenReturn(List.of(testEvent));
        when(eventService.getRegistrationCountsMap(any())).thenReturn(Map.of(1L, 15L));

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Hackathon 2026"))
                .andExpect(jsonPath("$[0].registeredCount").value(15));
    }

    @Test
    void getEvent_WithValidId_ShouldReturnEvent() throws Exception {
        when(eventService.findEventById(1L)).thenReturn(testEvent);
        when(eventService.getRegistrationCountsMap(any())).thenReturn(Map.of(1L, 15L));

        mockMvc.perform(get("/api/events/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Hackathon 2026"));
    }

    @Test
    void getEvent_WithInvalidId_ShouldReturnNotFound() throws Exception {
        when(eventService.findEventById(999L)).thenReturn(null);

        mockMvc.perform(get("/api/events/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void registerStudent_WithValidId_ShouldRegisterAndReturnEvent() throws Exception {
        when(eventService.findEventById(1L)).thenReturn(testEvent);
        when(sessionService.getLoggedInUser()).thenReturn(guestUser);
        when(eventService.registerStudent(eq(1L), eq(2L))).thenReturn(true);
        when(eventService.getRegistrationCountsMap(any())).thenReturn(Map.of(1L, 16L));

        mockMvc.perform(post("/api/events/1/register"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.registeredCount").value(16));
    }

    @Test
    void jsonLogin_WithValidCredentials_ShouldSucceed() throws Exception {
        when(userService.authenticate("admin", "password123")).thenReturn(adminUser);

        mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"admin\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void jsonLogin_WithInvalidCredentials_ShouldFail() throws Exception {
        when(userService.authenticate("admin", "wrong")).thenReturn(null);

        mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"admin\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void createEvent_WithoutAdminAuth_ShouldBeUnauthorized() throws Exception {
        when(sessionService.getLoggedInUser()).thenReturn(null);

        mockMvc.perform(post("/api/admin/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Unauthorized Event\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createEvent_WithAdminAuth_ShouldCreateEvent() throws Exception {
        when(sessionService.getLoggedInUser()).thenReturn(adminUser);
        doNothing().when(eventService).saveEvent(any());

        mockMvc.perform(post("/api/admin/events")
                .with(user("admin").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .sessionAttr("loggedInUser", adminUser)
                .content("{\"title\":\"New Robotics Meet\",\"category\":\"Technology\",\"venue\":\"Lab 2\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("New Robotics Meet"));
    }

    @Test
    void deleteEvent_WithoutAdminAuth_ShouldBeUnauthorized() throws Exception {
        when(sessionService.getLoggedInUser()).thenReturn(null);

        mockMvc.perform(delete("/api/admin/events/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteEvent_WithAdminAuth_ShouldDeleteEvent() throws Exception {
        when(sessionService.getLoggedInUser()).thenReturn(adminUser);
        doNothing().when(eventService).deleteEvent(1L);

        mockMvc.perform(delete("/api/admin/events/1")
                .with(user("admin").roles("ADMIN"))
                .sessionAttr("loggedInUser", adminUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void getAdminStats_WithoutAdminAuth_ShouldBeUnauthorized() throws Exception {
        when(sessionService.getLoggedInUser()).thenReturn(null);

        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAdminStats_WithAdminAuth_ShouldReturnStats() throws Exception {
        when(sessionService.getLoggedInUser()).thenReturn(adminUser);
        when(eventService.getTotalEventsCount()).thenReturn(10L);
        when(eventService.getTotalRegistrationsCount()).thenReturn(85L);
        when(eventService.findAllEvents()).thenReturn(List.of(testEvent));

        mockMvc.perform(get("/api/admin/stats")
                .with(user("admin").roles("ADMIN"))
                .sessionAttr("loggedInUser", adminUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("total-events"))
                .andExpect(jsonPath("$[0].value").value(10))
                .andExpect(jsonPath("$[1].id").value("total-registered"))
                .andExpect(jsonPath("$[1].value").value(85));
    }
}
