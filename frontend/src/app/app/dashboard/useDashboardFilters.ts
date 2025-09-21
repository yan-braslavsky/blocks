'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

interface DashboardFilters {
  timeRange: string;
  service?: string;
  accountScope?: string;
  granularity: 'hour' | 'day' | 'week' | 'month';
}

interface UseDashboardFiltersResult {
  filters: DashboardFilters;
  setFilter: (key: keyof DashboardFilters, value: string | undefined) => void;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: DashboardFilters = {
  timeRange: '30d',
  granularity: 'day',
};

export function useDashboardFilters(): UseDashboardFiltersResult {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Parse current filters from URL params
  const filters = useMemo(() => {
    return {
      timeRange: searchParams.get('timeRange') || DEFAULT_FILTERS.timeRange,
      service: searchParams.get('service') || undefined,
      accountScope: searchParams.get('accountScope') || undefined,
      granularity: (searchParams.get('granularity') as DashboardFilters['granularity']) || DEFAULT_FILTERS.granularity,
    } as DashboardFilters;
  }, [searchParams]);

  // Update URL with new filter values
  const updateUrl = useCallback((newFilters: Partial<DashboardFilters>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update parameters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Remove default values to keep URL clean
    if (params.get('timeRange') === DEFAULT_FILTERS.timeRange) {
      params.delete('timeRange');
    }
    if (params.get('granularity') === DEFAULT_FILTERS.granularity) {
      params.delete('granularity');
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    window.history.replaceState({}, '', newUrl);
  }, [searchParams, pathname]);

  // Set a single filter
  const setFilter = useCallback((key: keyof DashboardFilters, value: string | undefined) => {
    updateUrl({ [key]: value });
  }, [updateUrl]);

  // Set multiple filters at once
  const setFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    updateUrl(newFilters);
  }, [updateUrl]);

  // Reset all filters to defaults
  const resetFilters = useCallback(() => {
    window.history.replaceState({}, '', pathname);
  }, [pathname]);

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
  };
}