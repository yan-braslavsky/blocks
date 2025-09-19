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
  question: z.string()
    .min(1, 'Question is required')
    .max(1000, 'Question must be at most 1000 characters'),
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
  tenantId: uuidSchema,
  conversationId: uuidSchema,
  messages: z.array(assistantMessageSchema)
    .min(1, 'At least one message is required')
    .max(10, 'Maximum 10 messages per response'),
  isStreaming: z.boolean()
    .default(false),
});

// Export types
export type AssistantQueryRequest = z.infer<typeof assistantQueryRequestSchema>;
export type AssistantMessage = z.infer<typeof assistantMessageSchema>;
export type AssistantQueryResponse = z.infer<typeof assistantQueryResponseSchema>;