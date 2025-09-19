import { useQuery, UseQueryResult } from '@tanstack/react-query'

// Types from backend schemas
interface Recommendation {
  id: string
  type: 'rightsizing' | 'reservedInstance' | 'spotInstance' | 'savings'
  priority: number
  resourceArn: string
  title: string
  description: string
  potentialSavingsMinor: number
  confidence: number
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  riskLevel: 'low' | 'medium' | 'high'
  categories: string[]
  actionRequired?: string
  estimatedImplementationTime?: string
  prerequisites?: string[]
  validUntil?: string
}

interface RecommendationsResponse {
  tenantId: string
  accountScope?: string
  currency: string
  totalPotentialSavingsMinor: number
  recommendations: Recommendation[]
  meta: {
    generated: string
    executionTime: number
  }
}

interface RecommendationsQuery {
  accountScope?: string
  category?: string
  minSavings?: number
  riskLevel?: 'low' | 'medium' | 'high'
}

export function useRecommendations(
  params: RecommendationsQuery = {}
): UseQueryResult<RecommendationsResponse, Error> {
  return useQuery({
    queryKey: ['recommendations', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params.accountScope) searchParams.append('accountScope', params.accountScope)
      if (params.category) searchParams.append('category', params.category)
      if (params.minSavings) searchParams.append('minSavings', params.minSavings.toString())
      if (params.riskLevel) searchParams.append('riskLevel', params.riskLevel)

      const response = await fetch(`/api/recommendations?${searchParams}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.statusText}`)
      }
      
      return response.json()
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 4 * 60 * 60 * 1000, // 4 hours
  })
}