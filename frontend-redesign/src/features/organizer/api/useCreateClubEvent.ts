import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import type { CreateClubEventInput, OrganizerEvent } from '../types';

export function useCreateClubEvent() {
  const queryClient = useQueryClient();

  return useMutation<OrganizerEvent, Error, CreateClubEventInput>({
    mutationFn: (data: CreateClubEventInput) => apiClient.createClubEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizer.events,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizer.club,
      });
    },
  });
}
