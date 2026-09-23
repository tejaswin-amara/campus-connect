import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import type { CheckInResult } from '../types';

export interface CheckInVariables {
  eventId: number;
  data: {
    ticketCode?: string;
    rollNumber?: string;
  };
}

export function useCheckInAttendee() {
  const queryClient = useQueryClient();

  return useMutation<CheckInResult, Error, CheckInVariables>({
    mutationFn: ({ eventId, data }) => apiClient.checkInAttendee(eventId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizer.attendees(variables.eventId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizer.events,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizer.club,
      });
    },
  });
}
