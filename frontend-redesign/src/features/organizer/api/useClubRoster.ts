import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import type { Attendee } from '../types';

export function useClubRoster(eventId: number | null | undefined) {
  return useQuery<Attendee[], Error>({
    queryKey: queryKeys.organizer.attendees(eventId ?? 0),
    queryFn: () => apiClient.getEventAttendees(eventId ?? 0),
    enabled: typeof eventId === 'number' && eventId > 0,
    staleTime: 15 * 1000,
  });
}
