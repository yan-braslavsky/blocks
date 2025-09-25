/**
 * Mock Recommendation Fixtures
 *
 * Provides deterministic mock recommendation data for evaluation mode.
 * Includes de-duplication logic and deterministic ordering.
 */

import { createDailyRandom } from './seed';
import type {
  RecommendationStub,
  RecommendationsResponse,
} from '@blocks/shared';

/**
 * Static recommendation templates for variety
 */
const RECOMMENDATION_TEMPLATES: RecommendationStub[] = [
  {
    id: 'rightsizing-ec2',
    title: 'Rightsize EC2 Instances',
    shortDescription:
      'Identify over-provisioned instances running below optimal capacity',
    impactLevel: 'High',
    status: 'Prototype',
    category: 'cost',
    displayOrder: 1,
    rationalePreview: 'Large instance family with <20% avg utilization',
  },
  {
    id: 'unused-volumes',
    title: 'Remove Unused EBS Volumes',
    shortDescription: 'Clean up unattached storage volumes accumulating costs',
    impactLevel: 'Medium',
    status: 'Prototype',
    category: 'cost',
    displayOrder: 2,
    rationalePreview: 'Detached volumes older than 7 days',
  },
  {
    id: 'reserved-instance-optimization',
    title: 'Reserved Instance Optimization',
    shortDescription: 'Optimize RI coverage and instance family selection',
    impactLevel: 'High',
    status: 'ComingSoon',
    category: 'savings',
    displayOrder: 3,
    rationalePreview: 'Potential 30-60% savings on stable workloads',
  },
  {
    id: 'spot-instance-migration',
    title: 'Spot Instance Migration',
    shortDescription:
      'Migrate suitable workloads to cost-effective spot instances',
    impactLevel: 'Medium',
    status: 'ComingSoon',
    category: 'cost',
    displayOrder: 4,
    rationalePreview: 'Up to 90% savings for fault-tolerant workloads',
  },
  {
    id: 'storage-class-optimization',
    title: 'S3 Storage Class Optimization',
    shortDescription:
      'Transition infrequently accessed data to cheaper storage tiers',
    impactLevel: 'Medium',
    status: 'Prototype',
    category: 'storage',
    displayOrder: 5,
    rationalePreview: 'Objects not accessed in 30+ days',
  },
  {
    id: 'lambda-memory-optimization',
    title: 'Lambda Memory Optimization',
    shortDescription:
      'Right-size Lambda functions for optimal cost-performance ratio',
    impactLevel: 'Low',
    status: 'Future',
    category: 'serverless',
    displayOrder: 6,
    rationalePreview: 'Memory over-provisioning detected',
  },
  {
    id: 'database-rightsizing',
    title: 'RDS Instance Rightsizing',
    shortDescription:
      'Optimize database instance sizes based on actual usage patterns',
    impactLevel: 'High',
    status: 'ComingSoon',
    category: 'database',
    displayOrder: 7,
    rationalePreview: 'CPU utilization consistently below 30%',
  },
  {
    id: 'cloudfront-optimization',
    title: 'CloudFront Cache Optimization',
    shortDescription: 'Improve cache hit ratios and reduce origin requests',
    impactLevel: 'Medium',
    status: 'Future',
    category: 'performance',
    displayOrder: 8,
    rationalePreview: 'Low cache hit ratio affecting costs',
  },
];

/**
 * De-duplicate recommendations by ID, keeping first occurrence
 * Logs duplicates in development mode only
 */
function deduplicateRecommendations(
  recommendations: RecommendationStub[]
): RecommendationStub[] {
  const seen = new Set<string>();
  const deduplicated: RecommendationStub[] = [];
  let duplicateCount = 0;

  for (const rec of recommendations) {
    if (!seen.has(rec.id)) {
      seen.add(rec.id);
      deduplicated.push(rec);
    } else {
      duplicateCount++;
    }
  }

  // Log duplicates in development mode only
  if (duplicateCount > 0 && process.env.NODE_ENV === 'development') {
    console.log(
      `[Mock Recommendations] Removed ${duplicateCount} duplicate recommendation(s)`
    );
  }

  return deduplicated;
}

/**
 * Generate mock recommendations with deterministic ordering
 * Returns at least 5 recommendations as required by spec
 */
export function generateMockRecommendations(
  date: Date = new Date()
): RecommendationStub[] {
  const random = createDailyRandom(date);

  // Always include at least 5 recommendations, but vary the selection daily
  const numRecommendations = Math.max(5, random.nextInt(5, 8));
  const selectedTemplates: RecommendationStub[] = [];

  // Shuffle templates deterministically and select required number
  const shuffledTemplates = [...RECOMMENDATION_TEMPLATES].sort(
    () => random.next() - 0.5
  );

  for (
    let i = 0;
    i < Math.min(numRecommendations, shuffledTemplates.length);
    i++
  ) {
    const template = shuffledTemplates[i];
    if (template) {
      selectedTemplates.push({
        ...template,
        displayOrder: i + 1,
      });
    }
  }

  // Fill remaining slots if needed by cycling through templates
  while (selectedTemplates.length < numRecommendations) {
    const templateIndex =
      selectedTemplates.length % RECOMMENDATION_TEMPLATES.length;
    const template = RECOMMENDATION_TEMPLATES[templateIndex];
    if (template) {
      selectedTemplates.push({
        ...template,
        id: `${template.id}-${selectedTemplates.length}`, // Ensure unique ID
        displayOrder: selectedTemplates.length + 1,
      });
    } else {
      break; // Prevent infinite loop if templates array is empty
    }
  }

  // Apply de-duplication (though it shouldn't be needed with the above logic)
  const deduplicated = deduplicateRecommendations(selectedTemplates);

  // Sort by displayOrder for consistent presentation
  return deduplicated.sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );
}

/**
 * Get mock recommendations in API response format
 */
export function getMockRecommendationsResponse(
  date: Date = new Date()
): RecommendationsResponse {
  return {
    recommendations: generateMockRecommendations(date),
  };
}
