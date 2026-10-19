import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSimCollegeTelemetry } from './useSimCollegeTelemetry';

describe('useSimCollegeTelemetry', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('generates a unique eventId and queues the event payload', () => {
    const { result } = renderHook(() => useSimCollegeTelemetry());

    act(() => {
      result.current.trackEvent('pin_click', {
        pinId: 101,
        venue: 'Alan Turing Engineering Center',
      });
    });

    const queue = result.current.getQueuedEvents();
    expect(queue.length).toBe(1);
    expect(queue[0].eventType).toBe('pin_click');
    expect(queue[0].pinId).toBe(101);
    expect(queue[0].venue).toBe('Alan Turing Engineering Center');
    expect(typeof queue[0].eventId).toBe('string');
    expect(queue[0].eventId.length).toBeGreaterThan(5);
    expect(typeof queue[0].timestamp).toBe('string');
  });

  it('dispatches to fetch or beacon non-blockingly without throwing error', () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(() => Promise.reject(new Error('Network error (test fallback)')));

    const { result } = renderHook(() => useSimCollegeTelemetry());

    expect(() => {
      act(() => {
        result.current.trackEvent('map_zoom', { zoomLevel: 1.4 });
      });
    }).not.toThrow();

    expect(fetchSpy).toHaveBeenCalled();
  });
});
