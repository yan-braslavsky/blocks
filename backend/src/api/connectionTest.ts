/**
 * POST /connection/test handler
 * Tests AWS IAM role connection and validates permissions
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import { connectionTestRequestSchema, ConnectionTestRequest, ConnectionTestResponse } from '../schemas/connection-test';

const FIXTURES_PATH = path.join(__dirname, '../fixtures');

export async function connectionTestHandler(
  request: FastifyRequest<{ Body: ConnectionTestRequest }>,
  reply: FastifyReply
): Promise<ConnectionTestResponse> {
  // Validate request body
  const validatedBody = connectionTestRequestSchema.parse(request.body);

  // In mock mode, return fixture data
  if (process.env.USE_MOCKS === '1') {
    try {
      const fixtureData = await fs.readFile(
        path.join(FIXTURES_PATH, 'connectionSuccess.json'), 
        'utf-8'
      );
      const fixture = JSON.parse(fixtureData) as ConnectionTestResponse;
      
      // Simulate validation based on ARN pattern
      const isValidArn = /^arn:aws:iam::\d{12}:role\/[a-zA-Z0-9+=,.@_-]+$/.test(validatedBody.roleArn);
      
      if (!isValidArn) {
        // Return error status with failed checks
        const errorResponse: ConnectionTestResponse = {
          status: 'error',
          checks: [
            {
              id: 'assumeRole',
              ok: false,
              message: 'Invalid IAM role ARN format'
            }
          ]
        };
        request.log.info({ 
          roleArn: validatedBody.roleArn, 
          isValid: false 
        }, 'Connection test completed (mock)');
        return errorResponse;
      }

      request.log.info({ 
        roleArn: validatedBody.roleArn, 
        isValid: true 
      }, 'Connection test completed (mock)');
      
      return fixture;
    } catch (error) {
      request.log.error({ error }, 'Failed to load connection test fixture');
      reply.status(500);
      throw new Error('Failed to process connection test');
    }
  }

  // Non-mock implementation would go here
  reply.status(501);
  throw new Error('Non-mock connection test not implemented');
}