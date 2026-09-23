import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import type { ClubDetail } from '../types';

export function useClubDetails() {
  return useQuery<ClubDetail, Error>({
    queryKey: queryKeys.organizer.club,
    queryFn: () => apiClient.getMyClub(),
    staleTime: 60 * 1000,
  });
}
