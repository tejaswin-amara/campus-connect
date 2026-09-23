import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { queryKeys } from '../../../lib/queryKeys';
import type { CampusEvent } from '../../../types';
import { useEventTelemetry } from './useEventTelemetry';

class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  options?: EventSourceInit;
  listeners: Record<string, ((event: { type: string; data?: string }) => void)[]> = {};
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readyState = 0;

  constructor(url: string, options?: EventSourceInit) {
    this.url = url;
    this.options = options;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (event: { type: string; data?: string }) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (event: { type: string; data?: string }) => void) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((l) => l !== listener);
    }
  }

  dispatchEvent(event: { type: string; data?: string }) {
    if (event.type === 'open' && this.onopen) {
      this.onopen();
    }
    const handlers = this.listeners[event.type] || [];
    for (const handler of handlers) {
      handler(event);
    }
  }

  close() {
    this.readyState = 2;
  }
}

describe('useEventTelemetry hook', () => {
  let queryClient: QueryClient;
  const originalEventSource = globalThis.EventSource;

  beforeEach(() => {
    vi.useFakeTimers();
    MockEventSource.instances = [];
    (globalThis as unknown as { EventSource: unknown }).EventSource = MockEventSource;
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    (globalThis as unknown as { EventSource: unknown }).EventSource = originalEventSource;
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it('connects to event telemetry stream and updates status to connected on open', () => {
    const { result } = renderHook(() => useEventTelemetry(42), { wrapper });

    expect(result.current.connectionStatus).toBe('connecting');
    expect(MockEventSource.instances.length).toBe(1);
    expect(MockEventSource.instances[0].url).toContain('/api/events/42/telemetry-stream');

    act(() => {
      MockEventSource.instances[0].onopen?.();
    });

    expect(result.current.connectionStatus).toBe('connected');
    expect(result.current.isLive).toBe(true);
    expect(result.current.retryCount).toBe(0);
  });

  it('handles capacity_update events and mutates TanStack Query cache', () => {
    const initialEvent: CampusEvent = {
      id: 42,
      title: 'Hackathon',
      description: 'Annual hackathon',
      category: 'Technical',
      dateTime: '2026-10-01T10:00:00Z',
      venue: 'Main Hall',
      clubName: 'Tech Club',
      maxCapacity: 100,
      registeredCount: 10,
      syllabus: [],
    };

    queryClient.setQueryData(queryKeys.events.detail(42), initialEvent);
    queryClient.setQueryData(queryKeys.events.all, [initialEvent]);

    const { result } = renderHook(() => useEventTelemetry(42), { wrapper });

    act(() => {
      MockEventSource.instances[0].onopen?.();
    });

    const payload = {
      eventId: 42,
      registeredCount: 85,
      availableSeats: 15,
      maxCapacity: 100,
      status: 'FILLING_FAST',
    };

    act(() => {
      MockEventSource.instances[0].dispatchEvent({
        type: 'capacity_update',
        data: JSON.stringify(payload),
      });
    });

    expect(result.current.registeredCount).toBe(85);
    expect(result.current.availableSeats).toBe(15);
    expect(result.current.maxCapacity).toBe(100);

    const cachedDetail = queryClient.getQueryData<CampusEvent>(queryKeys.events.detail(42));
    expect(cachedDetail?.registeredCount).toBe(85);

    const cachedList = queryClient.getQueryData<CampusEvent[]>(queryKeys.events.all);
    expect(cachedList?.[0]?.registeredCount).toBe(85);
  });

  it('handles connection error with reconnect backoff and lifecycle cleanup', () => {
    const { result, unmount } = renderHook(() => useEventTelemetry(42), { wrapper });

    act(() => {
      MockEventSource.instances[0].onerror?.();
    });

    expect(result.current.connectionStatus).toBe('reconnecting');
    expect(result.current.retryCount).toBe(1);

    // Fast-forward backoff timer (1s)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(MockEventSource.instances.length).toBe(2);

    unmount();
    expect(MockEventSource.instances[1].readyState).toBe(2);
  });
});
