import { useCallback, useRef } from 'react';
import type { SimCollegeTelemetryPayload, ViewModality } from '../types/simcollege';

function generateClientUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `uuid-${Math.random().toString(36).substring(2, 15)}-${Date.now().toString(36)}`;
}

export function useSimCollegeTelemetry() {
  const queuedEvents = useRef<SimCollegeTelemetryPayload[]>([]);

  const trackEvent = useCallback(
    (
      eventType: SimCollegeTelemetryPayload['eventType'],
      details: {
        pinId?: number;
        venue?: string;
        modality?: ViewModality;
        zoomLevel?: number;
      } = {},
    ) => {
      const payload: SimCollegeTelemetryPayload = {
        eventId: generateClientUuid(),
        eventType,
        ...details,
        timestamp: new Date().toISOString(),
      };

      queuedEvents.current.push(payload);

      // Non-blocking telemetry dispatch
      if (typeof window !== 'undefined') {
        const payloadStr = JSON.stringify(payload);

        // Try navigator.sendBeacon if available for non-blocking transit
        if (navigator.sendBeacon) {
          try {
            const blob = new Blob([payloadStr], { type: 'application/json' });
            const success = navigator.sendBeacon('/api/telemetry/event', blob);
            if (success) return;
          } catch {
            // Fallback to fetch
          }
        }

        // Resilient fetch with silent failure handling
        fetch('/api/telemetry/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payloadStr,
          keepalive: true,
        }).catch(() => {
          // Gracefully handled without UI disruption in dev or standalone mode
        });
      }
    },
    [],
  );

  return { trackEvent, getQueuedEvents: () => queuedEvents.current };
}
