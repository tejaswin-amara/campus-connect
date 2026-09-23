import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import type { CampusEvent } from '../../../types';
import { useRegisterEvent } from './useRegisterEvent';

vi.mock('../../../lib/apiClient', () => ({
  apiClient: {
    registerEvent: vi.fn(),
  },
}));

describe('useRegisterEvent', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('optimistically increments registeredCount in query cache', async () => {
    const initialEvents: CampusEvent[] = [
      {
        id: 7,
        title: 'Cybersecurity CTF',
        description: 'Capture the flag hacking contest.',
        category: 'Technical',
        venue: 'Room 201',
        dateTime: '2026-10-20',
        maxCapacity: 50,
        registeredCount: 15,
      },
    ];

    queryClient.setQueryData(queryKeys.events.all, initialEvents);

    vi.mocked(apiClient.registerEvent).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                event: { ...initialEvents[0], registeredCount: 16 },
              }),
            100,
          ),
        ),
    );

    const { result } = renderHook(() => useRegisterEvent(), { wrapper });

    act(() => {
      result.current.mutate(7);
    });

    // Check optimistic update in cache
    await waitFor(() => {
      const cached = queryClient.getQueryData<CampusEvent[]>(queryKeys.events.all);
      expect(cached?.[0].registeredCount).toBe(16);
    });
  });

  it('rolls back cache upon mutation error', async () => {
    const initialEvents: CampusEvent[] = [
      {
        id: 8,
        title: 'Full Capacity Event',
        description: 'Event that is at max limit.',
        category: 'Workshop',
        venue: 'Hall A',
        dateTime: '2026-10-21',
        maxCapacity: 20,
        registeredCount: 20,
      },
    ];

    queryClient.setQueryData(queryKeys.events.all, initialEvents);

    vi.mocked(apiClient.registerEvent).mockRejectedValueOnce(
      new Error('This event is at maximum capacity.'),
    );

    const { result } = renderHook(() => useRegisterEvent(), { wrapper });

    await act(async () => {
      try {
        await result.current.mutateAsync(8);
      } catch {
        // Expected failure
      }
    });

    // Check rollback occurred
    const cached = queryClient.getQueryData<CampusEvent[]>(queryKeys.events.all);
    expect(cached?.[0].registeredCount).toBe(20);
  });
});
