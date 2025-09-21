/**
 * Performance data collection schemas
 */
import { z } from 'zod';
import { uuidSchema } from './common';

export const perfMarkerSchema = z.object({
  name: z.string().min(1).max(100),
  value: z.number().min(0),
  timestamp: z.number().positive(),
  url: z.string().optional(),
  userAgent: z.string().optional(),
  connectionType: z.string().optional(),
});

export const perfBatchSchema = z.object({
  sessionId: z.string().min(1).max(100),
  tenantId: uuidSchema.optional(),
  markers: z.array(perfMarkerSchema).min(1).max(50),
  metadata: z.record(z.string()).optional(),
});

export const perfCollectRequestSchema = perfBatchSchema;

export const perfCollectResponseSchema = z.object({
  success: z.boolean(),
  processed: z.number(),
  sessionId: z.string(),
});

export type PerfMarker = z.infer<typeof perfMarkerSchema>;
export type PerfBatch = z.infer<typeof perfBatchSchema>;
export type PerfCollectRequest = z.infer<typeof perfCollectRequestSchema>;
export type PerfCollectResponse = z.infer<typeof perfCollectResponseSchema>;