/**
 * Common Zod schemas and utilities for API validation
 */
import { z } from 'zod';

// Common error shape
export const errorSchema = z.object({
  error: z.object({
    code: z.string().min(1, 'Error code is required'),
    message: z.string().min(1, 'Error message is required'),
    hint: z.string().optional(),
  }),
});

// UUID validation
export const uuidSchema = z.string().uuid('Invalid UUID format');

// ISO 8601 timestamp validation
export const timestampSchema = z.string().datetime('Invalid ISO 8601 timestamp');

// Monetary amount in minor units (cents)
export const minorAmountSchema = z.number().int().nonnegative('Amount must be non-negative integer');

// Percentage (0-1 decimal)
export const percentageSchema = z.number().min(0).max(1, 'Percentage must be between 0 and 1');

// Time range enum
export const timeRangeSchema = z.enum(['day', 'week', 'month', 'ytd'], {
  errorMap: () => ({ message: 'Time range must be one of: day, week, month, ytd' }),
});

// Granularity enum
export const granularitySchema = z.enum(['hour', 'day'], {
  errorMap: () => ({ message: 'Granularity must be either hour or day' }),
});

// Recommendation status enum
export const recommendationStatusSchema = z.enum(['draft', 'new', 'acknowledged', 'actioned', 'archived'], {
  errorMap: () => ({ message: 'Status must be one of: draft, new, acknowledged, actioned, archived' }),
});

// Recommendation category enum
export const recommendationCategorySchema = z.enum(['rightsizing', 'commitment', 'idle'], {
  errorMap: () => ({ message: 'Category must be one of: rightsizing, commitment, idle' }),
});

// AWS ARN pattern validation
export const awsArnSchema = z.string().regex(
  /^arn:aws:iam::\d{12}:role\/[a-zA-Z0-9+=,.@\-_]+$/,
  'Invalid AWS IAM role ARN format'
);

// External ID validation (8-64 alphanumeric + hyphen)
export const externalIdSchema = z.string()
  .min(8, 'External ID must be at least 8 characters')
  .max(64, 'External ID must be at most 64 characters')
  .regex(/^[a-zA-Z0-9-]+$/, 'External ID must contain only alphanumeric characters and hyphens');

// Tenant name validation
export const tenantNameSchema = z.string()
  .min(3, 'Tenant name must be at least 3 characters')
  .max(60, 'Tenant name must be at most 60 characters')
  .trim();

// Metric reference pattern validation (e.g., "agg:2025-09-19T10", "rec:uuid")
export const metricRefSchema = z.string().regex(
  /^(agg|rec):[A-Za-z0-9:-]+$/,
  'Metric reference must follow pattern: (agg|rec):[identifier]'
);

// Common response metadata
export const metaSchema = z.object({
  lastIngestAt: timestampSchema.optional(),
  dataPoints: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional(),
}).optional();

// Export types for TypeScript
export type ErrorResponse = z.infer<typeof errorSchema>;
export type TimeRange = z.infer<typeof timeRangeSchema>;
export type Granularity = z.infer<typeof granularitySchema>;
export type RecommendationStatus = z.infer<typeof recommendationStatusSchema>;
export type RecommendationCategory = z.infer<typeof recommendationCategorySchema>;
export type MetricRef = z.infer<typeof metricRefSchema>;