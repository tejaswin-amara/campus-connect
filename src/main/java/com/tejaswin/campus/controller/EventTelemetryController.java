package com.tejaswin.campus.controller;

import com.tejaswin.campus.service.EventTelemetryService;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
public class EventTelemetryController {

    private final EventTelemetryService telemetryService;

    public EventTelemetryController(EventTelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    /**
     * Real-time Server-Sent Events (SSE) telemetry broadcast for event capacity updates.
     * Publicly accessible by student clients and dashboard visitors.
     */
    @GetMapping(value = "/api/events/{id}/telemetry-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamEventTelemetry(@PathVariable Long id) {
        return telemetryService.subscribeCapacity(id);
    }

    /**
     * Real-time Server-Sent Events (SSE) live check-in scanner ping stream.
     * Guarded for verified club organizers and administrators.
     */
    @GetMapping(value = "/api/organizer/events/{id}/live-checkin-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public SseEmitter streamLiveCheckIns(@PathVariable Long id) {
        return telemetryService.subscribeCheckIn(id);
    }
}
