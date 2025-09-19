/**
 * Zod schemas for GET /spend endpoint
 */
import { z } from 'zod';
import { 
  timeRangeSchema, 
  granularitySchema, 
  uuidSchema, 
  timestampSchema, 
  minorAmountSchema,
  metaSchema 
} from './common';

// Query parameters schema
export const spendQuerySchema = z.object({
  timeRange: timeRangeSchema,
  accountScope: z.string().optional(),
  service: z.string().optional(),
  granularity: granularitySchema.default('day'),
});

// Individual time series data point
export const spendDataPointSchema = z.object({
  ts: timestampSchema,
  costMinor: minorAmountSchema,
  projectedCostMinor: minorAmountSchema,
});

// Spend totals aggregation
export const spendTotalsSchema = z.object({
  baselineMinor: minorAmountSchema,
  projectedMinor: minorAmountSchema,
  deltaPct: z.number().min(0).max(1),
});

// GET /spend response schema
export const spendResponseSchema = z.object({
  tenantId: uuidSchema,
  timeRange: timeRangeSchema,
  currency: z.string().length(3, 'Currency must be 3-letter code').default('USD'),
  granularity: granularitySchema,
  series: z.array(spendDataPointSchema).max(744, 'Series data points limited to 744 (31 days * 24 hours)'),
  totals: spendTotalsSchema,
  meta: metaSchema,
});

// Export types
export type SpendQuery = z.infer<typeof spendQuerySchema>;
export type SpendDataPoint = z.infer<typeof spendDataPointSchema>;
export type SpendTotals = z.infer<typeof spendTotalsSchema>;
export type SpendResponse = z.infer<typeof spendResponseSchema>;