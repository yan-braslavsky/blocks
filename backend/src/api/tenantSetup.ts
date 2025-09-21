/**
 * POST /tenant/setup handler
 * Creates or updates tenant configuration with AWS connection details
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import { tenantSetupRequestSchema, TenantSetupRequest, TenantSetupResponse } from '../schemas/tenant-setup';

const FIXTURES_PATH = path.join(__dirname, '../fixtures');

export async function tenantSetupHandler(
  request: FastifyRequest<{ Body: TenantSetupRequest }>,
  reply: FastifyReply
): Promise<TenantSetupResponse> {
  // Validate request body
  const validatedBody = tenantSetupRequestSchema.parse(request.body);

  // In mock mode, return fixture data
  if (process.env.USE_MOCKS === '1') {
    try {
      const fixtureData = await fs.readFile(
        path.join(FIXTURES_PATH, 'tenantSetup.json'), 
        'utf-8'
      );
      const fixture = JSON.parse(fixtureData) as TenantSetupResponse;
      
      // Update fixture with request data
      fixture.name = validatedBody.name;

      request.log.info({ tenantName: validatedBody.name }, 'Tenant setup completed (mock)');
      
      return fixture;
    } catch (error) {
      request.log.error({ error }, 'Failed to load tenant setup fixture');
      reply.status(500);
      throw new Error('Failed to process tenant setup');
    }
  }

  // Non-mock implementation would go here
  reply.status(501);
  throw new Error('Non-mock tenant setup not implemented');
}