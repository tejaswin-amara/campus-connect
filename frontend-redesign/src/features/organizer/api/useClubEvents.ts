import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import type { OrganizerEvent } from '../types';

export function useClubEvents() {
  return useQuery<OrganizerEvent[], Error>({
    queryKey: queryKeys.organizer.events,
    queryFn: () => apiClient.getClubEvents(),
    staleTime: 30 * 1000,
  });
}
