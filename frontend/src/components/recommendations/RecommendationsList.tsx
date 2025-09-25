/**
 * RecommendationsList Component
 *
 * Container component that displays a list of recommendation cards
 * with proper accessibility and keyboard navigation.
 */

import React from 'react';
import type { RecommendationStub } from '@blocks/shared';
import RecommendationCard from './RecommendationCard';

interface RecommendationsListProps {
  recommendations: RecommendationStub[];
  onActivate?: (id: string) => void;
  loading?: boolean;
}

export default function RecommendationsList({
  recommendations,
  onActivate,
  loading = false,
}: RecommendationsListProps) {
  if (loading) {
    return (
      <section
        aria-label='Loading recommendations'
        className='space-y-6'
        aria-live='polite'
        aria-busy='true'
      >
        {/* Loading skeletons */}
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={`skeleton-${index}`}
            className='bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-pulse'
            aria-hidden='true'
          >
            <div className='flex items-start justify-between mb-3'>
              <div className='flex gap-2'>
                <div className='h-5 w-20 bg-gray-200 rounded-full'></div>
                <div className='h-5 w-16 bg-gray-200 rounded-full'></div>
              </div>
            </div>
            <div className='h-6 w-3/4 bg-gray-200 rounded mb-2'></div>
            <div className='space-y-2 mb-4'>
              <div className='h-4 w-full bg-gray-200 rounded'></div>
              <div className='h-4 w-5/6 bg-gray-200 rounded'></div>
            </div>
            <div className='flex justify-end'>
              <div className='h-9 w-20 bg-gray-200 rounded-md'></div>
            </div>
          </div>
        ))}
      </section>
    );
  }

  if (recommendations.length === 0) {
    return (
      <section
        aria-label='No recommendations available'
        className='text-center py-12'
      >
        <div className='text-gray-500'>
          <svg
            className='mx-auto h-12 w-12 text-gray-400 mb-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
            />
          </svg>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No recommendations available
          </h3>
          <p className='text-sm text-gray-500'>
            Check back later for optimization suggestions.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label={`${recommendations.length} recommendations available`}
      className='space-y-6'
    >
      <div className='sr-only' aria-live='polite'>
        {recommendations.length} recommendations loaded
      </div>

      {recommendations.map((recommendation, _index) => (
        <RecommendationCard
          key={recommendation.id}
          recommendation={recommendation}
          {...(onActivate && { onActivate })}
        />
      ))}
    </section>
  );
}
