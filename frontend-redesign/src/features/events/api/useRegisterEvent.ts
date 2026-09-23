import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import type { CampusEvent } from '../../../types';

export function useRegisterEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => apiClient.registerEvent(eventId),
    onMutate: async (eventId: number) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.events.all });

      // Snapshot the previous cache entries
      const previousEventsQueries = queryClient.getQueriesData<CampusEvent[]>({
        queryKey: queryKeys.events.all,
      });

      // Optimistically update all matching events queries in cache
      queryClient.setQueriesData<CampusEvent[]>({ queryKey: queryKeys.events.all }, (old) => {
        if (!old) return [];
        return old.map((event) => {
          if (event.id === eventId) {
            return {
              ...event,
              registeredCount: event.registeredCount + 1,
            };
          }
          return event;
        });
      });

      // Return context with snapshotted values for rollback on error
      return { previousEventsQueries };
    },
    onError: (_err, _eventId, context) => {
      // Rollback to snapshot on error
      if (context?.previousEventsQueries) {
        for (const [queryKey, data] of context.previousEventsQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      // Invalidate queries to ensure sync with server state
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
    },
  });
}
