import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import type { AuthUser, LoginFormData } from '../types';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<AuthUser, Error, LoginFormData>({
    mutationFn: (credentials) => apiClient.authLogin(credentials),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me, user);
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}
