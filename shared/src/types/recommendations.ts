/**
 * Shared types for Enhanced Recommendations & Mock Dashboard
 * These types support the evaluation mode with mock data and future real implementations
 */

export type ImpactLevel = 'Low' | 'Medium' | 'High';
export type RecommendationStatus = 'Prototype' | 'ComingSoon' | 'Future';
export type MetricType = 'Spend' | 'Performance' | 'Projection' | 'Other';
export type ActivationStateType = 'Mock' | 'Active';

/**
 * Recommendation stub for evaluation mode
 * Contains metadata for display and future enhancement
 */
export interface RecommendationStub {
  /** Stable slug identifier used for de-duplication */
  id: string;
  /** Display name for the recommendation */
  title: string;
  /** Brief summary in plain text */
  shortDescription: string;
  /** Relative potential impact level */
  impactLevel: ImpactLevel;
  /** Availability stage for badge styling */
  status: RecommendationStatus;
  /** Optional grouping for future filtering */
  category?: string;
  /** Ordering hint (fallback to alphabetical) */
  displayOrder?: number;
  /** Teaser for future explainability features */
  rationalePreview?: string;
}

/**
 * Data point for timeline visualization
 */
export interface TimelineDataPoint {
  /** Unix timestamp in milliseconds */
  timestamp: number;
  /** Metric value at this point in time */
  value: number;
}

/**
 * Timeline block for mock dashboard visualization
 */
export interface TimelineBlock {
  /** Unique block identifier */
  id: string;
  /** Display label for the timeline */
  title: string;
  /** Conceptual metric type for categorization */
  metricType: MetricType;
  /** Human readable time range description */
  timeRange: string;
  /** Array of daily values for visualization */
  dataPoints: TimelineDataPoint[];
  /** Whether to show disclaimer overlay */
  disclaimerFlag: boolean;
}

/**
 * Conceptual placeholder for activation state
 * Currently unused but reserved for future real enablement
 */
export interface ActivationState {
  /** Current module state */
  state: ActivationStateType;
  /** Epoch milliseconds of last state change */
  lastTransition?: number;
}

/**
 * Response type for recommendations API
 */
export interface RecommendationsResponse {
  recommendations: RecommendationStub[];
}

/**
 * Response type for timelines API
 */
export interface TimelinesResponse {
  blocks: TimelineBlock[];
}