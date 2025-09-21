/**
 * Zod schemas for export API endpoints
 * Validates request/response data for data export functionality
 */
import { z } from 'zod';

/**
 * Export type options
 */
export const ExportType = z.enum(['spending', 'recommendations', 'full']);

/**
 * Query parameters for export endpoint
 */
export const exportQuerySchema = z.object({
  type: ExportType.default('full'),
  format: z.enum(['csv']).default('csv'),
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional()
});

export type ExportQuery = z.infer<typeof exportQuerySchema>;
export type ExportType = z.infer<typeof ExportType>;