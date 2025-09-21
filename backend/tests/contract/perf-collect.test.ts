/**
 * Contract test for POST /perf/collect endpoint
 * Tests validation of request body and response structure according to API contract
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import { createApp } from '../../src/server.js';
import { 
  perfCollectRequestSchema, 
  perfCollectResponseSchema, 
  errorSchema 
} from '../../src/schemas/index.js';

describe('POST /perf/collect - Contract Tests', () => {
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
    it('should accept valid performance data', async () => {
      const validPayload = {
        sessionId: 'test-session-123',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
        markers: [
          {
            name: 'webvital:FCP',
            value: 1200.5,
            timestamp: Date.now(),
            url: '/dashboard',
            userAgent: 'Mozilla/5.0 test',
            connectionType: '4g'
          },
          {
            name: 'timing:api-fetch',
            value: 145.2,
            timestamp: Date.now()
          }
        ],
        metadata: {
          browser: 'chrome',
          version: '90.0'
        }
      };

      // Validate against schema
      expect(() => perfCollectRequestSchema.parse(validPayload)).not.toThrow();

      const response = await request
        .post('/api/perf/collect')
        .send(validPayload)
        .expect(200);

      // Validate response schema
      expect(() => perfCollectResponseSchema.parse(response.body)).not.toThrow();
      
      expect(response.body).toMatchObject({
        success: true,
        processed: 2,
        sessionId: 'test-session-123'
      });
    });

    it('should accept minimal valid payload', async () => {
      const minimalPayload = {
        sessionId: 'minimal-session',
        markers: [
          {
            name: 'test-marker',
            value: 100,
            timestamp: Date.now()
          }
        ]
      };

      // Validate against schema
      expect(() => perfCollectRequestSchema.parse(minimalPayload)).not.toThrow();

      const response = await request
        .post('/api/perf/collect')
        .send(minimalPayload)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        processed: 1,
        sessionId: 'minimal-session'
      });
    });

    it('should reject invalid sessionId', async () => {
      const invalidPayload = {
        sessionId: '', // Empty sessionId
        markers: [
          {
            name: 'test-marker',
            value: 100,
            timestamp: Date.now()
          }
        ]
      };

      // Should fail schema validation
      expect(() => perfCollectRequestSchema.parse(invalidPayload)).toThrow();

      const response = await request
        .post('/api/perf/collect')
        .send(invalidPayload)
        .expect(400);

      // Validate error response
      expect(() => errorSchema.parse(response.body)).not.toThrow();
      expect(response.body.error.code).toBe('PERF_COLLECTION_FAILED');
    });

    it('should reject empty markers array', async () => {
      const invalidPayload = {
        sessionId: 'test-session',
        markers: [] // Empty markers array
      };

      // Should fail schema validation
      expect(() => perfCollectRequestSchema.parse(invalidPayload)).toThrow();

      const response = await request
        .post('/api/perf/collect')
        .send(invalidPayload)
        .expect(400);

      expect(response.body.error.code).toBe('PERF_COLLECTION_FAILED');
    });

    it('should reject invalid marker values', async () => {
      const invalidPayload = {
        sessionId: 'test-session',
        markers: [
          {
            name: 'test-marker',
            value: -100, // Negative value
            timestamp: Date.now()
          }
        ]
      };

      // Should fail schema validation
      expect(() => perfCollectRequestSchema.parse(invalidPayload)).toThrow();

      const response = await request
        .post('/api/perf/collect')
        .send(invalidPayload)
        .expect(400);

      expect(response.body.error.code).toBe('PERF_COLLECTION_FAILED');
    });

    it('should reject too many markers', async () => {
      const markers = Array.from({ length: 51 }, (_, i) => ({
        name: `marker-${i}`,
        value: i * 10,
        timestamp: Date.now()
      }));

      const invalidPayload = {
        sessionId: 'test-session',
        markers
      };

      // Should fail schema validation (max 50 markers)
      expect(() => perfCollectRequestSchema.parse(invalidPayload)).toThrow();

      const response = await request
        .post('/api/perf/collect')
        .send(invalidPayload)
        .expect(400);

      expect(response.body.error.code).toBe('PERF_COLLECTION_FAILED');
    });

    it('should reject invalid UUID for tenantId', async () => {
      const invalidPayload = {
        sessionId: 'test-session',
        tenantId: 'not-a-uuid',
        markers: [
          {
            name: 'test-marker',
            value: 100,
            timestamp: Date.now()
          }
        ]
      };

      // Should fail schema validation
      expect(() => perfCollectRequestSchema.parse(invalidPayload)).toThrow();

      const response = await request
        .post('/api/perf/collect')
        .send(invalidPayload)
        .expect(400);

      expect(response.body.error.code).toBe('PERF_COLLECTION_FAILED');
    });

    it('should accept valid UUID for tenantId', async () => {
      const validPayload = {
        sessionId: 'test-session',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
        markers: [
          {
            name: 'test-marker',
            value: 100,
            timestamp: Date.now()
          }
        ]
      };

      // Should pass schema validation
      expect(() => perfCollectRequestSchema.parse(validPayload)).not.toThrow();

      const response = await request
        .post('/api/perf/collect')
        .send(validPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Performance Threshold Validation', () => {
    it('should log warnings for web vitals exceeding thresholds', async () => {
      const payloadWithPoorVitals = {
        sessionId: 'threshold-test',
        markers: [
          {
            name: 'webvital:LCP',
            value: 3000, // Exceeds 2500ms threshold
            timestamp: Date.now(),
            url: '/dashboard'
          },
          {
            name: 'webvital:FID',
            value: 150, // Exceeds 100ms threshold
            timestamp: Date.now()
          },
          {
            name: 'webvital:CLS',
            value: 0.2, // Exceeds 0.1 threshold
            timestamp: Date.now()
          }
        ]
      };

      const response = await request
        .post('/api/perf/collect')
        .send(payloadWithPoorVitals)
        .expect(200);

      // Should still succeed but log warnings internally
      expect(response.body).toMatchObject({
        success: true,
        processed: 3,
        sessionId: 'threshold-test'
      });
    });
  });
});