import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import type { CampusEvent } from '../../../types';

export function useEvent(id: number | null) {
  return useQuery<CampusEvent, Error>({
    queryKey: id !== null ? queryKeys.events.detail(id) : (['events', 'detail', null] as const),
    queryFn: () => {
      if (id === null) throw new Error('No event ID provided');
      return apiClient.getEvent(id);
    },
    enabled: id !== null,
    staleTime: 1000 * 60 * 2,
  });
}
