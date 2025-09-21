import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';

// Types from backend schemas
type RecommendationStatus =
  | 'draft'
  | 'new'
  | 'acknowledged'
  | 'actioned'
  | 'archived';

interface Recommendation {
  id: string;
  category: 'rightsizing' | 'commitment' | 'idle';
  status: RecommendationStatus;
  rationale: string;
  expectedSavingsMinor: number;
  metricRefs?: string[];
  createdAt: string;
  updatedAt: string;
}

interface RecommendationsResponse {
  tenantId: string;
  items: Recommendation[];
}

interface RecommendationsQuery {
  status?: RecommendationStatus;
  category?: 'rightsizing' | 'commitment' | 'idle';
}

interface StatusMutationData {
  recommendationId: string;
  newStatus: RecommendationStatus;
}

export function useRecommendations(
  params: RecommendationsQuery = {}
): UseQueryResult<RecommendationsResponse, Error> {
  return useQuery({
    queryKey: ['recommendations', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.append('status', params.status);
      if (params.category) searchParams.append('category', params.category);

      const response = await fetch(`/api/recommendations?${searchParams}`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch recommendations: ${response.statusText}`
        );
      }

      return response.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 4 * 60 * 60 * 1000, // 4 hours
  });
}

// Hook for mutating recommendation status with optimistic updates
export function useRecommendationStatusMutation(): UseMutationResult<
  Recommendation,
  Error,
  StatusMutationData,
  { previousRecommendations: RecommendationsResponse | undefined }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recommendationId, newStatus }: StatusMutationData) => {
      // In a real implementation, this would be a PATCH/PUT request
      // For now, simulate the update with a mock response
      const response = await fetch(
        `/api/recommendations/${recommendationId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update recommendation status: ${response.statusText}`
        );
      }

      return response.json();
    },

    // Optimistic update
    onMutate: async ({ recommendationId, newStatus }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['recommendations'] });

      // Snapshot the previous value
      const previousRecommendations =
        queryClient.getQueryData<RecommendationsResponse>(['recommendations']);

      // Optimistically update to the new value
      if (previousRecommendations) {
        queryClient.setQueryData<RecommendationsResponse>(['recommendations'], {
          ...previousRecommendations,
          items: previousRecommendations.items.map(item =>
            item.id === recommendationId
              ? {
                  ...item,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        });
      }

      // Return a context object with the snapshotted value
      return { previousRecommendations };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context?.previousRecommendations) {
        queryClient.setQueryData(
          ['recommendations'],
          context.previousRecommendations
        );
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}
