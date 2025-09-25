/**
 * Unit Tests: Seed Utility
 * 
 * Tests the deterministic pseudo-random number generation utility
 * as specified in FR-008: Data Generation Determinism
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDailySeed, createDailyRandom, createSeededRandom } from '../../src/lib/mock/seed';

describe('SeededRandom (via createSeededRandom)', () => {
  it('should generate same sequence for same seed', () => {
    const seed = 12345;
    const rng1 = createSeededRandom(seed);
    const rng2 = createSeededRandom(seed);
    
    // Generate 10 numbers from each
    const sequence1 = Array.from({ length: 10 }, () => rng1.next());
    const sequence2 = Array.from({ length: 10 }, () => rng2.next());
    
    expect(sequence1).toEqual(sequence2);
  });

  it('should generate different sequences for different seeds', () => {
    const rng1 = createSeededRandom(12345);
    const rng2 = createSeededRandom(54321);
    
    const sequence1 = Array.from({ length: 10 }, () => rng1.next());
    const sequence2 = Array.from({ length: 10 }, () => rng2.next());
    
    expect(sequence1).not.toEqual(sequence2);
  });

  it('should generate numbers between 0 and 1', () => {
    const rng = createSeededRandom(12345);
    
    for (let i = 0; i < 100; i++) {
      const num = rng.next();
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThan(1);
    }
  });

  it('should support integer generation in range', () => {
    const rng = createSeededRandom(12345);
    
    for (let i = 0; i < 100; i++) {
      const num = rng.nextInt(1, 11); // 1-10 inclusive
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(10);
      expect(Number.isInteger(num)).toBe(true);
    }
  });

  it('should support float generation in range', () => {
    const rng = createSeededRandom(12345);
    
    for (let i = 0; i < 100; i++) {
      const num = rng.nextFloat(1.0, 10.0);
      expect(num).toBeGreaterThanOrEqual(1.0);
      expect(num).toBeLessThan(10.0);
    }
  });
});

describe('getDailySeed', () => {
  beforeEach(() => {
    // Reset any date mocks
    vi.useRealTimers();
  });

  it('should return same seed for same date', () => {
    const mockDate = new Date('2024-01-15T10:30:00Z');
    vi.setSystemTime(mockDate);
    
    const seed1 = getDailySeed();
    const seed2 = getDailySeed();
    
    expect(seed1).toBe(seed2);
  });

  it('should return different seeds for different dates', () => {
    const date1 = new Date('2024-01-15T10:30:00Z');
    const date2 = new Date('2024-01-16T10:30:00Z');
    
    vi.setSystemTime(date1);
    const seed1 = getDailySeed();
    
    vi.setSystemTime(date2);
    const seed2 = getDailySeed();
    
    expect(seed1).not.toBe(seed2);
  });

  it('should return same seed regardless of time of day', () => {
    const morning = new Date('2024-01-15T08:00:00Z');
    const evening = new Date('2024-01-15T20:00:00Z');
    
    vi.setSystemTime(morning);
    const seedMorning = getDailySeed();
    
    vi.setSystemTime(evening);
    const seedEvening = getDailySeed();
    
    expect(seedMorning).toBe(seedEvening);
  });

  it('should accept override date parameter', () => {
    const currentDate = new Date('2024-01-15');
    const overrideDate = new Date('2024-02-20');
    
    const seedCurrent = getDailySeed(currentDate);
    const seedOverride = getDailySeed(overrideDate);
    
    expect(seedCurrent).not.toBe(seedOverride);
  });

  it('should handle invalid date by throwing error', () => {
    const invalidDate = new Date('invalid-date');
    
    // Invalid date should throw according to actual implementation
    expect(() => getDailySeed(invalidDate)).toThrow();
  });
});

describe('createDailyRandom', () => {
  it('should create RNG with daily seed', () => {
    const mockDate = new Date('2024-01-15T10:30:00Z');
    vi.setSystemTime(mockDate);
    
    const rng1 = createDailyRandom();
    const rng2 = createDailyRandom();
    
    // Should produce same first value since using same date
    expect(rng1.next()).toBe(rng2.next());
  });

  it('should accept date parameter', () => {
    const date1 = new Date('2024-01-15');
    const date2 = new Date('2024-01-16');
    
    const rng1 = createDailyRandom(date1);
    const rng2 = createDailyRandom(date2);
    
    // Should produce different values for different dates
    expect(rng1.next()).not.toBe(rng2.next());
  });
});

// Integration test to verify all components work together
describe('Seed Utility Integration', () => {
  it('should provide deterministic mock data generation workflow', () => {
    const testDate = new Date('2024-01-15');
    
    // Get seed for specific date
    const seed = getDailySeed(testDate);
    
    // Create RNG with that seed
    const rng = createSeededRandom(seed);
    
    // Generate some mock data
    const mockRecommendations = Array.from({ length: 5 }, (_, i) => ({
      id: `rec-${i}`,
      priority: rng.nextInt(1, 4), // 1-3 inclusive
      category: (['Performance', 'Cost', 'Security', 'Compliance'])[rng.nextInt(0, 4)],
      estimatedSavings: rng.nextInt(100, 10001), // 100-10000 inclusive
    }));
    
    // Generate again with same date - should be identical
    const seed2 = getDailySeed(testDate);
    const rng2 = createSeededRandom(seed2);
    
    const mockRecommendations2 = Array.from({ length: 5 }, (_, i) => ({
      id: `rec-${i}`,
      priority: rng2.nextInt(1, 4),
      category: (['Performance', 'Cost', 'Security', 'Compliance'])[rng2.nextInt(0, 4)],
      estimatedSavings: rng2.nextInt(100, 10001),
    }));
    
    expect(mockRecommendations).toEqual(mockRecommendations2);
  });

  it('should work with createDailyRandom for consistency', () => {
    const testDate = new Date('2024-01-15');
    
    const rng1 = createDailyRandom(testDate);
    const rng2 = createDailyRandom(testDate);
    
    const sequence1 = Array.from({ length: 10 }, () => rng1.next());
    const sequence2 = Array.from({ length: 10 }, () => rng2.next());
    
    expect(sequence1).toEqual(sequence2);
  });
});