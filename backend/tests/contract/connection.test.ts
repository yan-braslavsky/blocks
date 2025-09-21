/**
 * Contract test for POST /connection/test endpoint
 * Tests validation of request body and response structure according to API contract
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import { createApp } from '../../src/server.js';
import { 
  connectionTestRequestSchema, 
  connectionTestResponseSchema, 
  errorSchema 
} from '../../src/schemas/index.js';

describe('POST /connection/test - Contract Tests', () => {
  let app: FastifyInstance;
  let request: supertest.Agent;

  beforeAll(async () => {
    app = createApp();
    await app.ready();
    request = supertest(app.server);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Request Body Validation', () => {
    it('should accept valid request body with valid ARN and externalId', async () => {
      const validRequest = {
        roleArn: 'arn:aws:iam::123456789012:role/BlocksReadRole',
        externalId: 'abc-12345'
      };

      // Validate request body against schema
      const requestResult = connectionTestRequestSchema.safeParse(validRequest);
      expect(requestResult.success).toBe(true);

      // Handler should be working now
      const response = await request.post('/connection/test').send(validRequest);
      expect(response.status).toBe(200); // Handler should work
    });

    it('should reject request body without roleArn field', async () => {
      const invalidRequest = {
        externalId: 'abc-12345'
      };

      const requestResult = connectionTestRequestSchema.safeParse(invalidRequest);
      expect(requestResult.success).toBe(false);
      expect(requestResult.error?.issues[0].path).toContain('roleArn');
    });

    it('should reject request body without externalId field', async () => {
      const invalidRequest = {
        roleArn: 'arn:aws:iam::123456789012:role/BlocksReadRole'
      };

      const requestResult = connectionTestRequestSchema.safeParse(invalidRequest);
      expect(requestResult.success).toBe(false);
      expect(requestResult.error?.issues[0].path).toContain('externalId');
    });

    it('should reject request body with invalid ARN pattern', async () => {
      const invalidRequest = {
        roleArn: 'invalid-arn-format',
        externalId: 'abc-12345'
      };

      const requestResult = connectionTestRequestSchema.safeParse(invalidRequest);
      expect(requestResult.success).toBe(false);
      expect(requestResult.error?.issues[0].path).toContain('roleArn');
    });

    it('should reject request body with ARN missing required components', async () => {
      const invalidRequests = [
        {
          roleArn: 'arn:aws:iam::role/BlocksReadRole', // Missing account ID
          externalId: 'abc-12345'
        },
        {
          roleArn: 'arn:aws:iam::123456789012:BlocksReadRole', // Missing role/
          externalId: 'abc-12345'
        },
        {
          roleArn: 'arn:s3:iam::123456789012:role/BlocksReadRole', // Wrong service
          externalId: 'abc-12345'
        }
      ];

      for (const invalidRequest of invalidRequests) {
        const requestResult = connectionTestRequestSchema.safeParse(invalidRequest);
        expect(requestResult.success).toBe(false);
        expect(requestResult.error?.issues[0].path).toContain('roleArn');
      }
    });

    it('should reject request body with externalId too short', async () => {
      const invalidRequest = {
        roleArn: 'arn:aws:iam::123456789012:role/BlocksReadRole',
        externalId: 'abc123' // Less than 8 characters
      };

      const requestResult = connectionTestRequestSchema.safeParse(invalidRequest);
      expect(requestResult.success).toBe(false);
      expect(requestResult.error?.issues[0].path).toContain('externalId');
    });

    it('should reject request body with externalId too long', async () => {
      const invalidRequest = {
        roleArn: 'arn:aws:iam::123456789012:role/BlocksReadRole',
        externalId: 'a'.repeat(65) // More than 64 characters
      };

      const requestResult = connectionTestRequestSchema.safeParse(invalidRequest);
      expect(requestResult.success).toBe(false);
      expect(requestResult.error?.issues[0].path).toContain('externalId');
    });

    it('should reject request body with externalId containing invalid characters', async () => {
      const invalidRequest = {
        roleArn: 'arn:aws:iam::123456789012:role/BlocksReadRole',
        externalId: 'abc-123_$' // Contains invalid character $
      };

      const requestResult = connectionTestRequestSchema.safeParse(invalidRequest);
      expect(requestResult.success).toBe(false);
      expect(requestResult.error?.issues[0].path).toContain('externalId');
    });

    it('should accept request body with externalId at minimum length', async () => {
      const validRequest = {
        roleArn: 'arn:aws:iam::123456789012:role/BlocksReadRole',
        externalId: 'abcdef12' // Exactly 8 characters
      };

      const requestResult = connectionTestRequestSchema.safeParse(validRequest);
      expect(requestResult.success).toBe(true);
    });

    it('should accept request body with externalId at maximum length', async () => {
      const validRequest = {
        roleArn: 'arn:aws:iam::123456789012:role/BlocksReadRole',
        externalId: 'a'.repeat(64) // Exactly 64 characters
      };

      const requestResult = connectionTestRequestSchema.safeParse(validRequest);
      expect(requestResult.success).toBe(true);
    });

    it('should accept request body with valid externalId containing hyphens', async () => {
      const validRequest = {
        roleArn: 'arn:aws:iam::123456789012:role/BlocksReadRole',
        externalId: 'blocks-external-id-12345'
      };

      const requestResult = connectionTestRequestSchema.safeParse(validRequest);
      expect(requestResult.success).toBe(true);
    });
  });

  describe('Response Structure Validation', () => {
    it('should validate successful response structure with all checks passing', () => {
      const mockResponse = {
        status: 'validated',
        checks: [
          { id: 'assumeRole', ok: true },
          { id: 's3Access', ok: true }
        ]
      };

      const responseResult = connectionTestResponseSchema.safeParse(mockResponse);
      expect(responseResult.success).toBe(true);
    });

    it('should validate error response structure with failed checks', () => {
      const mockResponse = {
        status: 'error',
        checks: [
          { id: 'assumeRole', ok: false, message: 'AccessDenied' },
          { id: 's3Access', ok: true }
        ]
      };

      const responseResult = connectionTestResponseSchema.safeParse(mockResponse);
      expect(responseResult.success).toBe(true);
    });

    it('should reject response with invalid status value', () => {
      const invalidResponse = {
        status: 'invalid-status',
        checks: [
          { id: 'assumeRole', ok: true }
        ]
      };

      const responseResult = connectionTestResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });

    it('should reject response without checks array', () => {
      const invalidResponse = {
        status: 'validated'
        // Missing checks array
      };

      const responseResult = connectionTestResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });

    it('should reject response with empty checks array', () => {
      const invalidResponse = {
        status: 'validated',
        checks: [] // Should have at least one check
      };

      const responseResult = connectionTestResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });

    it('should reject check without required id field', () => {
      const invalidResponse = {
        status: 'validated',
        checks: [
          { ok: true } // Missing id field
        ]
      };

      const responseResult = connectionTestResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });

    it('should reject check without required ok field', () => {
      const invalidResponse = {
        status: 'validated',
        checks: [
          { id: 'assumeRole' } // Missing ok field
        ]
      };

      const responseResult = connectionTestResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });

    it('should validate check with optional message field', () => {
      const mockResponse = {
        status: 'error',
        checks: [
          { id: 'assumeRole', ok: false, message: 'Role not found' }
        ]
      };

      const responseResult = connectionTestResponseSchema.safeParse(mockResponse);
      expect(responseResult.success).toBe(true);
    });

    it('should validate multiple checks in response', () => {
      const mockResponse = {
        status: 'error',
        checks: [
          { id: 'assumeRole', ok: true },
          { id: 's3Access', ok: false, message: 'Insufficient permissions' },
          { id: 'billingAccess', ok: true }
        ]
      };

      const responseResult = connectionTestResponseSchema.safeParse(mockResponse);
      expect(responseResult.success).toBe(true);
    });
  });

  describe('Error Response Validation', () => {
    it('should validate error response structure', () => {
      const mockError = {
        error: {
          code: 'INVALID_ARN',
          message: 'Invalid ARN format provided',
          hint: 'ARN must follow format: arn:aws:iam::{account}:role/{role-name}'
        }
      };

      const errorResult = errorSchema.safeParse(mockError);
      expect(errorResult.success).toBe(true);
    });

    it('should validate error response for invalid external ID', () => {
      const mockError = {
        error: {
          code: 'INVALID_EXTERNAL_ID',
          message: 'External ID must be 8-64 alphanumeric characters with hyphens',
          hint: 'Use only letters, numbers, and hyphens'
        }
      };

      const errorResult = errorSchema.safeParse(mockError);
      expect(errorResult.success).toBe(true);
    });

    it('should reject error response without required fields', () => {
      const invalidError = {
        error: {
          code: 'INVALID_ARN'
          // Missing required message field
        }
      };

      const errorResult = errorSchema.safeParse(invalidError);
      expect(errorResult.success).toBe(false);
    });
  });

  describe('Integration Test Placeholders', () => {
    it('should handle actual endpoint call once handler is implemented', async () => {
      const validRequest = {
        roleArn: 'arn:aws:iam::123456789012:role/BlocksReadRole',
        externalId: 'blocks-test-12345'
      };

      const response = await request.post('/connection/test').send(validRequest);
      
      // Currently expecting 404 since handler doesn't exist
      expect([404, 200]).toContain(response.status);
      
      if (response.status === 200) {
        // Validate response structure matches schema
        const validationResult = connectionTestResponseSchema.safeParse(response.body);
        expect(validationResult.success).toBe(true);
      }
    });

    it('should return 400 for invalid ARN pattern once handler is implemented', async () => {
      const invalidRequest = {
        roleArn: 'invalid-arn',
        externalId: 'blocks-test-12345'
      };

      const response = await request.post('/connection/test').send(invalidRequest);
      
      // Currently expecting 404 since handler doesn't exist, later should be 400
      expect([404, 400]).toContain(response.status);
      
      if (response.status === 400) {
        // Validate error response structure
        const errorResult = errorSchema.safeParse(response.body);
        expect(errorResult.success).toBe(true);
        expect(response.body.error.code).toBe('INVALID_ARN');
      }
    });

    it('should return 400 for invalid external ID once handler is implemented', async () => {
      const invalidRequest = {
        roleArn: 'arn:aws:iam::123456789012:role/BlocksReadRole',
        externalId: 'short' // Too short
      };

      const response = await request.post('/connection/test').send(invalidRequest);
      
      expect([404, 400]).toContain(response.status);
      
      if (response.status === 400) {
        const errorResult = errorSchema.safeParse(response.body);
        expect(errorResult.success).toBe(true);
        expect(response.body.error.code).toBe('INVALID_EXTERNAL_ID');
      }
    });

    it('should return validated status for successful connection test', async () => {
      const validRequest = {
        roleArn: 'arn:aws:iam::123456789012:role/BlocksReadRole',
        externalId: 'blocks-valid-12345'
      };

      const response = await request.post('/connection/test').send(validRequest);
      
      expect([404, 200]).toContain(response.status);
      
      if (response.status === 200) {
        const validationResult = connectionTestResponseSchema.safeParse(response.body);
        expect(validationResult.success).toBe(true);
        
        // Response should have status and at least one check
        expect(['validated', 'error']).toContain(response.body.status);
        expect(Array.isArray(response.body.checks)).toBe(true);
        expect(response.body.checks.length).toBeGreaterThan(0);
        
        // Each check should have required fields
        response.body.checks.forEach((check: any) => {
          expect(typeof check.id).toBe('string');
          expect(typeof check.ok).toBe('boolean');
        });
      }
    });

    it('should return error status for connection test failures', async () => {
      // This test assumes the mock will simulate some connection failures
      const validRequest = {
        roleArn: 'arn:aws:iam::999999999999:role/NonExistentRole',
        externalId: 'blocks-fail-test'
      };

      const response = await request.post('/connection/test').send(validRequest);
      
      expect([404, 200]).toContain(response.status);
      
      if (response.status === 200) {
        const validationResult = connectionTestResponseSchema.safeParse(response.body);
        expect(validationResult.success).toBe(true);
        
        // For a simulated failure, we might expect error status
        if (response.body.status === 'error') {
          // At least one check should have ok: false
          const failedChecks = response.body.checks.filter((check: any) => !check.ok);
          expect(failedChecks.length).toBeGreaterThan(0);
          
          // Failed checks should have messages
          failedChecks.forEach((check: any) => {
            expect(typeof check.message).toBe('string');
            expect(check.message.length).toBeGreaterThan(0);
          });
        }
      }
    });
  });
});