/**
 * Recommendations Dashboard Page
 *
 * Main dashboard page displaying enhanced recommendations and mock timeline data
 * in evaluation mode with proper accessibility and loading states.
 */

'use client';

import React, { useState, useEffect } from 'react';
import type { RecommendationStub, TimelineBlock } from '@blocks/shared';
import { generateMockRecommendations } from '../../../lib/mock/recommendations';
import { generateMockTimelines } from '../../../lib/mock/timelines';
import { useDailySeed } from '../../../hooks/useDailySeed';
import RecommendationsList from '../../../components/recommendations/RecommendationsList';
import TimelinesPanel from '../../../components/recommendations/TimelinesPanel';
import ActivationCta from '../../../components/recommendations/ActivationCta';
import MockDisclaimer from '../../../components/recommendations/MockDisclaimer';
import {
  RecommendationsListSkeleton,
  TimelinesPanelSkeleton,
  ActivationCtaSkeleton,
} from '../../../components/recommendations/Skeletons';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<RecommendationStub[]>(
    []
  );
  const [timelines, setTimelines] = useState<TimelineBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use daily seed hook for deterministic mock data
  const { isTestMode: _isTestMode } = useDailySeed();

  useEffect(() => {
    // Simulate loading time for realistic experience
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Performance marker start
        const perfStart = performance.now();

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Generate mock data
        const mockRecommendations = generateMockRecommendations();
        const mockTimelines = generateMockTimelines();

        setRecommendations(mockRecommendations);
        setTimelines(mockTimelines);

        // Performance marker end
        const perfEnd = performance.now();
        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[Dashboard] Data loading completed in ${(perfEnd - perfStart).toFixed(2)}ms`
          );
        }
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRecommendationActivate = (id: string) => {
    // In evaluation mode, this just logs the action
    console.log('Recommendation activation attempted:', id);
  };

  const handleActivationAttempt = () => {
    // In evaluation mode, this just logs the action
    console.log('Feature activation attempted');
  };

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4'>
            <svg
              className='h-6 w-6 text-red-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h1 className='text-lg font-medium text-gray-900 mb-2'>
            Unable to Load Dashboard
          </h1>
          <p className='text-sm text-gray-600 mb-4'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='py-6'>
            <div className='relative'>
              <h1 className='text-2xl font-bold text-gray-900'>
                Cost Optimization Dashboard
              </h1>
              <p className='mt-1 text-sm text-gray-600'>
                Discover opportunities to optimize your cloud infrastructure
                costs
              </p>

              {/* Evaluation mode banner */}
              <MockDisclaimer type='banner' className='mt-4' />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='space-y-8'>
          {/* Activation CTA */}
          <section aria-labelledby='activation-heading'>
            <h2 id='activation-heading' className='sr-only'>
              Enable recommendations
            </h2>
            {loading ? (
              <ActivationCtaSkeleton />
            ) : (
              <ActivationCta onActivationAttempt={handleActivationAttempt} />
            )}
          </section>

          {/* Timeline Visualizations */}
          <section aria-labelledby='timelines-heading'>
            <h2
              id='timelines-heading'
              className='text-lg font-medium text-gray-900 mb-4'
            >
              Cost & Performance Trends
            </h2>
            {loading ? (
              <TimelinesPanelSkeleton />
            ) : (
              <TimelinesPanel timelines={timelines} />
            )}
          </section>

          {/* Recommendations */}
          <section aria-labelledby='recommendations-heading'>
            <h2
              id='recommendations-heading'
              className='text-lg font-medium text-gray-900 mb-4'
            >
              Optimization Recommendations
            </h2>
            {loading ? (
              <RecommendationsListSkeleton />
            ) : (
              <RecommendationsList
                recommendations={recommendations}
                onActivate={handleRecommendationActivate}
              />
            )}
          </section>

          {/* Footer disclaimer */}
          <MockDisclaimer type='subtle' />
        </div>
      </main>
    </div>
  );
}
