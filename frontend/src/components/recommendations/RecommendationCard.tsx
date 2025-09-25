/**
 * RecommendationCard Component
 *
 * Displays individual recommendation stubs with proper accessibility
 * and visual hierarchy for evaluation mode.
 */

import React from 'react';
import type { RecommendationStub } from '@blocks/shared';

interface RecommendationCardProps {
  recommendation: RecommendationStub;
  onActivate?: (id: string) => void;
}

/**
 * Get badge color classes based on impact level
 */
function getImpactLevelStyles(level: RecommendationStub['impactLevel']) {
  switch (level) {
    case 'High':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get status badge styles
 */
function getStatusStyles(status: RecommendationStub['status']) {
  switch (status) {
    case 'Prototype':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'ComingSoon':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Future':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export default function RecommendationCard({
  recommendation,
  onActivate,
}: RecommendationCardProps) {
  const handleActivate = () => {
    onActivate?.(recommendation.id);
  };

  const impactStyles = getImpactLevelStyles(recommendation.impactLevel);
  const statusStyles = getStatusStyles(recommendation.status);

  return (
    <article
      data-testid='recommendation-stub'
      className='bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow'
      aria-labelledby={`rec-title-${recommendation.id}`}
    >
      {/* Header with badges */}
      <div className='flex items-start justify-between mb-3'>
        <div className='flex flex-wrap gap-2'>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${impactStyles}`}
            aria-label={`Impact level: ${recommendation.impactLevel}`}
          >
            {recommendation.impactLevel} Impact
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles}`}
            aria-label={`Status: ${recommendation.status}`}
          >
            {recommendation.status}
          </span>
          {recommendation.category && (
            <span
              className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200'
              aria-label={`Category: ${recommendation.category}`}
            >
              {recommendation.category}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        id={`rec-title-${recommendation.id}`}
        data-testid='recommendation-title'
        className='text-lg font-semibold text-gray-900 mb-2 line-clamp-2'
      >
        {recommendation.title}
      </h3>

      {/* Description */}
      <p className='text-gray-600 text-sm mb-4 line-clamp-3'>
        {recommendation.shortDescription}
      </p>

      {/* Rationale preview if available */}
      {recommendation.rationalePreview && (
        <div className='mb-4 p-3 bg-gray-50 rounded-md'>
          <p className='text-xs text-gray-500 mb-1'>Preview insight:</p>
          <p className='text-sm text-gray-700 italic'>
            {recommendation.rationalePreview}
          </p>
        </div>
      )}

      {/* CTA Button */}
      <div className='flex justify-end'>
        <button
          data-testid='recommendation-cta'
          onClick={handleActivate}
          className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
          aria-label={`Enable ${recommendation.title} recommendation`}
        >
          Enable
        </button>
      </div>
    </article>
  );
}
