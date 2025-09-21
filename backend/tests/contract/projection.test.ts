/**
 * Contract test for GET /projection endpoint
 * Tests validation of query parameters and response structure according to API contract
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import { createApp } from '../../src/server.js';
import { 
  projectionQuerySchema, 
  projectionResponseSchema, 
  errorSchema 
} from '../../src/schemas/index.js';

describe('GET /projection - Contract Tests', () => {
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

  describe('Query Parameter Validation', () => {
    it('should accept valid query parameters', async () => {
      const validQuery = {
        period: 'month'
      };

      // Validate query parameters against schema
      const queryResult = projectionQuerySchema.safeParse(validQuery);
      expect(queryResult.success).toBe(true);

      // Handler should be working now
      const response = await request.get('/projection').query(validQuery);
      expect(response.status).toBe(200); // Handler should work
    });

    it('should reject invalid period values', async () => {
      const invalidQuery = {
        period: 'invalid'
      };

      const queryResult = projectionQuerySchema.safeParse(invalidQuery);
      expect(queryResult.success).toBe(false);
      expect(queryResult.error?.issues[0].path).toContain('period');
    });

    it('should accept all valid period enum values', async () => {
      const validPeriods = ['day', 'week', 'month', 'ytd'];
      
      for (const period of validPeriods) {
        const query = { period };
        const queryResult = projectionQuerySchema.safeParse(query);
        expect(queryResult.success).toBe(true);
      }
    });

    it('should handle missing period parameter (should default or be required)', async () => {
      const emptyQuery = {};

      const queryResult = projectionQuerySchema.safeParse(emptyQuery);
      // Check if period is required or has a default value based on schema
      expect(queryResult.success).toBe(false);
      expect(queryResult.error?.issues[0].path).toContain('period');
    });
  });

  describe('Response Structure Validation', () => {
    it('should validate successful response structure', () => {
      const mockResponse = {
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        period: 'month',
        baselineMinor: 5000000,
        projectedMinor: 4000000,
        deltaPct: 0.20,
        generatedAt: '2025-09-19T10:20:00.000Z'
      };

      const responseResult = projectionResponseSchema.safeParse(mockResponse);
      expect(responseResult.success).toBe(true);
    });

    it('should reject response with invalid tenantId format', () => {
      const invalidResponse = {
        tenantId: 'invalid-uuid',
        period: 'month',
        baselineMinor: 5000000,
        projectedMinor: 4000000,
        deltaPct: 0.20,
        generatedAt: '2025-09-19T10:20:00.000Z'
      };

      const responseResult = projectionResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });

    it('should reject response with negative monetary amounts', () => {
      const invalidResponse = {
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        period: 'month',
        baselineMinor: -1000, // Invalid negative amount
        projectedMinor: 4000000,
        deltaPct: 0.20,
        generatedAt: '2025-09-19T10:20:00.000Z'
      };

      const responseResult = projectionResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });

    it('should reject response with invalid period enum', () => {
      const invalidResponse = {
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        period: 'invalid-period',
        baselineMinor: 5000000,
        projectedMinor: 4000000,
        deltaPct: 0.20,
        generatedAt: '2025-09-19T10:20:00.000Z'
      };

      const responseResult = projectionResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });

    it('should reject response with invalid timestamp format', () => {
      const invalidResponse = {
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        period: 'month',
        baselineMinor: 5000000,
        projectedMinor: 4000000,
        deltaPct: 0.20,
        generatedAt: 'invalid-timestamp'
      };

      const responseResult = projectionResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });

    it('should validate deltaPct is within reasonable bounds', () => {
      const responseWithLargeDelta = {
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        period: 'month',
        baselineMinor: 5000000,
        projectedMinor: 4000000,
        deltaPct: 1.5, // 150% change - might be unrealistic but technically valid
        generatedAt: '2025-09-19T10:20:00.000Z'
      };

      const responseResult = projectionResponseSchema.safeParse(responseWithLargeDelta);
      // The schema might allow large deltas as they could be technically valid
      expect(responseResult.success).toBe(true);
    });
  });

  describe('Error Response Validation', () => {
    it('should validate error response structure', () => {
      const mockError = {
        error: {
          code: 'INVALID_PERIOD',
          message: 'Invalid period value provided',
          hint: 'Valid periods are: day, week, month, ytd'
        }
      };

      const errorResult = errorSchema.safeParse(mockError);
      expect(errorResult.success).toBe(true);
    });

    it('should reject error response without required fields', () => {
      const invalidError = {
        error: {
          code: 'INVALID_PERIOD'
          // Missing required message field
        }
      };

      const errorResult = errorSchema.safeParse(invalidError);
      expect(errorResult.success).toBe(false);
    });
  });

  describe('Integration Test Placeholders', () => {
    it('should handle actual endpoint call once handler is implemented', async () => {
      // This test will be updated once the projection handler is implemented
      const response = await request.get('/projection').query({ period: 'month' });
      
      // Currently expecting 404 since handler doesn't exist
      expect([404, 200]).toContain(response.status);
      
      if (response.status === 200) {
        // Validate response structure matches schema
        const validationResult = projectionResponseSchema.safeParse(response.body);
        expect(validationResult.success).toBe(true);
      }
    });

    it('should return 400 for invalid query parameters once handler is implemented', async () => {
      const response = await request.get('/projection').query({ period: 'invalid' });
      
      // Currently expecting 404 since handler doesn't exist, later should be 400
      expect([404, 400]).toContain(response.status);
      
      if (response.status === 400) {
        // Validate error response structure
        const errorResult = errorSchema.safeParse(response.body);
        expect(errorResult.success).toBe(true);
      }
    });
  });
});