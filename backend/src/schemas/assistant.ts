/**
 * Zod schemas for POST /assistant endpoint
 */
import { z } from 'zod';
import { 
  uuidSchema, 
  timestampSchema, 
  metricRefSchema
} from './common';

// Request body schema
export const assistantQueryRequestSchema = z.object({
  prompt: z.string()
    .trim()
    .min(1, 'Prompt is required')
    .max(1000, 'Prompt must be at most 1000 characters'),
});

// Individual assistant response message
export const assistantMessageSchema = z.object({
  role: z.enum(['assistant']),
  content: z.string()
    .min(1, 'Message content is required'),
  timestamp: timestampSchema,
  metricRefs: z.array(metricRefSchema)
    .max(20, 'Maximum 20 metric references per message')
    .optional()
    .default([]),
});

// POST /assistant response schema
export const assistantQueryResponseSchema = z.object({
  interactionId: uuidSchema,
  response: z.string()
    .min(1, 'Response content is required'),
  references: z.array(metricRefSchema)
    .max(20, 'Maximum 20 metric references per response')
    .default([]),
  firstTokenLatencyMs: z.number()
    .min(0, 'Latency must be non-negative'),
});

// Export types
export type AssistantQueryRequest = z.infer<typeof assistantQueryRequestSchema>;
export type AssistantMessage = z.infer<typeof assistantMessageSchema>;
export type AssistantQueryResponse = z.infer<typeof assistantQueryResponseSchema>;