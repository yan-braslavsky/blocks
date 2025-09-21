/**
 * Contract test for GET /export endpoint
 * Tests validation of query parameters and CSV response according to API contract
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import { createApp } from '../../src/server.js';
import { 
  exportQuerySchema,
  errorSchema 
} from '../../src/schemas/index.js';

describe('GET /export - Contract Tests', () => {
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
        type: 'spending' as const,
        format: 'csv' as const
      };

      // Validate query parameters against schema
      const queryResult = exportQuerySchema.safeParse(validQuery);
      expect(queryResult.success).toBe(true);
      if (queryResult.success) {
        expect(queryResult.data.type).toBe('spending');
        expect(queryResult.data.format).toBe('csv');
      }
    });

    it('should apply default values for optional parameters', async () => {
      const minimalQuery = {};

      const queryResult = exportQuerySchema.safeParse(minimalQuery);
      expect(queryResult.success).toBe(true);
      if (queryResult.success) {
        expect(queryResult.data.type).toBe('full');
        expect(queryResult.data.format).toBe('csv');
      }
    });

    it('should accept all valid export types', async () => {
      const validTypes = ['spending', 'recommendations', 'full'];
      
      for (const type of validTypes) {
        const query = { type };
        const queryResult = exportQuerySchema.safeParse(query);
        expect(queryResult.success).toBe(true);
        if (queryResult.success) {
          expect(queryResult.data.type).toBe(type);
        }
      }
    });

    it('should reject invalid export types', async () => {
      const invalidQuery = {
        type: 'invalid_type'
      };

      const queryResult = exportQuerySchema.safeParse(invalidQuery);
      expect(queryResult.success).toBe(false);
    });

    it('should accept optional date range parameters', async () => {
      const queryWithDateRange = {
        type: 'spending' as const,
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31'
        }
      };

      const queryResult = exportQuerySchema.safeParse(queryWithDateRange);
      expect(queryResult.success).toBe(true);
      if (queryResult.success) {
        expect(queryResult.data.dateRange?.start).toBe('2024-01-01');
        expect(queryResult.data.dateRange?.end).toBe('2024-01-31');
      }
    });
  });

  describe('Endpoint Response Tests', () => {
    it('should return CSV data for spending export', async () => {
      const response = await request
        .get('/export')
        .query({ type: 'spending' })
        .expect(200);

      // Check CSV content type
      expect(response.headers['content-type']).toBe('text/csv');
      expect(response.headers['content-disposition']).toMatch(/attachment; filename="spending-export-\d{4}-\d{2}-\d{2}\.csv"/);
      
      // Check CSV structure
      const csvContent = response.text;
      const lines = csvContent.split('\n');
      expect(lines.length).toBeGreaterThan(1); // Should have headers + data
      
      // Check headers
      const headers = lines[0];
      expect(headers).toContain('Service');
      expect(headers).toContain('Current Month ($)');
      expect(headers).toContain('Previous Month ($)');
    });

    it('should return CSV data for recommendations export', async () => {
      const response = await request
        .get('/export')
        .query({ type: 'recommendations' })
        .expect(200);

      // Check CSV content type
      expect(response.headers['content-type']).toBe('text/csv');
      expect(response.headers['content-disposition']).toMatch(/attachment; filename="recommendations-export-\d{4}-\d{2}-\d{2}\.csv"/);
      
      // Check CSV structure
      const csvContent = response.text;
      const lines = csvContent.split('\n');
      expect(lines.length).toBeGreaterThan(1); // Should have headers + data
      
      // Check headers
      const headers = lines[0];
      expect(headers).toContain('Title');
      expect(headers).toContain('Impact');
      expect(headers).toContain('Potential Savings ($)');
    });

    it('should return combined CSV data for full export', async () => {
      const response = await request
        .get('/export')
        .query({ type: 'full' })
        .expect(200);

      // Check CSV content type
      expect(response.headers['content-type']).toBe('text/csv');
      expect(response.headers['content-disposition']).toMatch(/attachment; filename="full-export-\d{4}-\d{2}-\d{2}\.csv"/);
      
      // Check CSV structure
      const csvContent = response.text;
      expect(csvContent).toContain('SPENDING DATA');
      expect(csvContent).toContain('RECOMMENDATIONS DATA');
    });

    it('should use default type when no query parameters provided', async () => {
      const response = await request
        .get('/export')
        .expect(200);

      // Should default to full export
      expect(response.headers['content-disposition']).toMatch(/attachment; filename="full-export-\d{4}-\d{2}-\d{2}\.csv"/);
    });

    it('should handle CSV field escaping correctly', async () => {
      const response = await request
        .get('/export')
        .query({ type: 'spending' })
        .expect(200);

      const csvContent = response.text;
      // CSV should be properly formatted
      expect(csvContent).toMatch(/^[^,\n]+(?:,[^,\n]*)*\n/); // Valid CSV header line
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid export type', async () => {
      const response = await request
        .get('/export')
        .query({ type: 'invalid_type' })
        .expect(400);

      // Should validate against error schema
      const errorResult = errorSchema.safeParse(response.body);
      expect(errorResult.success).toBe(true);
    });
  });

  describe('Response Headers', () => {
    it('should set appropriate caching headers', async () => {
      const response = await request
        .get('/export')
        .query({ type: 'spending' })
        .expect(200);

      expect(response.headers['cache-control']).toBe('no-cache');
    });

    it('should set correct content type for CSV', async () => {
      const response = await request
        .get('/export')
        .query({ type: 'spending' })
        .expect(200);

      expect(response.headers['content-type']).toBe('text/csv');
    });
  });
});