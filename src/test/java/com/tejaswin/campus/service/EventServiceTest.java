package com.tejaswin.campus.service;

import com.tejaswin.campus.model.Event;
import com.tejaswin.campus.model.User;
import com.tejaswin.campus.repository.EventRepository;
import com.tejaswin.campus.repository.RegistrationRepository;
import com.tejaswin.campus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.tejaswin.campus.security.SecurityAuditLogger;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private RegistrationRepository registrationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityAuditLogger auditLogger;

    private EventService eventService;

    @BeforeEach
    void setUp() {
        // Manual construction because EventService requires a @Value string parameter
        eventService = new EventService(eventRepository, registrationRepository, userRepository, auditLogger,
                "test-uploads");
    }

    // ── Existing Tests ──────────────────────────────────────────────────

    @Test
    public void testFindAllEvents() {
        Event event1 = new Event(1L, "Event 1", "Desc 1", LocalDateTime.now(), "Venue 1", "Technical");
        Event event2 = new Event(2L, "Event 2", "Desc 2", LocalDateTime.now(), "Venue 2", "Cultural");

        when(eventRepository.findAllByOrderByDateTimeDesc()).thenReturn(Arrays.asList(event1, event2));

        List<Event> events = eventService.findAllEvents();

        assertEquals(2, events.size());
        verify(eventRepository, times(1)).findAllByOrderByDateTimeDesc();
    }

    @Test
    public void testFindEventById() {
        Event event = new Event(1L, "Test Event", "Description", LocalDateTime.now(), "Venue", "Technical");
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));

        Event found = eventService.findEventById(1L);

        assertNotNull(found);
        assertEquals("Test Event", found.getTitle());
    }

    @Test
    public void testSaveEvent() {
        Event event = new Event();
        event.setTitle("New Event");

        eventService.saveEvent(event);

        verify(eventRepository, times(1)).save(event);
    }

    @Test
    public void testDeleteEvent() {
        Long eventId = 1L;
        when(eventRepository.findById(eventId)).thenReturn(Optional.empty());
        doNothing().when(registrationRepository).deleteByEventId(eventId);
        doNothing().when(eventRepository).deleteById(eventId);

        eventService.deleteEvent(eventId);

        verify(registrationRepository, times(1)).deleteByEventId(eventId);
        verify(eventRepository, times(1)).deleteById(eventId);
    }

    // ── New Edge-Case Tests ─────────────────────────────────────────────

    @Test
    void testFindEventByIdNotFound() {
        when(eventRepository.findById(999L)).thenReturn(Optional.empty());

        Event result = eventService.findEventById(999L);

        assertNull(result);
    }

    @Test
    void testSearchEventsBlankQuery() {
        Event event = new Event(1L, "Event", "Desc", LocalDateTime.now(), "Venue", "Technical");
        when(eventRepository.findAllByOrderByDateTimeDesc()).thenReturn(List.of(event));

        // Blank query should return all events
        List<Event> results = eventService.searchEvents("   ");

        assertEquals(1, results.size());
        verify(eventRepository, times(1)).findAllByOrderByDateTimeDesc();
    }

    @Test
    void testSearchEventsWithResults() {
        Event event = new Event(1L, "Hackathon", "Desc", LocalDateTime.now(), "Lab", "Technical");
        when(eventRepository.findByTitleContainingIgnoreCaseOrVenueContainingIgnoreCase("hack", "hack"))
                .thenReturn(List.of(event));

        List<Event> results = eventService.searchEvents("hack");

        assertEquals(1, results.size());
        assertEquals("Hackathon", results.get(0).getTitle());
    }

    @Test
    void testFindEventsByCategoryAll() {
        Event event = new Event(1L, "Event", "Desc", LocalDateTime.now(), "Venue", "Technical");
        when(eventRepository.findAllByOrderByDateTimeDesc()).thenReturn(List.of(event));

        // "all" filter should return all events
        List<Event> results = eventService.findEventsByCategory("all");

        assertEquals(1, results.size());
        verify(eventRepository, times(1)).findAllByOrderByDateTimeDesc();
    }

    @Test
    void testFindEventsByCategorySpecific() {
        Event event = new Event(1L, "Dance Night", "Desc", LocalDateTime.now(), "Auditorium", "Cultural");
        when(eventRepository.findByCategoryOrderByDateTimeDesc("Cultural")).thenReturn(List.of(event));

        List<Event> results = eventService.findEventsByCategory("Cultural");

        assertEquals(1, results.size());
        assertEquals("Cultural", results.get(0).getCategory());
    }

    @Test
    void testRegisterStudentSuccess() {
        Long eventId = 1L;
        Long userId = 10L;

        when(registrationRepository.existsByUserIdAndEventId(userId, eventId)).thenReturn(false);
        when(eventRepository.findById(eventId))
                .thenReturn(Optional.of(new Event(eventId, "E", "D", LocalDateTime.now(), "V", "T")));

        User user = new User();
        user.setId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        boolean result = eventService.registerStudent(eventId, userId);

        assertTrue(result);
        verify(registrationRepository, times(1)).save(any());
    }

    @Test
    void testRegisterStudentDuplicate() {
        when(registrationRepository.existsByUserIdAndEventId(10L, 1L)).thenReturn(true);

        boolean result = eventService.registerStudent(1L, 10L);

        assertFalse(result);
        verify(registrationRepository, never()).save(any());
    }

    @Test
    void testRegisterStudentInvalidEvent() {
        when(registrationRepository.existsByUserIdAndEventId(10L, 999L)).thenReturn(false);
        when(eventRepository.findById(999L)).thenReturn(Optional.empty());
        when(userRepository.findById(10L)).thenReturn(Optional.of(new User()));

        boolean result = eventService.registerStudent(999L, 10L);

        assertFalse(result);
        verify(registrationRepository, never()).save(any());
    }

    @Test
    void testGetCategoryCounts() {
        List<Object[]> mockResults = Arrays.asList(
                new Object[] { "Technical", 5L },
                new Object[] { "Cultural", 3L });
        when(eventRepository.countEventsByCategory()).thenReturn(mockResults);

        Map<String, Long> counts = eventService.getCategoryCounts();

        assertEquals(2, counts.size());
        assertEquals(5L, counts.get("Technical"));
        assertEquals(3L, counts.get("Cultural"));
    }

    @Test
    void testGetAllEventsAsCsvEmpty() {
        when(eventRepository.findAllByOrderByDateTimeDesc()).thenReturn(Collections.emptyList());

        byte[] csv = eventService.getAllEventsAsCsv();
        String csvContent = new String(csv);

        assertTrue(csvContent.startsWith("ID,Title,Category"));
        // Only header line, no data rows
        assertEquals(1, csvContent.trim().split("\n").length);
    }

    @Test
    void testGetAllEventsAsCsvWithSpecialChars() {
        Event event = new Event(1L, "Event \"quoted\"", "Desc", LocalDateTime.now(), "Venue, with comma", "Technical");
        when(eventRepository.findAllByOrderByDateTimeDesc()).thenReturn(List.of(event));

        byte[] csv = eventService.getAllEventsAsCsv();
        String csvContent = new String(csv);

        // Should contain escaped quotes and the event data
        assertTrue(csvContent.contains("\"Event \"\"quoted\"\"\""));
        assertTrue(csvContent.contains("\"Venue, with comma\""));
    }
}
