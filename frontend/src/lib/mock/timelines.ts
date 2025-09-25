/**
 * Mock Timeline Generator
 *
 * Provides deterministic mock timeline data for evaluation mode dashboard.
 * Generates realistic-looking time series data for different metric types.
 */

import { createDailyRandom } from './seed';
import type {
  TimelineBlock,
  TimelineDataPoint,
  TimelinesResponse,
} from '@blocks/shared';

/**
 * Generate realistic timeline data points for the last 30 days
 */
function generateDataPoints(
  metricType: TimelineBlock['metricType'],
  random: ReturnType<typeof createDailyRandom>
): TimelineDataPoint[] {
  const now = new Date();
  const dataPoints: TimelineDataPoint[] = [];

  // Generate 30 days of data points
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() - i);
    date.setUTCHours(0, 0, 0, 0); // Normalize to start of day

    const timestamp = date.getTime();
    let value: number;

    switch (metricType) {
      case 'Spend': {
        // Spending data: $100-2000 range with weekly patterns
        const baseSpend = 500 + random.nextFloat(-200, 800);
        const weeklyMultiplier = Math.sin((i / 7) * Math.PI) * 0.3 + 1;
        value = Math.max(
          100,
          baseSpend * weeklyMultiplier + random.nextFloat(-100, 100)
        );
        break;
      }

      case 'Performance': {
        // Performance data: 0-100% with gradual trends
        const basePerf = 75 + Math.sin((i / 30) * Math.PI * 2) * 15;
        value = Math.max(
          0,
          Math.min(100, basePerf + random.nextFloat(-10, 10))
        );
        break;
      }

      case 'Projection': {
        // Projection data: increasing trend with some volatility
        const baseTrend = 1000 + i * 20; // Increasing trend
        value = Math.max(0, baseTrend + random.nextFloat(-150, 150));
        break;
      }

      case 'Other':
      default: {
        // Generic metric: 0-1000 range with random walk
        const previousValue =
          dataPoints.length > 0
            ? (dataPoints[dataPoints.length - 1]?.value ?? 500)
            : 500;
        const change = random.nextFloat(-50, 50);
        value = Math.max(0, Math.min(1000, previousValue + change));
        break;
      }
    }

    dataPoints.push({
      timestamp,
      value: Math.round(value * 100) / 100, // Round to 2 decimal places
    });
  }

  return dataPoints;
}

/**
 * Timeline block templates with different metric types
 */
const TIMELINE_TEMPLATES: Omit<TimelineBlock, 'dataPoints'>[] = [
  {
    id: 'spend-trend',
    title: 'Daily Spend Trend',
    metricType: 'Spend',
    timeRange: 'LAST_30_DAYS',
    disclaimerFlag: true,
  },
  {
    id: 'performance-overview',
    title: 'Resource Performance',
    metricType: 'Performance',
    timeRange: 'LAST_30_DAYS',
    disclaimerFlag: true,
  },
  {
    id: 'cost-projection',
    title: 'Cost Projection',
    metricType: 'Projection',
    timeRange: 'LAST_30_DAYS',
    disclaimerFlag: true,
  },
  {
    id: 'savings-opportunity',
    title: 'Savings Opportunities',
    metricType: 'Other',
    timeRange: 'LAST_30_DAYS',
    disclaimerFlag: true,
  },
  {
    id: 'efficiency-score',
    title: 'Efficiency Score',
    metricType: 'Performance',
    timeRange: 'LAST_30_DAYS',
    disclaimerFlag: true,
  },
];

/**
 * Generate mock timeline blocks with deterministic data
 * Returns at least 3 blocks as required by spec
 */
export function generateMockTimelines(
  date: Date = new Date()
): TimelineBlock[] {
  const random = createDailyRandom(date);

  // Always include at least 3 timeline blocks, but vary selection daily
  const numBlocks = Math.max(3, random.nextInt(3, 6));
  const selectedTemplates: TimelineBlock[] = [];

  // Shuffle templates deterministically and select required number
  const shuffledTemplates = [...TIMELINE_TEMPLATES].sort(
    () => random.next() - 0.5
  );

  for (let i = 0; i < Math.min(numBlocks, shuffledTemplates.length); i++) {
    const template = shuffledTemplates[i];
    if (template) {
      selectedTemplates.push({
        ...template,
        dataPoints: generateDataPoints(template.metricType, random),
      });
    }
  }

  // Fill remaining slots if needed by cycling through templates
  while (selectedTemplates.length < numBlocks) {
    const templateIndex = selectedTemplates.length % TIMELINE_TEMPLATES.length;
    const template = TIMELINE_TEMPLATES[templateIndex];
    if (template) {
      selectedTemplates.push({
        ...template,
        id: `${template.id}-${selectedTemplates.length}`, // Ensure unique ID
        dataPoints: generateDataPoints(template.metricType, random),
      });
    } else {
      break; // Prevent infinite loop
    }
  }

  return selectedTemplates;
}

/**
 * Get mock timelines in API response format
 */
export function getMockTimelinesResponse(
  date: Date = new Date()
): TimelinesResponse {
  return {
    blocks: generateMockTimelines(date),
  };
}

/**
 * Generate a single timeline block for testing purposes
 */
export function generateSingleTimeline(
  metricType: TimelineBlock['metricType'],
  date: Date = new Date()
): TimelineBlock {
  const random = createDailyRandom(date);
  const template =
    TIMELINE_TEMPLATES.find(t => t.metricType === metricType) ||
    TIMELINE_TEMPLATES[0];

  if (!template) {
    throw new Error('No timeline template available');
  }

  return {
    ...template,
    dataPoints: generateDataPoints(metricType, random),
  };
}
