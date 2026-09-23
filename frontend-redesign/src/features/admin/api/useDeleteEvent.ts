import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import type { CampusEvent } from '../../../types';

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.deleteEvent(id),
    onMutate: async (deletedId: number) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.events.all });

      const previousEventsQueries = queryClient.getQueriesData<CampusEvent[]>({
        queryKey: queryKeys.events.all,
      });

      // Optimistically remove from all cached event queries
      queryClient.setQueriesData<CampusEvent[]>({ queryKey: queryKeys.events.all }, (old) => {
        if (!old) return [];
        return old.filter((e) => e.id !== deletedId);
      });

      return { previousEventsQueries };
    },
    onError: (_err, _id, context) => {
      if (context?.previousEventsQueries) {
        for (const [queryKey, data] of context.previousEventsQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
    },
  });
}
