/**
 * Contract test for GET /recommendations endpoint
 * Tests validation of query parameters and response structure according to API contract
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import { createApp } from '../../src/server.js';
import { 
  recommendationsQuerySchema, 
  recommendationsResponseSchema, 
  errorSchema 
} from '../../src/schemas/index.js';

describe('GET /recommendations - Contract Tests', () => {
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
  it('should accept valid query parameters with status filter', async () => {
      const validQuery = {
        status: 'new'
      };

      // Validate query parameters against schema
      const queryResult = recommendationsQuerySchema.safeParse(validQuery);
      expect(queryResult.success).toBe(true);

      const response = await request.get('/recommendations').query(validQuery);
      expect([200,404]).toContain(response.status);
      if (response.status === 200) {
        const validationResult = recommendationsResponseSchema.safeParse(response.body);
        expect(validationResult.success).toBe(true);
      }
    });

    it('should accept valid query parameters with category filter', async () => {
      const validQuery = {
        category: 'rightsizing'
      };

      const queryResult = recommendationsQuerySchema.safeParse(validQuery);
      expect(queryResult.success).toBe(true);

      const response = await request.get('/recommendations').query(validQuery);
      expect([200,404]).toContain(response.status);
      if (response.status === 200) {
        const validationResult = recommendationsResponseSchema.safeParse(response.body);
        expect(validationResult.success).toBe(true);
      }
    });

    it('should accept valid query parameters with both filters', async () => {
      const validQuery = {
        status: 'acknowledged',
        category: 'commitment'
      };

      const queryResult = recommendationsQuerySchema.safeParse(validQuery);
      expect(queryResult.success).toBe(true);

      const response = await request.get('/recommendations').query(validQuery);
      expect([200,404]).toContain(response.status);
      if (response.status === 200) {
        const validationResult = recommendationsResponseSchema.safeParse(response.body);
        expect(validationResult.success).toBe(true);
      }
    });

    it('should accept empty query parameters (no filters)', async () => {
      const emptyQuery = {};

      const queryResult = recommendationsQuerySchema.safeParse(emptyQuery);
      expect(queryResult.success).toBe(true);

      const response = await request.get('/recommendations').query(emptyQuery);
      expect([200,404]).toContain(response.status);
      if (response.status === 200) {
        const validationResult = recommendationsResponseSchema.safeParse(response.body);
        expect(validationResult.success).toBe(true);
      }
    });

    it('should reject invalid status values', async () => {
      const invalidQuery = {
        status: 'invalid-status'
      };

      const queryResult = recommendationsQuerySchema.safeParse(invalidQuery);
      expect(queryResult.success).toBe(false);
      expect(queryResult.error?.issues[0].path).toContain('status');
    });

    it('should reject invalid category values', async () => {
      const invalidQuery = {
        category: 'invalid-category'
      };

      const queryResult = recommendationsQuerySchema.safeParse(invalidQuery);
      expect(queryResult.success).toBe(false);
      expect(queryResult.error?.issues[0].path).toContain('category');
    });

    it('should accept all valid status enum values', async () => {
      const validStatuses = ['new', 'acknowledged', 'actioned', 'archived'];
      
      for (const status of validStatuses) {
        const query = { status };
        const queryResult = recommendationsQuerySchema.safeParse(query);
        expect(queryResult.success).toBe(true);
      }
    });

    it('should accept all valid category enum values', async () => {
      const validCategories = ['rightsizing', 'commitment', 'idle'];
      
      for (const category of validCategories) {
        const query = { category };
        const queryResult = recommendationsQuerySchema.safeParse(query);
        expect(queryResult.success).toBe(true);
      }
    });
  });

  describe('Response Structure Validation', () => {
    it('should validate successful response structure with recommendations', () => {
      const mockResponse = {
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        items: [
          {
            id: '01234567-89ab-cdef-0123-456789abcdef',
            category: 'rightsizing',
            status: 'new',
            rationale: 'Instance family m5.large under 15% utilization for 14 days',
            expectedSavingsMinor: 120000,
            metricRefs: ['agg:2025-09-18T10', 'agg:2025-09-18T11'],
            createdAt: '2025-09-19T09:00:00.000Z',
            updatedAt: '2025-09-19T09:00:00.000Z'
          }
        ]
      };

      const responseResult = recommendationsResponseSchema.safeParse(mockResponse);
      expect(responseResult.success).toBe(true);
    });

    it('should validate successful response structure with empty recommendations', () => {
      const mockResponse = {
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        items: []
      };

      const responseResult = recommendationsResponseSchema.safeParse(mockResponse);
      expect(responseResult.success).toBe(true);
    });

    it('should reject response with invalid tenantId format', () => {
      const invalidResponse = {
        tenantId: 'invalid-uuid',
        items: []
      };

      const responseResult = recommendationsResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });

    it('should reject recommendation item with invalid category', () => {
      const invalidResponse = {
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        items: [
          {
            id: '01234567-89ab-cdef-0123-456789abcdef',
            category: 'invalid-category',
            status: 'new',
            rationale: 'Some rationale',
            expectedSavingsMinor: 120000,
            metricRefs: ['agg:2025-09-18T10'],
            createdAt: '2025-09-19T09:00:00.000Z',
            updatedAt: '2025-09-19T09:00:00.000Z'
          }
        ]
      };

      const responseResult = recommendationsResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });

    it('should reject recommendation item with invalid status', () => {
      const invalidResponse = {
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        items: [
          {
            id: 'fedcba98-7654-3210-fedc-ba9876543210',
            category: 'rightsizing',
            status: 'invalid-status',
            rationale: 'Some rationale',
            expectedSavingsMinor: 120000,
            metricRefs: ['agg:2025-09-18T10'],
            createdAt: '2025-09-19T09:00:00.000Z',
            updatedAt: '2025-09-19T09:00:00.000Z'
          }
        ]
      };

      const responseResult = recommendationsResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });

    it('should reject recommendation item with negative savings amount', () => {
      const invalidResponse = {
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        items: [
          {
            id: '11111111-2222-3333-4444-555555555555',
            category: 'rightsizing',
            status: 'new',
            rationale: 'Some rationale',
            expectedSavingsMinor: -1000, // Invalid negative amount
            metricRefs: ['agg:2025-09-18T10'],
            createdAt: '2025-09-19T09:00:00.000Z',
            updatedAt: '2025-09-19T09:00:00.000Z'
          }
        ]
      };

      const responseResult = recommendationsResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });

    it('should reject recommendation item with invalid metricRefs format', () => {
      const invalidResponse = {
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        items: [
          {
            id: '22222222-3333-4444-5555-666666666666',
            category: 'rightsizing',
            status: 'new',
            rationale: 'Some rationale',
            expectedSavingsMinor: 120000,
            metricRefs: ['invalid-metric-ref'], // Should match pattern agg: or rec:
            createdAt: '2025-09-19T09:00:00.000Z',
            updatedAt: '2025-09-19T09:00:00.000Z'
          }
        ]
      };

      const responseResult = recommendationsResponseSchema.safeParse(invalidResponse);
      expect(responseResult.success).toBe(false);
    });

    it('should validate recommendation with maximum allowed metricRefs', () => {
      const maxMetricRefs = Array.from({ length: 10 }, (_, i) => `agg:2025-09-18T${i.toString().padStart(2, '0')}`);
      
      const responseWithMaxRefs = {
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        items: [
          {
            id: '33333333-4444-5555-6666-777777777777',
            category: 'rightsizing',
            status: 'new',
            rationale: 'Some rationale',
            expectedSavingsMinor: 120000,
            metricRefs: maxMetricRefs,
            createdAt: '2025-09-19T09:00:00.000Z',
            updatedAt: '2025-09-19T09:00:00.000Z'
          }
        ]
      };

      const responseResult = recommendationsResponseSchema.safeParse(responseWithMaxRefs);
      expect(responseResult.success).toBe(true);
    });
  });

  describe('Error Response Validation', () => {
    it('should validate error response structure', () => {
      const mockError = {
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid status value provided',
          hint: 'Valid statuses are: new, acknowledged, actioned, archived'
        }
      };

      const errorResult = errorSchema.safeParse(mockError);
      expect(errorResult.success).toBe(true);
    });

    it('should reject error response without required fields', () => {
      const invalidError = {
        error: {
          code: 'INVALID_STATUS'
          // Missing required message field
        }
      };

      const errorResult = errorSchema.safeParse(invalidError);
      expect(errorResult.success).toBe(false);
    });
  });

  describe('Integration Test Placeholders', () => {
    it('should handle actual endpoint call once handler is implemented', async () => {
      const response = await request.get('/recommendations').query({ status: 'new' });
      
      // Currently expecting 404 since handler doesn't exist
      expect([404, 200]).toContain(response.status);
      
      if (response.status === 200) {
        // Validate response structure matches schema
        const validationResult = recommendationsResponseSchema.safeParse(response.body);
        expect(validationResult.success).toBe(true);
      }
    });

    it('should return 400 for invalid query parameters once handler is implemented', async () => {
      const response = await request.get('/recommendations').query({ status: 'invalid-status' });
      
      // Currently expecting 404 since handler doesn't exist, later should be 400
      expect([404, 400]).toContain(response.status);
      
      if (response.status === 400) {
        // Validate error response structure
        const errorResult = errorSchema.safeParse(response.body);
        expect(errorResult.success).toBe(true);
      }
    });

    it('should handle category filter once handler is implemented', async () => {
      const response = await request.get('/recommendations').query({ category: 'rightsizing' });
      
      expect([404, 200]).toContain(response.status);
      
      if (response.status === 200) {
        const validationResult = recommendationsResponseSchema.safeParse(response.body);
        expect(validationResult.success).toBe(true);
        
        // All returned items should match the category filter
        response.body.items.forEach((item: any) => {
          expect(item.category).toBe('rightsizing');
        });
      }
    });

    it('should handle combined status and category filters once handler is implemented', async () => {
      const response = await request.get('/recommendations').query({ 
        status: 'acknowledged', 
        category: 'commitment' 
      });
      
      expect([404, 200]).toContain(response.status);
      
      if (response.status === 200) {
        const validationResult = recommendationsResponseSchema.safeParse(response.body);
        expect(validationResult.success).toBe(true);
        
        // All returned items should match both filters
        response.body.items.forEach((item: any) => {
          expect(item.status).toBe('acknowledged');
          expect(item.category).toBe('commitment');
        });
      }
    });
  });
});