import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import type { CampusEvent } from '../../../types';

export type TelemetryConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting';

export interface TelemetryCapacityPayload {
  eventId: number;
  registeredCount: number;
  availableSeats: number;
  maxCapacity: number;
  status?: string;
}

export interface UseEventTelemetryOptions {
  enabled?: boolean;
}

export interface UseEventTelemetryReturn {
  connectionStatus: TelemetryConnectionStatus;
  isLive: boolean;
  registeredCount?: number;
  availableSeats?: number;
  maxCapacity?: number;
  retryCount: number;
}

/**
 * Resilient SSE hook for real-time seat availability & event capacity telemetry.
 * Automatically reconnects with exponential backoff and optimistically mutates TanStack Query cache.
 */
export function useEventTelemetry(
  eventId: number | null | undefined,
  options: UseEventTelemetryOptions = {},
): UseEventTelemetryReturn {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  const [connectionStatus, setConnectionStatus] =
    useState<TelemetryConnectionStatus>('disconnected');
  const [retryCount, setRetryCount] = useState<number>(0);
  const [latestCapacity, setLatestCapacity] = useState<TelemetryCapacityPayload | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  // Sync ref with state
  retryCountRef.current = retryCount;

  useEffect(() => {
    isMountedRef.current = true;

    if (
      !enabled ||
      !eventId ||
      typeof window === 'undefined' ||
      typeof EventSource === 'undefined'
    ) {
      setConnectionStatus('disconnected');
      return;
    }

    let isDisposed = false;

    const connect = () => {
      if (isDisposed) return;

      // Close any active connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      setConnectionStatus(retryCountRef.current > 0 ? 'reconnecting' : 'connecting');

      const sseUrl = API_BASE_URL
        ? `${API_BASE_URL}/api/events/${eventId}/telemetry-stream`
        : `/api/events/${eventId}/telemetry-stream`;

      try {
        const es = new EventSource(sseUrl, { withCredentials: true });
        eventSourceRef.current = es;

        es.onopen = () => {
          if (isDisposed) {
            es.close();
            return;
          }
          setConnectionStatus('connected');
          setRetryCount(0);
          retryCountRef.current = 0;
        };

        es.addEventListener('capacity_update', (event: MessageEvent) => {
          if (isDisposed) return;
          try {
            const data: TelemetryCapacityPayload = JSON.parse(event.data);
            setLatestCapacity(data);

            // Optimistically update event detail cache
            queryClient.setQueryData<CampusEvent>(queryKeys.events.detail(eventId), (old) => {
              if (!old) return old;
              return {
                ...old,
                registeredCount: data.registeredCount,
                maxCapacity: data.maxCapacity ?? old.maxCapacity,
              };
            });

            // Optimistically update events list cache
            queryClient.setQueriesData<CampusEvent[]>({ queryKey: queryKeys.events.all }, (old) => {
              if (!Array.isArray(old)) return old;
              return old.map((evt) => {
                if (evt.id === eventId) {
                  return {
                    ...evt,
                    registeredCount: data.registeredCount,
                    maxCapacity: data.maxCapacity ?? evt.maxCapacity,
                  };
                }
                return evt;
              });
            });
          } catch {
            // Ignore malformed message payloads
          }
        });

        es.onerror = () => {
          if (isDisposed) return;
          es.close();
          eventSourceRef.current = null;

          const nextRetry = retryCountRef.current + 1;
          setRetryCount(nextRetry);
          retryCountRef.current = nextRetry;
          setConnectionStatus('reconnecting');

          // Exponential backoff: 1s, 2s, 4s, 8s, up to 30s
          const delay = Math.min(1000 * 2 ** (nextRetry - 1), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isDisposed && isMountedRef.current) {
              connect();
            }
          }, delay);
        };
      } catch {
        setConnectionStatus('disconnected');
      }
    };

    connect();

    return () => {
      isDisposed = true;
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setConnectionStatus('disconnected');
    };
  }, [eventId, enabled, queryClient]);

  return {
    connectionStatus,
    isLive: connectionStatus === 'connected',
    registeredCount: latestCapacity?.registeredCount,
    availableSeats: latestCapacity?.availableSeats,
    maxCapacity: latestCapacity?.maxCapacity,
    retryCount,
  };
}
