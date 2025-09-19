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

// Connection validation result
export const connectionValidationSchema = z.object({
  roleArn: awsArnSchema,
  isValid: z.boolean(),
  errorMessage: z.string()
    .max(500, 'Error message must be at most 500 characters')
    .optional(),
  testedAt: timestampSchema,
  permissions: z.array(z.string())
    .max(50, 'Maximum 50 permissions can be listed')
    .optional()
    .default([]),
});

// POST /connection-test response schema
export const connectionTestResponseSchema = z.object({
  validation: connectionValidationSchema,
});

// Export types
export type ConnectionTestRequest = z.infer<typeof connectionTestRequestSchema>;
export type ConnectionValidation = z.infer<typeof connectionValidationSchema>;
export type ConnectionTestResponse = z.infer<typeof connectionTestResponseSchema>;