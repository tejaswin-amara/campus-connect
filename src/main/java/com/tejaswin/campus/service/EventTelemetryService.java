package com.tejaswin.campus.service;

import com.tejaswin.campus.event.CheckInCompletedEvent;
import com.tejaswin.campus.event.RegistrationCompletedEvent;
import com.tejaswin.campus.model.Event;
import com.tejaswin.campus.model.Registration;
import com.tejaswin.campus.repository.EventRepository;
import com.tejaswin.campus.repository.RegistrationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class EventTelemetryService {

    private static final Logger logger = LoggerFactory.getLogger(EventTelemetryService.class);
    private static final Long DEFAULT_TIMEOUT = 30 * 60 * 1000L; // 30 minutes

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;

    private final Map<Long, List<SseEmitter>> capacityEmitters = new ConcurrentHashMap<>();
    private final Map<Long, List<SseEmitter>> checkInEmitters = new ConcurrentHashMap<>();

    public EventTelemetryService(EventRepository eventRepository, RegistrationRepository registrationRepository) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
    }

    /**
     * Subscribes a client to the real-time capacity telemetry stream for an event.
     * Emits the current capacity snapshot immediately upon connection.
     */
    public SseEmitter subscribeCapacity(Long eventId) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);
        capacityEmitters.computeIfAbsent(eventId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeCapacityEmitter(eventId, emitter));
        emitter.onTimeout(() -> removeCapacityEmitter(eventId, emitter));
        emitter.onError(e -> removeCapacityEmitter(eventId, emitter));

        // Immediately send initial capacity snapshot
        try {
            Map<String, Object> snapshot = computeCapacityPayload(eventId);
            emitter.send(SseEmitter.event()
                    .name("capacity_update")
                    .data(snapshot, MediaType.APPLICATION_JSON));
        } catch (Exception e) {
            logger.debug("Client disconnected immediately on initial capacity stream: {}", e.getMessage());
            removeCapacityEmitter(eventId, emitter);
        }

        return emitter;
    }

    /**
     * Subscribes an organizer client to the live check-in scanner stream for an event.
     */
    public SseEmitter subscribeCheckIn(Long eventId) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);
        checkInEmitters.computeIfAbsent(eventId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeCheckInEmitter(eventId, emitter));
        emitter.onTimeout(() -> removeCheckInEmitter(eventId, emitter));
        emitter.onError(e -> removeCheckInEmitter(eventId, emitter));

        return emitter;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onRegistrationCompleted(RegistrationCompletedEvent domainEvent) {
        if (domainEvent == null || domainEvent.registration() == null || domainEvent.registration().getEvent() == null) {
            return;
        }
        Long eventId = domainEvent.registration().getEvent().getId();
        broadcastCapacityUpdate(eventId);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onCheckInCompleted(CheckInCompletedEvent domainEvent) {
        if (domainEvent == null || domainEvent.registration() == null || domainEvent.registration().getEvent() == null) {
            return;
        }
        Registration reg = domainEvent.registration();
        Long eventId = reg.getEvent().getId();
        long totalCheckedIn = registrationRepository.countByEventIdAndCheckedInTrue(eventId);

        Map<String, Object> ping = new LinkedHashMap<>();
        ping.put("ticketCode", reg.getTicketCode());
        ping.put("studentName", reg.getUser() != null ? reg.getUser().getUsername() : "Student");
        ping.put("rollNumber", reg.getUser() != null ? reg.getUser().getRollNumber() : "N/A");
        ping.put("checkInTime", reg.getCheckInTime() != null ? reg.getCheckInTime().toString() : LocalDateTime.now().toString());
        ping.put("totalCheckedIn", totalCheckedIn);

        broadcastCheckInPing(eventId, ping);
    }

    public void broadcastCapacityUpdate(Long eventId) {
        List<SseEmitter> emitters = capacityEmitters.get(eventId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        Map<String, Object> payload = computeCapacityPayload(eventId);
        List<SseEmitter> deadEmitters = new ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("capacity_update")
                        .data(payload, MediaType.APPLICATION_JSON));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }

        for (SseEmitter dead : deadEmitters) {
            removeCapacityEmitter(eventId, dead);
        }
    }

    public void broadcastCheckInPing(Long eventId, Map<String, Object> ping) {
        List<SseEmitter> emitters = checkInEmitters.get(eventId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("checkin_ping")
                        .data(ping, MediaType.APPLICATION_JSON));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }

        for (SseEmitter dead : deadEmitters) {
            removeCheckInEmitter(eventId, dead);
        }
    }

    public Map<String, Object> computeCapacityPayload(Long eventId) {
        long registeredCount = registrationRepository.countByEventId(eventId);
        Event event = eventRepository.findById(eventId).orElse(null);
        int maxCapacity = (event != null && event.getMaxCapacity() != null) ? event.getMaxCapacity() : 100;
        long remainingSeats = Math.max(0, maxCapacity - registeredCount);
        double saturationPercentage = maxCapacity > 0 ? ((double) registeredCount / maxCapacity) * 100.0 : 0.0;
        double roundedSaturation = Math.round(saturationPercentage * 10.0) / 10.0;

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("eventId", eventId);
        payload.put("registeredCount", registeredCount);
        payload.put("maxCapacity", maxCapacity);
        payload.put("remainingSeats", remainingSeats);
        payload.put("saturationPercentage", roundedSaturation);
        return payload;
    }

    private void removeCapacityEmitter(Long eventId, SseEmitter emitter) {
        List<SseEmitter> emitters = capacityEmitters.get(eventId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                capacityEmitters.remove(eventId);
            }
        }
    }

    private void removeCheckInEmitter(Long eventId, SseEmitter emitter) {
        List<SseEmitter> emitters = checkInEmitters.get(eventId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                checkInEmitters.remove(eventId);
            }
        }
    }

    public int getActiveCapacitySubscribersCount(Long eventId) {
        List<SseEmitter> list = capacityEmitters.get(eventId);
        return list != null ? list.size() : 0;
    }

    public int getActiveCheckInSubscribersCount(Long eventId) {
        List<SseEmitter> list = checkInEmitters.get(eventId);
        return list != null ? list.size() : 0;
    }
}
