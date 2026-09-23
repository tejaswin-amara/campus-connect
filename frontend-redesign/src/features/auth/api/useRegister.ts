import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import type { AuthUser, RegisterFormData } from '../types';

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation<AuthUser, Error, RegisterFormData>({
    mutationFn: (data) => apiClient.authRegister(data),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me, user);
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}
