import { useQuery, UseQueryResult } from '@tanstack/react-query'

// Types from backend schemas
interface ProjectionScenario {
  name: string
  costMinor: number
  confidence: number
}

interface ProjectionResponse {
  tenantId: string
  timeRange: string
  currency: string
  scenarios: ProjectionScenario[]
  meta: {
    generated: string
    executionTime: number
  }
}

interface ProjectionQuery {
  timeRange: string
  accountScope?: string
  confidenceLevel?: number
}

export function useProjection(
  params: ProjectionQuery
): UseQueryResult<ProjectionResponse, Error> {
  return useQuery({
    queryKey: ['projection', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      searchParams.append('timeRange', params.timeRange)
      if (params.accountScope) searchParams.append('accountScope', params.accountScope)
      if (params.confidenceLevel) searchParams.append('confidenceLevel', params.confidenceLevel.toString())

      const response = await fetch(`/api/projection?${searchParams}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projection data: ${response.statusText}`)
      }
      
      return response.json()
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 60 * 60 * 1000, // 1 hour
  })
}