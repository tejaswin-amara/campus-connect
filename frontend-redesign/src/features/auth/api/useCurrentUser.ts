import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import type { AuthUser } from '../types';

export function useCurrentUser() {
  return useQuery<AuthUser | null>({
    queryKey: queryKeys.auth.me,
    queryFn: () => apiClient.authMe(),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
