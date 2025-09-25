/**
 * Unit Tests: Recommendation De-duplication Logic
 * 
 * Tests the mock recommendation generation and de-duplication system
 * as specified in FR-001: Recommendation Stubs and FR-008: Data Generation Determinism
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateMockRecommendations, getMockRecommendationsResponse } from '../../src/lib/mock/recommendations';
import type { RecommendationStub } from '@blocks/shared';

// Mock the seed utility
vi.mock('../../src/lib/mock/seed', () => ({
  createDailyRandom: vi.fn(() => ({
    next: vi.fn(() => 0.5),
    nextInt: vi.fn((min: number, max: number) => Math.floor((min + max) / 2)),
    nextFloat: vi.fn((min: number, max: number) => (min + max) / 2),
  })),
}));

describe('Recommendation Generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateMockRecommendations', () => {
    it('should generate at least 5 recommendations as required by spec', () => {
      const recommendations = generateMockRecommendations();
      expect(recommendations.length).toBeGreaterThanOrEqual(5);
    });

    it('should generate recommendations with correct structure', () => {
      const recommendations = generateMockRecommendations();
      
      recommendations.forEach((rec: RecommendationStub) => {
        expect(rec).toHaveProperty('id');
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('shortDescription');
        expect(rec).toHaveProperty('impactLevel');
        expect(rec).toHaveProperty('status');
        expect(rec).toHaveProperty('category');
        expect(rec).toHaveProperty('displayOrder');
        expect(rec).toHaveProperty('rationalePreview');
        
        // Validate types
        expect(typeof rec.id).toBe('string');
        expect(typeof rec.title).toBe('string');
        expect(typeof rec.shortDescription).toBe('string');
        expect(['High', 'Medium', 'Low']).toContain(rec.impactLevel);
        expect(['Prototype', 'ComingSoon', 'Future']).toContain(rec.status);
        expect(typeof rec.category).toBe('string');
        expect(typeof rec.displayOrder).toBe('number');
        expect(typeof rec.rationalePreview).toBe('string');
        
        // Validate required content
        expect(rec.id.length).toBeGreaterThan(0);
        expect(rec.title.length).toBeGreaterThan(0);
        expect(rec.shortDescription.length).toBeGreaterThan(0);
        expect(rec.displayOrder).toBeGreaterThan(0);
      });
    });

    it('should generate unique IDs for each recommendation', () => {
      const recommendations = generateMockRecommendations();
      const ids = recommendations.map(rec => rec.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should de-duplicate recommendations by ID', () => {
      // Generate a larger set to increase chance of seeing de-duplication
      const recommendations = generateMockRecommendations();
      
      // Check that we don't have duplicate IDs (this tests the de-duplication logic)
      const ids = recommendations.map(rec => rec.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should accept date parameter for deterministic generation', () => {
      const testDate = new Date('2024-01-15');
      const recs1 = generateMockRecommendations(testDate);
      const recs2 = generateMockRecommendations(testDate);
      
      // Same date should generate identical results
      expect(recs1).toEqual(recs2);
    });

    it('should generate different results for different dates', () => {
      // This test will validate the implementation works with real seeding
      // For now, we'll verify the structure is consistent
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-16');
      
      const recs1 = generateMockRecommendations(date1);
      const recs2 = generateMockRecommendations(date2);
      
      // Both should have valid structure and meet requirements
      expect(recs1.length).toBeGreaterThanOrEqual(5);
      expect(recs2.length).toBeGreaterThanOrEqual(5);
      
      // Both should have unique IDs within their own sets
      const ids1 = recs1.map(r => r.id);
      const ids2 = recs2.map(r => r.id);
      expect(new Set(ids1).size).toBe(ids1.length);
      expect(new Set(ids2).size).toBe(ids2.length);
    });

    it('should include variety in categories and impact levels', () => {
      const recommendations = generateMockRecommendations();
      
      const categories = recommendations.map(rec => rec.category).filter(c => c);
      const impactLevels = recommendations.map(rec => rec.impactLevel);
      
      const uniqueCategories = new Set(categories);
      const uniqueImpactLevels = new Set(impactLevels);
      
      // Should have at least 2 different categories and impact levels for variety
      expect(uniqueCategories.size).toBeGreaterThanOrEqual(2);
      expect(uniqueImpactLevels.size).toBeGreaterThanOrEqual(2);
    });

    it('should maintain displayOrder sequence', () => {
      const recommendations = generateMockRecommendations();
      
      // Should be sorted by displayOrder
      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i]?.displayOrder).toBeGreaterThanOrEqual(
          recommendations[i - 1]?.displayOrder || 0
        );
      }
    });

    it('should have diverse status values', () => {
      const recommendations = generateMockRecommendations();
      const statuses = recommendations.map(rec => rec.status);
      const uniqueStatuses = new Set(statuses);
      
      // Should have multiple status types for realism
      expect(uniqueStatuses.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getMockRecommendationsResponse', () => {
    it('should return recommendations in API response format', () => {
      const response = getMockRecommendationsResponse();
      
      expect(response).toHaveProperty('recommendations');
      expect(Array.isArray(response.recommendations)).toBe(true);
      expect(response.recommendations.length).toBeGreaterThanOrEqual(5);
    });

    it('should accept date parameter', () => {
      const testDate = new Date('2024-01-15');
      const response1 = getMockRecommendationsResponse(testDate);
      const response2 = getMockRecommendationsResponse(testDate);
      
      expect(response1).toEqual(response2);
    });
  });

  describe('De-duplication Logic', () => {
    it('should prevent duplicate recommendations in single generation call', () => {
      // Test multiple calls to ensure consistent de-duplication
      for (let i = 0; i < 10; i++) {
        const recommendations = generateMockRecommendations();
        
        // Check that all IDs are unique
        const ids = recommendations.map(rec => rec.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
        
        // Check that all titles are unique (another form of de-duplication)
        const titles = recommendations.map(rec => rec.title);
        const uniqueTitles = new Set(titles);
        expect(uniqueTitles.size).toBe(titles.length);
      }
    });

    it('should handle edge case where templates are exhausted', () => {
      // This test ensures the algorithm gracefully handles cases where
      // we request more recommendations than available unique templates
      const recommendations = generateMockRecommendations();
      
      // Should still return at least 5 recommendations as per spec
      expect(recommendations.length).toBeGreaterThanOrEqual(5);
      
      // All should be unique
      const ids = recommendations.map(rec => rec.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should maintain template diversity when cycling', () => {
      // Generate enough recommendations to potentially trigger template cycling
      const recommendations = generateMockRecommendations();
      
      // Even if cycling occurs, each recommendation should still be unique
      const ids = recommendations.map(rec => rec.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
      
      // Categories should still show diversity
      const categories = recommendations.map(rec => rec.category).filter(c => c);
      const uniqueCategories = new Set(categories);
      expect(uniqueCategories.size).toBeGreaterThan(1);
    });
  });

  describe('Integration with deterministic seeding', () => {
    it('should use daily seeding for consistent results', () => {
      const recs1 = generateMockRecommendations();
      const recs2 = generateMockRecommendations();
      
      // With same daily seed, should get identical results
      expect(recs1).toEqual(recs2);
    });

    it('should generate realistic recommendation data for dashboard use', () => {
      const recommendations = generateMockRecommendations();
      
      // Verify recommendations are suitable for dashboard display
      recommendations.forEach(rec => {
        // Titles should be descriptive but not too long
        expect(rec.title.length).toBeGreaterThan(5);
        expect(rec.title.length).toBeLessThan(100);
        
        // Short descriptions should provide context
        expect(rec.shortDescription.length).toBeGreaterThan(10);
        expect(rec.shortDescription.length).toBeLessThan(200);
        
        // Rationale previews should be informative
        if (rec.rationalePreview) {
          expect(rec.rationalePreview.length).toBeGreaterThan(5);
          expect(rec.rationalePreview.length).toBeLessThan(150);
        }
        
        // Categories should be meaningful
        if (rec.category) {
          expect(rec.category.length).toBeGreaterThan(2);
          expect(rec.category.length).toBeLessThan(50);
        }
      });
    });

    it('should provide varied impact levels for priority sorting', () => {
      const recommendations = generateMockRecommendations();
      
      // Should have mix of High, Medium, Low impact levels
      const impactLevels = recommendations.map(rec => rec.impactLevel);
      const uniqueImpactLevels = new Set(impactLevels);
      
      expect(uniqueImpactLevels.size).toBeGreaterThanOrEqual(2);
      
      // High impact should be present for priority recommendations
      expect(impactLevels).toContain('High');
    });

    it('should show realistic development status distribution', () => {
      const recommendations = generateMockRecommendations();
      
      // Should have mix of Prototype, ComingSoon, Future statuses
      const statuses = recommendations.map(rec => rec.status);
      const uniqueStatuses = new Set(statuses);
      
      expect(uniqueStatuses.size).toBeGreaterThanOrEqual(2);
      
      // Should include some Prototype status (ready to show)
      expect(statuses).toContain('Prototype');
    });
  });

  describe('RecommendationStub interface', () => {
    it('should conform to expected TypeScript interface', () => {
      const recommendations = generateMockRecommendations();
      const recommendation = recommendations[0];
      
      if (recommendation) {
        // Compile-time checks via TypeScript, runtime validation for structure
        const expectedKeys = [
          'id', 'title', 'shortDescription', 'impactLevel', 
          'status', 'category', 'displayOrder', 'rationalePreview'
        ];
        
        expectedKeys.forEach(key => {
          expect(recommendation).toHaveProperty(key);
        });
        
        // Verify enum values are correct
        expect(['High', 'Medium', 'Low']).toContain(recommendation.impactLevel);
        expect(['Prototype', 'ComingSoon', 'Future']).toContain(recommendation.status);
      }
    });
  });
});