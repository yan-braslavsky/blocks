/**
 * Custom hook for daily seed management
 *
 * Provides deterministic seed management with daily rollover
 * and testing overrides.
 */

import { useMemo } from 'react';
import {
  getDailySeed,
  createDailyRandom,
  createSeededRandom,
} from '../lib/mock/seed';

interface UseDailySeedOptions {
  /** Override seed for testing purposes */
  testSeed?: number;
  /** Custom date for seed generation */
  date?: Date;
}

/**
 * Hook that provides deterministic daily seed and random generator
 */
export function useDailySeed(options: UseDailySeedOptions = {}) {
  const { testSeed, date = new Date() } = options;

  const seed = useMemo(() => {
    if (testSeed !== undefined) {
      return testSeed;
    }
    return getDailySeed(date);
  }, [testSeed, date]);

  const random = useMemo(() => {
    if (testSeed !== undefined) {
      return createSeededRandom(testSeed);
    }
    return createDailyRandom(date);
  }, [testSeed, date]);

  return {
    seed,
    random,
    isTestMode: testSeed !== undefined,
  };
}
