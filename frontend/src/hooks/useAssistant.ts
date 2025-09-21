import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

// Types from backend schemas
interface AssistantRequest {
  message: string;
  context?: {
    tenantId?: string;
    conversationHistory?: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;
  };
}

interface AssistantResponse {
  response: string;
  confidence: number;
  sources: string[];
  meta: {
    generated: string;
    executionTime: number;
  };
}

export function useAssistant(): UseMutationResult<
  AssistantResponse,
  Error,
  AssistantRequest
> {
  return useMutation({
    mutationFn: async (request: AssistantRequest) => {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to get assistant response: ${response.statusText}`
        );
      }

      return response.json();
    },
    // Optional: Add retry logic for network failures
    retry: 1,
  });
}
