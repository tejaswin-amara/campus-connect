import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import type { CampusEvent } from '../../../types';

export interface UseEventsParams {
  search?: string;
  category?: string;
}

export function useEvents(params?: UseEventsParams) {
  return useQuery<CampusEvent[], Error>({
    queryKey: queryKeys.events.list(params as Record<string, unknown> | undefined),
    queryFn: () => apiClient.getEvents(params),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
}
