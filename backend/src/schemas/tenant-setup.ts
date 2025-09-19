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
  tenantName: tenantNameSchema,
  roleArn: awsArnSchema,
  externalId: externalIdSchema,
});

// Tenant setup result
export const tenantSetupResultSchema = z.object({
  tenantId: uuidSchema,
  tenantName: tenantNameSchema,
  roleArn: awsArnSchema,
  externalId: externalIdSchema,
  isActivated: z.boolean(),
  createdAt: timestampSchema,
  lastUpdatedAt: timestampSchema,
});

// POST /tenant-setup response schema
export const tenantSetupResponseSchema = z.object({
  tenant: tenantSetupResultSchema,
});

// Export types
export type TenantSetupRequest = z.infer<typeof tenantSetupRequestSchema>;
export type TenantSetupResult = z.infer<typeof tenantSetupResultSchema>;
export type TenantSetupResponse = z.infer<typeof tenantSetupResponseSchema>;