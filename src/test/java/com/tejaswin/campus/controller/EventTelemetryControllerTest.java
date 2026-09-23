package com.tejaswin.campus.controller;

import com.tejaswin.campus.config.AppConfig;
import com.tejaswin.campus.config.SecurityConfig;
import com.tejaswin.campus.event.CheckInCompletedEvent;
import com.tejaswin.campus.event.RegistrationCompletedEvent;
import com.tejaswin.campus.model.Event;
import com.tejaswin.campus.model.Registration;
import com.tejaswin.campus.model.User;
import com.tejaswin.campus.repository.EventRepository;
import com.tejaswin.campus.repository.RegistrationRepository;
import com.tejaswin.campus.repository.UserRepository;
import com.tejaswin.campus.security.CustomUserDetails;
import com.tejaswin.campus.security.RateLimitingFilter;
import com.tejaswin.campus.service.EventTelemetryService;
import com.tejaswin.campus.service.SecurityService;
import com.tejaswin.campus.service.SessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EventTelemetryController.class)
@Import({SecurityConfig.class, SecurityService.class, AppConfig.class})
public class EventTelemetryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventTelemetryService telemetryService;

    @MockitoBean
    private EventRepository eventRepository;

    @MockitoBean
    private RegistrationRepository registrationRepository;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private SessionService sessionService;

    @MockitoBean
    private RateLimitingFilter rateLimitingFilter;

    private CustomUserDetails organizerDetails;

    @BeforeEach
    void setUp() throws Exception {
        doAnswer(invocation -> {
            ServletRequest req = invocation.getArgument(0);
            ServletResponse res = invocation.getArgument(1);
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(req, res);
            return null;
        }).when(rateLimitingFilter).doFilter(any(), any(), any());

        organizerDetails = new CustomUserDetails(
                10L, "acm_lead", "lead@acm.edu", "pass", "ROLE_ORGANIZER",
                1L, "ACM Student Chapter", "KLH001", "CSE",
                List.of(new SimpleGrantedAuthority("ROLE_ORGANIZER"))
        );
    }

    @Test
    void streamEventTelemetry_ShouldReturn200AndTextEventStream() throws Exception {
        SseEmitter mockEmitter = new SseEmitter();
        when(telemetryService.subscribeCapacity(10L)).thenReturn(mockEmitter);

        MvcResult result = mockMvc.perform(get("/api/events/10/telemetry-stream"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM))
                .andReturn();

        assertNotNull(result.getResponse());
    }

    @Test
    void streamLiveCheckIns_Unauthenticated_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/organizer/events/10/live-checkin-stream"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void streamLiveCheckIns_WithOrganizerRole_ShouldReturn200AndTextEventStream() throws Exception {
        SseEmitter mockEmitter = new SseEmitter();
        when(telemetryService.subscribeCheckIn(10L)).thenReturn(mockEmitter);

        MvcResult result = mockMvc.perform(get("/api/organizer/events/10/live-checkin-stream")
                        .with(user(organizerDetails)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM))
                .andReturn();

        assertNotNull(result.getResponse());
    }

    @Test
    void eventTelemetryService_UnitLogic_ComputeCapacityAndSubscriptions() {
        Event event = new Event();
        event.setId(10L);
        event.setMaxCapacity(100);

        when(eventRepository.findById(10L)).thenReturn(Optional.of(event));
        when(registrationRepository.countByEventId(10L)).thenReturn(85L);

        EventTelemetryService service = new EventTelemetryService(eventRepository, registrationRepository);
        Map<String, Object> payload = service.computeCapacityPayload(10L);

        assertEquals(10L, payload.get("eventId"));
        assertEquals(85L, payload.get("registeredCount"));
        assertEquals(100, payload.get("maxCapacity"));
        assertEquals(15L, payload.get("remainingSeats"));
        assertEquals(85.0, payload.get("saturationPercentage"));

        SseEmitter emitter = service.subscribeCapacity(10L);
        assertNotNull(emitter);
        assertEquals(1, service.getActiveCapacitySubscribersCount(10L));

        SseEmitter checkInEmitter = service.subscribeCheckIn(10L);
        assertNotNull(checkInEmitter);
        assertEquals(1, service.getActiveCheckInSubscribersCount(10L));

        // Test registration domain event handling
        Registration reg = new Registration();
        reg.setEvent(event);
        service.onRegistrationCompleted(new RegistrationCompletedEvent(reg));

        // Test check-in domain event handling
        User student = new User();
        student.setUsername("alex_chen");
        student.setRollNumber("2520090104");
        reg.setUser(student);
        reg.setTicketCode("TKT-10-8F9B2C");
        reg.setCheckInTime(LocalDateTime.now());
        when(registrationRepository.countByEventIdAndCheckedInTrue(10L)).thenReturn(42L);

        service.onCheckInCompleted(new CheckInCompletedEvent(reg));
    }
}
