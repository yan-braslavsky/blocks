/**
 * Zod schemas for GET /projection endpoint
 */
import { z } from 'zod';
import { 
  timeRangeSchema, 
  uuidSchema, 
  timestampSchema, 
  minorAmountSchema,
  percentageSchema 
} from './common';

// Query parameters schema
export const projectionQuerySchema = z.object({
  period: timeRangeSchema,
});

// GET /projection response schema
export const projectionResponseSchema = z.object({
  tenantId: uuidSchema,
  period: timeRangeSchema,
  baselineMinor: minorAmountSchema,
  projectedMinor: minorAmountSchema,
  deltaPct: percentageSchema,
  generatedAt: timestampSchema,
});

// Export types
export type ProjectionQuery = z.infer<typeof projectionQuerySchema>;
export type ProjectionResponse = z.infer<typeof projectionResponseSchema>;