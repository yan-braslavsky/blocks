/**
 * Contract Test: GET /api/mock/timelines
 * 
 * Tests the mock timelines endpoint contract according to the spec
 * in specs/002-enhance-recommendations-with/contracts/timelines.mock.contract.md
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import { createApp } from '../../src/server.js';
import { z } from 'zod';

// Schema definition based on the contract specification
const DataPointSchema = z.object({
  timestamp: z.number(),
  value: z.number(),
});

const TimelineBlockSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  metricType: z.enum(['Spend', 'Performance', 'Projection', 'Other']),
  timeRange: z.string(),
  dataPoints: z.array(DataPointSchema).min(10), // At least 10 points for visual meaning as per spec
  disclaimerFlag: z.boolean(),
});

const TimelinesResponseSchema = z.object({
  blocks: z.array(TimelineBlockSchema).min(3), // Must have at least 3 blocks as per spec
});

describe('GET /api/mock/timelines - Contract Test', () => {
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

  // Note: These tests will fail until the endpoint is implemented
  // That's expected and correct for TDD approach
  
  it('should return timeline blocks with correct schema', async () => {
    // This will fail since the endpoint doesn't exist yet
    const response = await request
      .get('/api/mock/timelines')
      .expect(200);

    // Validate response schema
    const validationResult = TimelinesResponseSchema.safeParse(response.body);
    
    expect(validationResult.success).toBe(true);
    
    if (validationResult.success) {
      const { blocks } = validationResult.data;
      
      // Additional contract requirements
      expect(blocks.length).toBeGreaterThanOrEqual(3);
      
      // Verify all blocks have valid structure
      blocks.forEach(block => {
        expect(block.id).toBeTruthy();
        expect(block.title).toBeTruthy();
        expect(['Spend', 'Performance', 'Projection', 'Other']).toContain(block.metricType);
        expect(block.timeRange).toBeTruthy();
        expect(block.dataPoints.length).toBeGreaterThanOrEqual(10);
        expect(block.disclaimerFlag).toBe(true); // Always true in mock mode
        
        // Verify data points structure
        block.dataPoints.forEach(point => {
          expect(typeof point.timestamp).toBe('number');
          expect(typeof point.value).toBe('number');
          expect(point.timestamp).toBeGreaterThan(0);
        });
      });
    }
  });

  it('should accept optional range parameter', async () => {
    // Test with default range (should work)
    const response1 = await request
      .get('/api/mock/timelines')
      .expect(200);
    
    // Test with explicit range parameter
    const response2 = await request
      .get('/api/mock/timelines?range=LAST_30_DAYS')
      .expect(200);
    
    // Both should return valid structure
    const validation1 = TimelinesResponseSchema.safeParse(response1.body);
    const validation2 = TimelinesResponseSchema.safeParse(response2.body);
    
    expect(validation1.success).toBe(true);
    expect(validation2.success).toBe(true);
    
    // Should return same data for same range
    expect(response1.body).toEqual(response2.body);
  });

  it('should reject unsupported range values', async () => {
    // Test unsupported range parameter
    const response = await request
      .get('/api/mock/timelines?range=LAST_7_DAYS') // Unsupported
      .expect(400);
    
    // Should return error message
    expect(response.body).toHaveProperty('error');
  });

  it('should handle errors gracefully with fallback', async () => {
    // Test error case - should return empty blocks array as per contract
    // This test will also fail until endpoint is implemented
    
    // Simulate error condition
    const response = await request
      .get('/api/mock/timelines?simulateError=true')
      .expect('Content-Type', /json/);
    
    // Should still return valid structure even on error
    const validationResult = z.object({
      blocks: z.array(TimelineBlockSchema)
    }).safeParse(response.body);
    
    expect(validationResult.success).toBe(true);
  });

  it('should return deterministic data for same day', async () => {
    // Test deterministic behavior - same day should return same data
    const response1 = await request
      .get('/api/mock/timelines')
      .expect(200);
    
    const response2 = await request
      .get('/api/mock/timelines')
      .expect(200);
    
    // Same day should return identical data
    expect(response1.body).toEqual(response2.body);
  });
});

// Export schema for reuse in other tests
export { TimelineBlockSchema, TimelinesResponseSchema, DataPointSchema };