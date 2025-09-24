/**
 * Mock Data Seed Utility
 * 
 * Provides deterministic pseudo-random number generation based on date
 * to ensure consistent mock data within a 24-hour window while allowing
 * variation across days for evaluation progression feel.
 */

/**
 * Simple hash function to convert string to number
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Pseudo-random number generator using Linear Congruential Generator
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Generate next pseudo-random number between 0 and 1
   */
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  /**
   * Generate pseudo-random integer between min and max (exclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Generate pseudo-random float between min and max
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }
}

/**
 * Get deterministic seed based on current date (YYYY-MM-DD format)
 * This ensures consistent data within a day but variation across days
 */
export function getDailySeed(date: Date = new Date()): number {
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
  if (!dateString) {
    throw new Error('Invalid date provided to getDailySeed');
  }
  return simpleHash(dateString);
}

/**
 * Create a seeded random number generator for the current day
 */
export function createDailyRandom(date: Date = new Date()): SeededRandom {
  const seed = getDailySeed(date);
  return new SeededRandom(seed);
}

/**
 * Override seed for testing purposes
 * This allows tests to use a fixed seed for predictable results
 */
export function createSeededRandom(seed: number): SeededRandom {
  return new SeededRandom(seed);
}