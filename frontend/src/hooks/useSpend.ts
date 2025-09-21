import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

// Types from backend schemas
interface SpendDataPoint {
  ts: string;
  costMinor: number;
  projectedCostMinor: number;
}

interface SpendTotals {
  baselineMinor: number;
  projectedMinor: number;
  deltaPct: number;
}

interface SpendResponse {
  tenantId: string;
  timeRange: string;
  currency: string;
  granularity: string;
  series: SpendDataPoint[];
  totals: SpendTotals;
  meta: {
    generated: string;
    executionTime: number;
  };
}

interface SpendQuery {
  timeRange: string;
  accountScope?: string;
  service?: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
}

export function useSpend(
  params: SpendQuery
): UseQueryResult<SpendResponse, Error> {
  return useQuery({
    queryKey: ['spend', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('timeRange', params.timeRange);
      if (params.accountScope)
        searchParams.append('accountScope', params.accountScope);
      if (params.service) searchParams.append('service', params.service);
      if (params.granularity)
        searchParams.append('granularity', params.granularity);

      const response = await fetch(`/api/spend?${searchParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch spend data: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  });
}
