package com.tejaswin.campus.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tejaswin.campus.dto.CheckInRequest;
import com.tejaswin.campus.dto.CreateClubEventRequest;
import com.tejaswin.campus.model.Club;
import com.tejaswin.campus.model.Event;
import com.tejaswin.campus.model.Registration;
import com.tejaswin.campus.model.User;
import com.tejaswin.campus.repository.ClubRepository;
import com.tejaswin.campus.repository.EventRepository;
import com.tejaswin.campus.repository.RegistrationRepository;
import com.tejaswin.campus.security.CustomUserDetails;
import com.tejaswin.campus.config.AppConfig;
import com.tejaswin.campus.config.SecurityConfig;
import com.tejaswin.campus.repository.UserRepository;
import com.tejaswin.campus.security.RateLimitingFilter;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrganizerController.class)
@Import({SecurityConfig.class, SecurityService.class, AppConfig.class})
class OrganizerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private EventRepository eventRepository;

    @MockitoBean
    private RegistrationRepository registrationRepository;

    @MockitoBean
    private ClubRepository clubRepository;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private SessionService sessionService;

    @MockitoBean
    private RateLimitingFilter rateLimitingFilter;

    private Club club1;
    private Club club2;
    private Event club1Event;
    private Event club2Event;
    private CustomUserDetails organizerClub1Details;
    private CustomUserDetails organizerClub2Details;
    private Registration registration;
    private User student;

    @BeforeEach
    void setUp() throws Exception {
        doAnswer(invocation -> {
            ServletRequest req = invocation.getArgument(0);
            ServletResponse res = invocation.getArgument(1);
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(req, res);
            return null;
        }).when(rateLimitingFilter).doFilter(any(), any(), any());

        club1 = new Club(1L, "ACM Student Chapter", "acm-klh", "Technical", "ACM Desc", "/images/acm.png");
        club2 = new Club(2L, "GDSC Campus Community", "gdsc-klh", "Technical", "GDSC Desc", "/images/gdsc.png");

        club1Event = new Event();
        club1Event.setId(101L);
        club1Event.setTitle("ACM Coding Contest");
        club1Event.setDescription("Annual algorithmic contest");
        club1Event.setDateTime(LocalDateTime.now().plusDays(5));
        club1Event.setVenue("Lab 1");
        club1Event.setCategory("Technical");
        club1Event.setStatus("PUBLISHED");
        club1Event.setMaxCapacity(50);
        club1Event.setClub(club1);

        club2Event = new Event();
        club2Event.setId(102L);
        club2Event.setTitle("GDSC Cloud Workshop");
        club2Event.setDescription("Hands-on cloud architecture workshop");
        club2Event.setDateTime(LocalDateTime.now().plusDays(6));
        club2Event.setVenue("Seminar Hall");
        club2Event.setCategory("Technical");
        club2Event.setStatus("PUBLISHED");
        club2Event.setMaxCapacity(60);
        club2Event.setClub(club2);

        organizerClub1Details = new CustomUserDetails(
                10L, "acm_lead", "lead@acm.edu", "pass", "ROLE_ORGANIZER",
                1L, "ACM Student Chapter", "KLH001", "CSE",
                List.of(new SimpleGrantedAuthority("ROLE_ORGANIZER"))
        );

        organizerClub2Details = new CustomUserDetails(
                20L, "gdsc_lead", "lead@gdsc.edu", "pass", "ROLE_ORGANIZER",
                2L, "GDSC Campus Community", "KLH002", "CSE",
                List.of(new SimpleGrantedAuthority("ROLE_ORGANIZER"))
        );

        student = new User();
        student.setId(50L);
        student.setUsername("student_one");
        student.setEmail("student_one@klh.edu.in");
        student.setRollNumber("2100030101");
        student.setDepartment("CSE");

        registration = new Registration();
        registration.setId(1001L);
        registration.setEvent(club1Event);
        registration.setUser(student);
        registration.setCheckedIn(false);
        registration.setTicketCode("TKT-101-ABCD1234");
        registration.setRegistrationDate(LocalDateTime.now().minusDays(1));
        registration.setStatus("CONFIRMED");
    }

    @Test
    void unauthenticatedCall_ToOrganizerEndpoints_ShouldReturn401Json() throws Exception {
        mockMvc.perform(get("/api/organizer/events"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void getMyClub_WithOrganizerAuth_ShouldReturnClubDetails() throws Exception {
        when(clubRepository.findById(1L)).thenReturn(Optional.of(club1));
        when(eventRepository.countByClubId(1L)).thenReturn(5L);
        when(registrationRepository.countByEvent_Club_Id(1L)).thenReturn(120L);
        when(registrationRepository.countByEvent_Club_IdAndCheckedInTrue(1L)).thenReturn(45L);

        mockMvc.perform(get("/api/organizer/clubs/my-club")
                        .with(user(organizerClub1Details)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("ACM Student Chapter"))
                .andExpect(jsonPath("$.totalEvents").value(5))
                .andExpect(jsonPath("$.totalRsvps").value(120))
                .andExpect(jsonPath("$.totalCheckedIn").value(45));
    }

    @Test
    void getClubEvents_ShouldReturnEventsScopedToClub() throws Exception {
        when(eventRepository.findByClubIdOrderByDateTimeDesc(1L)).thenReturn(List.of(club1Event));
        when(registrationRepository.countByEventId(101L)).thenReturn(12L);
        when(registrationRepository.countByEventIdAndCheckedInTrue(101L)).thenReturn(4L);

        mockMvc.perform(get("/api/organizer/events")
                        .with(user(organizerClub1Details)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(101))
                .andExpect(jsonPath("$[0].title").value("ACM Coding Contest"))
                .andExpect(jsonPath("$[0].clubId").value(1))
                .andExpect(jsonPath("$[0].registeredCount").value(12))
                .andExpect(jsonPath("$[0].checkedInCount").value(4));
    }

    @Test
    void createClubEvent_WithOrganizerAuth_ShouldPersistScopedEvent() throws Exception {
        when(clubRepository.findById(1L)).thenReturn(Optional.of(club1));
        when(eventRepository.save(any(Event.class))).thenAnswer(i -> {
            Event e = i.getArgument(0);
            e.setId(103L);
            return e;
        });

        CreateClubEventRequest req = new CreateClubEventRequest();
        req.setTitle("New Web3 Workshop");
        req.setDescription("Solidity & Smart contract deep dive");
        req.setDateTime(LocalDateTime.now().plusDays(10));
        req.setVenue("Auditorium B");
        req.setCategory("Technical");
        req.setMaxCapacity(80);

        mockMvc.perform(post("/api/organizer/events")
                        .with(user(organizerClub1Details))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(103))
                .andExpect(jsonPath("$.title").value("New Web3 Workshop"))
                .andExpect(jsonPath("$.clubId").value(1));
    }

    @Test
    void getAttendees_WhenOrganizerFromSameClub_ShouldReturnRoster() throws Exception {
        when(eventRepository.findById(101L)).thenReturn(Optional.of(club1Event));
        when(registrationRepository.findByEventIdWithUser(101L)).thenReturn(List.of(registration));

        mockMvc.perform(get("/api/organizer/events/101/attendees")
                        .with(user(organizerClub1Details)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].registrationId").value(1001))
                .andExpect(jsonPath("$[0].username").value("student_one"))
                .andExpect(jsonPath("$[0].ticketCode").value("TKT-101-ABCD1234"))
                .andExpect(jsonPath("$[0].checkedIn").value(false));
    }

    @Test
    void getAttendees_WhenOrganizerFromOtherClub_ShouldReturn403Forbidden() throws Exception {
        when(eventRepository.findById(102L)).thenReturn(Optional.of(club2Event));

        mockMvc.perform(get("/api/organizer/events/102/attendees")
                        .with(user(organizerClub1Details)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    void checkInAttendee_WhenValidTicketCode_ShouldSucceed() throws Exception {
        when(eventRepository.findById(101L)).thenReturn(Optional.of(club1Event));
        when(registrationRepository.findByEventIdAndTicketCode(101L, "TKT-101-ABCD1234")).thenReturn(Optional.of(registration));
        when(registrationRepository.save(any(Registration.class))).thenReturn(registration);

        CheckInRequest req = new CheckInRequest("TKT-101-ABCD1234", null);

        mockMvc.perform(post("/api/organizer/events/101/check-in")
                        .with(user(organizerClub1Details))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.attendeeName").value("student_one"))
                .andExpect(jsonPath("$.ticketCode").value("TKT-101-ABCD1234"));
    }

    @Test
    void checkInAttendee_WhenOrganizerFromDifferentClub_ShouldReturn403Forbidden() throws Exception {
        when(eventRepository.findById(102L)).thenReturn(Optional.of(club2Event));

        CheckInRequest req = new CheckInRequest("TKT-102-XYZ", null);

        mockMvc.perform(post("/api/organizer/events/102/check-in")
                        .with(user(organizerClub1Details))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }
}
