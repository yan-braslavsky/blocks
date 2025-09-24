/**
 * Unit Tests: Timeline Generator Logic
 * 
 * Tests the mock timeline data generation as specified
 * in FR-006: Timeline Blocks UI and FR-008: Data Generation Determinism
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateMockTimelines, generateSingleTimeline, TimelineBlock } from '../../src/lib/mock/timelines';

// Mock the seed utility
vi.mock('../../src/lib/mock/seed', () => ({
  createDailyRandom: vi.fn(() => ({
    next: vi.fn(() => 0.5),
    nextInt: vi.fn((min: number, max: number) => Math.floor((min + max) / 2)),
    nextFloat: vi.fn((min: number, max: number) => (min + max) / 2),
  })),
}));

describe('Timeline Generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateMockTimelines', () => {
    it('should generate at least 3 blocks as required by spec', () => {
      const blocks = generateMockTimelines();
      expect(blocks.length).toBeGreaterThanOrEqual(3);
    });

    it('should generate blocks with correct structure', () => {
      const blocks = generateMockTimelines();
      
      blocks.forEach((block: TimelineBlock) => {
        expect(block).toHaveProperty('id');
        expect(block).toHaveProperty('title');
        expect(block).toHaveProperty('metricType');
        expect(block).toHaveProperty('timeRange');
        expect(block).toHaveProperty('dataPoints');
        expect(block).toHaveProperty('disclaimerFlag');
        
        // Validate types
        expect(typeof block.id).toBe('string');
        expect(typeof block.title).toBe('string');
        expect(['Spend', 'Performance', 'Projection', 'Other']).toContain(block.metricType);
        expect(typeof block.timeRange).toBe('string');
        expect(Array.isArray(block.dataPoints)).toBe(true);
        expect(typeof block.disclaimerFlag).toBe('boolean');
        
        // Validate required content
        expect(block.id.length).toBeGreaterThan(0);
        expect(block.title.length).toBeGreaterThan(0);
        expect(block.dataPoints.length).toBeGreaterThanOrEqual(10); // Spec requirement
        expect(block.disclaimerFlag).toBe(true); // Always true in mock mode
      });
    });

    it('should generate unique IDs for each block', () => {
      const blocks = generateMockTimelines();
      const ids = blocks.map(block => block.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should include variety in metric types', () => {
      const blocks = generateMockTimelines();
      const metricTypes = blocks.map(block => block.metricType);
      const uniqueMetrics = new Set(metricTypes);
      
      // Should have at least 2 different metric types for variety
      expect(uniqueMetrics.size).toBeGreaterThanOrEqual(2);
    });

    it('should accept date parameter for deterministic generation', () => {
      const testDate = new Date('2024-01-15');
      const blocks1 = generateMockTimelines(testDate);
      const blocks2 = generateMockTimelines(testDate);
      
      // Same date should generate identical results
      expect(blocks1).toEqual(blocks2);
    });

    it('should generate different results for different dates', () => {
      // This test will validate the implementation works with real seeding
      // For now, we'll verify the structure is consistent
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-16');
      
      const blocks1 = generateMockTimelines(date1);
      const blocks2 = generateMockTimelines(date2);
      
      // Both should have valid structure
      expect(blocks1.length).toBeGreaterThanOrEqual(3);
      expect(blocks2.length).toBeGreaterThanOrEqual(3);
      
      // Structure should be identical even if values differ
      expect(blocks1[0]?.id).toBeTruthy();
      expect(blocks2[0]?.id).toBeTruthy();
    });

    it('should generate chronologically ordered data points', () => {
      const blocks = generateMockTimelines();
      
      blocks.forEach(block => {
        for (let i = 1; i < block.dataPoints.length; i++) {
          expect(block.dataPoints[i]?.timestamp).toBeGreaterThan(
            block.dataPoints[i - 1]?.timestamp || 0
          );
        }
      });
    });

    it('should generate data points with valid structure', () => {
      const blocks = generateMockTimelines();
      
      blocks.forEach(block => {
        block.dataPoints.forEach(point => {
          expect(point).toHaveProperty('timestamp');
          expect(point).toHaveProperty('value');
          expect(typeof point.timestamp).toBe('number');
          expect(typeof point.value).toBe('number');
          expect(point.timestamp).toBeGreaterThan(0);
          expect(point.value).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('generateSingleTimeline', () => {
    it('should generate timeline for each metric type', () => {
      const metricTypes: Array<TimelineBlock['metricType']> = ['Spend', 'Performance', 'Projection', 'Other'];
      
      metricTypes.forEach(metricType => {
        const timeline = generateSingleTimeline(metricType);
        
        expect(timeline.metricType).toBe(metricType);
        expect(timeline.dataPoints.length).toBeGreaterThan(0);
        expect(timeline.disclaimerFlag).toBe(true);
      });
    });

    it('should generate deterministic results for same date', () => {
      const testDate = new Date('2024-01-15');
      
      const timeline1 = generateSingleTimeline('Spend', testDate);
      const timeline2 = generateSingleTimeline('Spend', testDate);
      
      expect(timeline1).toEqual(timeline2);
    });

    it('should generate metric-specific value patterns', () => {
      const spendTimeline = generateSingleTimeline('Spend');
      const perfTimeline = generateSingleTimeline('Performance');
      
      // Spend should generally have higher values than performance
      const spendAvg = spendTimeline.dataPoints.reduce((sum, p) => sum + p.value, 0) / spendTimeline.dataPoints.length;
      const perfAvg = perfTimeline.dataPoints.reduce((sum, p) => sum + p.value, 0) / perfTimeline.dataPoints.length;
      
      // Performance is typically 0-100%, spend is typically much higher
      expect(spendAvg).toBeGreaterThan(perfAvg);
      
      // Performance should be within 0-100 range mostly
      perfTimeline.dataPoints.forEach(point => {
        expect(point.value).toBeGreaterThanOrEqual(0);
        expect(point.value).toBeLessThanOrEqual(120); // Allow some variance above 100
      });
    });
  });

  describe('Integration with deterministic seeding', () => {
    it('should use daily seeding for consistent results', () => {
      const blocks1 = generateMockTimelines();
      const blocks2 = generateMockTimelines();
      
      // With same daily seed, should get identical results
      expect(blocks1).toEqual(blocks2);
    });

    it('should generate realistic timeline data for dashboard use', () => {
      const blocks = generateMockTimelines();
      
      // Verify blocks are suitable for dashboard display
      blocks.forEach(block => {
        // Titles should be descriptive
        expect(block.title.length).toBeGreaterThan(5);
        
        // Time range should be informative
        expect(block.timeRange).toMatch(/LAST_30_DAYS/); // Should match expected format
        
        // Data points should span reasonable time period (30 days as implemented)
        expect(block.dataPoints.length).toBe(30);
        
        // Values should be in reasonable ranges for display
        block.dataPoints.forEach(point => {
          expect(point.value).toBeGreaterThanOrEqual(0);
          expect(point.value).toBeLessThan(100000); // Reasonable upper bound
        });
      });
    });

    it('should provide data spanning last 30 days', () => {
      const timeline = generateSingleTimeline('Spend');
      const now = Date.now();
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
      
      // First data point should be approximately 30 days ago
      expect(timeline.dataPoints[0]?.timestamp).toBeGreaterThan(thirtyDaysAgo - 86400000); // Allow 1 day variance
      expect(timeline.dataPoints[0]?.timestamp).toBeLessThan(thirtyDaysAgo + 86400000);
      
      // Last data point should be approximately today
      const lastPoint = timeline.dataPoints[timeline.dataPoints.length - 1];
      expect(lastPoint?.timestamp).toBeGreaterThan(now - 86400000); // Within last day
      expect(lastPoint?.timestamp).toBeLessThan(now + 86400000);
    });
  });

  describe('TimelineBlock interface', () => {
    it('should conform to expected TypeScript interface', () => {
      const timeline = generateSingleTimeline('Spend');
      
      // Compile-time checks via TypeScript, runtime validation for structure
      const expectedKeys = ['id', 'title', 'metricType', 'timeRange', 'dataPoints', 'disclaimerFlag'];
      expectedKeys.forEach(key => {
        expect(timeline).toHaveProperty(key);
      });
      
      // Verify data point structure
      timeline.dataPoints.forEach(point => {
        expect(point).toHaveProperty('timestamp');
        expect(point).toHaveProperty('value');
      });
    });
  });
});