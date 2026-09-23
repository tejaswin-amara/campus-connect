import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import type { KpiMetric } from '../../../types';

export function useAdminStats() {
  return useQuery<KpiMetric[], Error>({
    queryKey: queryKeys.admin.stats,
    queryFn: () => apiClient.getAdminStats(),
    refetchInterval: 1000 * 30, // 30s live telemetry update
  });
}
