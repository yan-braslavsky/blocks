/**
 * Zod schemas for POST /connection-test endpoint
 */
import { z } from 'zod';
import { 
  awsArnSchema,
  externalIdSchema,
  timestampSchema
} from './common';

// Request body schema
export const connectionTestRequestSchema = z.object({
  roleArn: awsArnSchema,
  externalId: externalIdSchema,
});

// Connection check result
export const connectionCheckSchema = z.object({
  id: z.string(),
  ok: z.boolean(),
  message: z.string().optional(),
});

// POST /connection-test response schema
export const connectionTestResponseSchema = z.object({
  status: z.enum(['pending', 'validated', 'error']),
  checks: z.array(connectionCheckSchema).min(1, 'At least one check is required'),
});

// Export types
export type ConnectionTestRequest = z.infer<typeof connectionTestRequestSchema>;
export type ConnectionCheck = z.infer<typeof connectionCheckSchema>;
export type ConnectionTestResponse = z.infer<typeof connectionTestResponseSchema>;