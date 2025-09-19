/**
 * Zod schemas for GET /recommendations endpoint
 */
import { z } from 'zod';
import { 
  recommendationStatusSchema,
  recommendationCategorySchema,
  uuidSchema, 
  timestampSchema, 
  minorAmountSchema,
  metricRefSchema
} from './common';

// Query parameters schema
export const recommendationsQuerySchema = z.object({
  status: recommendationStatusSchema.optional(),
  category: recommendationCategorySchema.optional(),
});

// Individual recommendation item
export const recommendationItemSchema = z.object({
  id: uuidSchema,
  category: recommendationCategorySchema,
  status: recommendationStatusSchema,
  rationale: z.string()
    .min(1, 'Rationale is required')
    .max(2000, 'Rationale must be at most 2000 characters'),
  expectedSavingsMinor: minorAmountSchema,
  metricRefs: z.array(metricRefSchema)
    .max(10, 'Maximum 10 metric references allowed')
    .optional()
    .default([]),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// GET /recommendations response schema
export const recommendationsResponseSchema = z.object({
  tenantId: uuidSchema,
  items: z.array(recommendationItemSchema)
    .max(100, 'Maximum 100 recommendations per response'),
});

// Export types
export type RecommendationsQuery = z.infer<typeof recommendationsQuerySchema>;
export type RecommendationItem = z.infer<typeof recommendationItemSchema>;
export type RecommendationsResponse = z.infer<typeof recommendationsResponseSchema>;