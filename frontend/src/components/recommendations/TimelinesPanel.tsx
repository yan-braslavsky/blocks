/**
 * TimelinesPanel Component
 *
 * Container component that displays multiple timeline blocks
 * with proper accessibility and disclaimer support.
 */

import React from 'react';
import type { TimelineBlock } from '@blocks/shared';
import TimelineChart from './TimelineChart';

interface TimelinesPanelProps {
  timelines: TimelineBlock[];
  loading?: boolean;
}

export default function TimelinesPanel({
  timelines,
  loading = false,
}: TimelinesPanelProps) {
  if (loading) {
    return (
      <section
        aria-label='Loading timeline data'
        className='space-y-6'
        aria-live='polite'
        aria-busy='true'
      >
        {/* Loading skeletons */}
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={`timeline-skeleton-${index}`}
            className='bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-pulse'
            aria-hidden='true'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='h-6 w-48 bg-gray-200 rounded'></div>
              <div className='h-4 w-24 bg-gray-200 rounded-full'></div>
            </div>
            <div className='h-40 bg-gray-200 rounded-lg mb-2'></div>
            <div className='h-3 w-32 bg-gray-200 rounded'></div>
          </div>
        ))}
      </section>
    );
  }

  if (timelines.length === 0) {
    return (
      <section
        aria-label='No timeline data available'
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
              d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
            />
          </svg>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No timeline data available
          </h3>
          <p className='text-sm text-gray-500'>
            Timeline visualizations will appear here when data is available.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label={`${timelines.length} timeline visualizations`}
      className='space-y-6'
    >
      <div className='sr-only' aria-live='polite'>
        {timelines.length} timeline blocks loaded
      </div>

      {timelines.map(timeline => (
        <div
          key={timeline.id}
          data-testid='timeline-block'
          className='bg-white border border-gray-200 rounded-lg p-6 shadow-sm'
        >
          {/* Header */}
          <div className='flex items-center justify-between mb-4'>
            <h3
              data-testid='timeline-title'
              className='text-lg font-semibold text-gray-900'
            >
              {timeline.title}
            </h3>
            <div className='flex items-center gap-2'>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200'>
                {timeline.timeRange.replace(/_/g, ' ').toLowerCase()}
              </span>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200'>
                {timeline.metricType}
              </span>
            </div>
          </div>

          {/* Chart */}
          <TimelineChart
            dataPoints={timeline.dataPoints}
            title={timeline.title}
            metricType={timeline.metricType}
            className='mb-3'
          />

          {/* Disclaimer */}
          {timeline.disclaimerFlag && (
            <div
              className='mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md'
              data-testid='mock-disclaimer'
              role='note'
              aria-label='Data disclaimer'
            >
              <div className='flex items-start'>
                <svg
                  className='flex-shrink-0 h-4 w-4 text-yellow-600 mt-0.5 mr-2'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
                <p className='text-xs text-yellow-800'>
                  <strong>Evaluation Mode:</strong> This data is illustrative
                  and generated for demonstration purposes only. Not based on
                  actual account metrics.
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
