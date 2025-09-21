/**
 * Zod schemas for POST /tenant-setup endpoint
 */
import { z } from 'zod';
import { 
  uuidSchema,
  awsArnSchema,
  externalIdSchema,
  tenantNameSchema,
  timestampSchema
} from './common';

// Request body schema
export const tenantSetupRequestSchema = z.object({
  name: tenantNameSchema,
  roleArn: awsArnSchema,
  externalId: externalIdSchema,
});

// Tenant setup result
export const tenantSetupResultSchema = z.object({
  tenantId: uuidSchema,
  name: tenantNameSchema,
  roleArn: awsArnSchema,
  externalId: externalIdSchema,
  isActivated: z.boolean(),
  createdAt: timestampSchema,
  lastUpdatedAt: timestampSchema,
});

// POST /tenant-setup response schema
export const tenantSetupResponseSchema = z.object({
  tenantId: uuidSchema,
  name: tenantNameSchema,
  connectionStatus: z.enum(['unconfigured', 'pending', 'validated', 'error']),
});

// Export types
export type TenantSetupRequest = z.infer<typeof tenantSetupRequestSchema>;
export type TenantSetupResult = z.infer<typeof tenantSetupResultSchema>;
export type TenantSetupResponse = z.infer<typeof tenantSetupResponseSchema>;