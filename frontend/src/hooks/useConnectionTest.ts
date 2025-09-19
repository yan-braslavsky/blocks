import { useMutation, UseMutationResult } from '@tanstack/react-query'

// Types from backend schemas
interface ConnectionTestRequest {
  region: string
  roleArn: string
}

interface ConnectionTestResponse {
  success: boolean
  permissions: string[]
  accountId?: string
  error?: string
  meta: {
    generated: string
    executionTime: number
  }
}

export function useConnectionTest(): UseMutationResult<ConnectionTestResponse, Error, ConnectionTestRequest> {
  return useMutation({
    mutationFn: async (request: ConnectionTestRequest) => {
      const response = await fetch('/api/connection-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
      
      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.statusText}`)
      }
      
      return response.json()
    },
    // Optional: Add retry logic for connection failures
    retry: 2,
    retryDelay: 1000, // 1 second delay between retries
  })
}