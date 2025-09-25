/**
 * Contract Test: GET /api/mock/recommendations
 * 
 * Tests the mock recommendations endpoint contract according to the spec
 * in specs/002-enhance-recommendations-with/contracts/recommendations.mock.contract.md
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import { createApp } from '../../src/server.js';
import { z } from 'zod';

// Schema definition based on the contract specification
const RecommendationStubSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  shortDescription: z.string().min(1),
  impactLevel: z.enum(['Low', 'Medium', 'High']),
  status: z.enum(['Prototype', 'ComingSoon', 'Future']),
  category: z.string().optional(),
  displayOrder: z.number().optional(),
  rationalePreview: z.string().optional(),
});

const RecommendationsResponseSchema = z.object({
  recommendations: z.array(RecommendationStubSchema).min(5), // Must have at least 5 as per spec
});

describe('GET /api/mock/recommendations - Contract Test', () => {
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
  
  it('should return recommendations list with correct schema', async () => {
    // This will fail since the endpoint doesn't exist yet
    const response = await request
      .get('/api/mock/recommendations')
      .expect(200);

    // Validate response schema
    const validationResult = RecommendationsResponseSchema.safeParse(response.body);
    
    expect(validationResult.success).toBe(true);
    
    if (validationResult.success) {
      const { recommendations } = validationResult.data;
      
      // Additional contract requirements
      expect(recommendations.length).toBeGreaterThanOrEqual(5);
      
      // Check for unique IDs (de-duplication requirement)
      const ids = recommendations.map(r => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
      
      // Verify all required fields are present
      recommendations.forEach(rec => {
        expect(rec.id).toBeTruthy();
        expect(rec.title).toBeTruthy();
        expect(rec.shortDescription).toBeTruthy();
        expect(['Low', 'Medium', 'High']).toContain(rec.impactLevel);
        expect(['Prototype', 'ComingSoon', 'Future']).toContain(rec.status);
      });
    }
  });

  it('should handle errors gracefully with fallback', async () => {
    // Test error case - should return empty array as per contract
    // This test will also fail until endpoint is implemented
    
    // Simulate error condition (this might be hard to test, but we'll try)
    const response = await request
      .get('/api/mock/recommendations?simulateError=true')
      .expect('Content-Type', /json/);
    
    // Should still return valid structure even on error
    const validationResult = z.object({
      recommendations: z.array(RecommendationStubSchema)
    }).safeParse(response.body);
    
    expect(validationResult.success).toBe(true);
  });

  it('should return deterministic data for same day', async () => {
    // Test deterministic behavior - same day should return same data
    const response1 = await request
      .get('/api/mock/recommendations')
      .expect(200);
    
    const response2 = await request
      .get('/api/mock/recommendations')
      .expect(200);
    
    // Same day should return identical data
    expect(response1.body).toEqual(response2.body);
  });
});

// Export schema for reuse in other tests
export { RecommendationStubSchema, RecommendationsResponseSchema };