/**
 * Skeletons Component
 *
 * Loading skeleton components for recommendations and timelines
 * with proper accessibility support.
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
}

/**
 * Generic skeleton base component
 */
function SkeletonBase({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden='true'
    />
  );
}

/**
 * Skeleton for recommendation cards
 */
export function RecommendationCardSkeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${className}`}
      role='status'
      aria-label='Loading recommendation'
    >
      {/* Badges skeleton */}
      <div className='flex items-start justify-between mb-3'>
        <div className='flex gap-2'>
          <SkeletonBase className='h-5 w-20 rounded-full' />
          <SkeletonBase className='h-5 w-16 rounded-full' />
          <SkeletonBase className='h-5 w-12 rounded-full' />
        </div>
      </div>

      {/* Title skeleton */}
      <SkeletonBase className='h-6 w-3/4 mb-2' />

      {/* Description skeleton */}
      <div className='space-y-2 mb-4'>
        <SkeletonBase className='h-4 w-full' />
        <SkeletonBase className='h-4 w-5/6' />
        <SkeletonBase className='h-4 w-2/3' />
      </div>

      {/* Rationale preview skeleton */}
      <div className='mb-4 p-3 bg-gray-50 rounded-md'>
        <SkeletonBase className='h-3 w-24 mb-1' />
        <SkeletonBase className='h-4 w-4/5' />
      </div>

      {/* CTA skeleton */}
      <div className='flex justify-end'>
        <SkeletonBase className='h-9 w-20 rounded-md' />
      </div>

      <span className='sr-only'>Loading recommendation data...</span>
    </div>
  );
}

/**
 * Skeleton for timeline blocks
 */
export function TimelineBlockSkeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${className}`}
      role='status'
      aria-label='Loading timeline data'
    >
      {/* Header skeleton */}
      <div className='flex items-center justify-between mb-4'>
        <SkeletonBase className='h-6 w-48' />
        <div className='flex gap-2'>
          <SkeletonBase className='h-5 w-24 rounded-full' />
          <SkeletonBase className='h-5 w-16 rounded-full' />
        </div>
      </div>

      {/* Chart area skeleton */}
      <div className='bg-gray-50 rounded-lg p-4 mb-3'>
        <SkeletonBase className='h-40 w-full rounded-lg' />
        <div className='mt-2 flex justify-between'>
          <SkeletonBase className='h-3 w-16' />
          <SkeletonBase className='h-3 w-20' />
          <SkeletonBase className='h-3 w-12' />
        </div>
      </div>

      {/* Disclaimer skeleton */}
      <div className='p-2 bg-yellow-50 border border-yellow-200 rounded-md'>
        <div className='flex items-start'>
          <SkeletonBase className='h-4 w-4 mt-0.5 mr-2 rounded-full' />
          <div className='flex-1'>
            <SkeletonBase className='h-3 w-full mb-1' />
            <SkeletonBase className='h-3 w-3/4' />
          </div>
        </div>
      </div>

      <span className='sr-only'>Loading timeline chart...</span>
    </div>
  );
}

/**
 * Skeleton for multiple recommendation cards
 */
export function RecommendationsListSkeleton({
  count = 5,
  className = '',
}: SkeletonProps & { count?: number }) {
  return (
    <div
      className={`space-y-6 ${className}`}
      role='status'
      aria-label={`Loading ${count} recommendations`}
    >
      {Array.from({ length: count }, (_, index) => (
        <RecommendationCardSkeleton key={`rec-skeleton-${index}`} />
      ))}
      <span className='sr-only'>Loading recommendations list...</span>
    </div>
  );
}

/**
 * Skeleton for multiple timeline blocks
 */
export function TimelinesPanelSkeleton({
  count = 3,
  className = '',
}: SkeletonProps & { count?: number }) {
  return (
    <div
      className={`space-y-6 ${className}`}
      role='status'
      aria-label={`Loading ${count} timeline charts`}
    >
      {Array.from({ length: count }, (_, index) => (
        <TimelineBlockSkeleton key={`timeline-skeleton-${index}`} />
      ))}
      <span className='sr-only'>Loading timeline data...</span>
    </div>
  );
}

/**
 * Skeleton for CTA panel
 */
export function ActivationCtaSkeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 ${className}`}
      role='status'
      aria-label='Loading activation panel'
    >
      <div className='flex items-start space-x-4'>
        {/* Icon skeleton */}
        <SkeletonBase className='h-12 w-12 rounded-md' />

        {/* Content skeleton */}
        <div className='flex-1'>
          <SkeletonBase className='h-6 w-64 mb-2' />
          <div className='space-y-2 mb-4'>
            <SkeletonBase className='h-4 w-full' />
            <SkeletonBase className='h-4 w-5/6' />
          </div>

          {/* Benefits list skeleton */}
          <div className='space-y-1 mb-6'>
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className='flex items-center'>
                <SkeletonBase className='h-4 w-4 mr-2 rounded-full' />
                <SkeletonBase className='h-4 w-48' />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA button skeleton */}
      <div className='flex justify-end'>
        <SkeletonBase className='h-12 w-40 rounded-md' />
      </div>

      <span className='sr-only'>Loading activation options...</span>
    </div>
  );
}
