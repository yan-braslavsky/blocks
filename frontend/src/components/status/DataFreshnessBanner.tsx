'use client';

import React from 'react';

interface DataFreshnessBannerProps {
  lastIngestAt?: string | undefined;
  className?: string;
}

const STALE_THRESHOLD_HOURS = 6; // Data older than 6 hours is considered stale
const WARNING_THRESHOLD_HOURS = 3; // Data older than 3 hours shows warning

export function DataFreshnessBanner({
  lastIngestAt,
  className = '',
}: DataFreshnessBannerProps) {
  if (!lastIngestAt) {
    return (
      <div
        className={`bg-gray-50 border border-gray-200 rounded-md p-4 ${className}`}
      >
        <div className='flex'>
          <div className='flex-shrink-0'>
            <svg
              className='h-5 w-5 text-gray-400'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-gray-800'>
              No Data Available
            </h3>
            <p className='mt-1 text-sm text-gray-600'>
              Data ingestion has not been completed yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const lastIngest = new Date(lastIngestAt);
  const now = new Date();
  const hoursAgo = (now.getTime() - lastIngest.getTime()) / (1000 * 60 * 60);

  // Determine status and styling
  let status: 'fresh' | 'warning' | 'stale';
  let statusIcon: React.ReactNode;

  if (hoursAgo < WARNING_THRESHOLD_HOURS) {
    status = 'fresh';
    statusIcon = (
      <svg
        className='h-5 w-5 text-green-400'
        viewBox='0 0 20 20'
        fill='currentColor'
      >
        <path
          fillRule='evenodd'
          d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
          clipRule='evenodd'
        />
      </svg>
    );
  } else if (hoursAgo < STALE_THRESHOLD_HOURS) {
    status = 'warning';
    statusIcon = (
      <svg
        className='h-5 w-5 text-yellow-400'
        viewBox='0 0 20 20'
        fill='currentColor'
      >
        <path
          fillRule='evenodd'
          d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
          clipRule='evenodd'
        />
      </svg>
    );
  } else {
    status = 'stale';
    statusIcon = (
      <svg
        className='h-5 w-5 text-red-400'
        viewBox='0 0 20 20'
        fill='currentColor'
      >
        <path
          fillRule='evenodd'
          d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
          clipRule='evenodd'
        />
      </svg>
    );
  }

  const formatTimeAgo = (hours: number): string => {
    if (hours < 1) {
      const minutes = Math.floor(hours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }

    const roundedHours = Math.floor(hours);
    if (roundedHours < 24) {
      return `${roundedHours} hour${roundedHours !== 1 ? 's' : ''} ago`;
    }

    const days = Math.floor(roundedHours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  const getMessage = (): { title: string; description: string } => {
    switch (status) {
      case 'fresh':
        return {
          title: 'Data is Current',
          description: `Last updated ${formatTimeAgo(hoursAgo)}`,
        };
      case 'warning':
        return {
          title: 'Data May Be Outdated',
          description: `Last updated ${formatTimeAgo(hoursAgo)}. Consider refreshing if needed.`,
        };
      case 'stale':
        return {
          title: 'Data is Stale',
          description: `Last updated ${formatTimeAgo(hoursAgo)}. Please check your data ingestion.`,
        };
    }
  };

  const { title, description } = getMessage();

  // Don't show banner for fresh data unless explicitly requested
  if (status === 'fresh') {
    return null;
  }

  const bgColor = status === 'warning' ? 'bg-yellow-50' : 'bg-red-50';
  const borderColor =
    status === 'warning' ? 'border-yellow-200' : 'border-red-200';
  const textColor = status === 'warning' ? 'text-yellow-800' : 'text-red-800';
  const descriptionColor =
    status === 'warning' ? 'text-yellow-700' : 'text-red-700';

  return (
    <div
      className={`${bgColor} border ${borderColor} rounded-md p-4 ${className}`}
    >
      <div className='flex'>
        <div className='flex-shrink-0'>{statusIcon}</div>
        <div className='ml-3'>
          <h3 className={`text-sm font-medium ${textColor}`}>{title}</h3>
          <p className={`mt-1 text-sm ${descriptionColor}`}>{description}</p>
        </div>
      </div>
    </div>
  );
}
