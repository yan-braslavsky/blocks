/**
 * MockDisclaimer Component
 *
 * Watermark/disclaimer component to clearly indicate evaluation mode
 * and prevent misinterpretation of mock data.
 */

import React from 'react';

interface MockDisclaimerProps {
  type?: 'watermark' | 'banner' | 'subtle';
  className?: string;
}

export default function MockDisclaimer({
  type = 'subtle',
  className = '',
}: MockDisclaimerProps) {
  if (type === 'watermark') {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none z-10 ${className}`}
        aria-hidden='true'
      >
        <div className='transform -rotate-45 text-gray-300 text-2xl font-bold opacity-20 select-none'>
          EVALUATION MODE
        </div>
      </div>
    );
  }

  if (type === 'banner') {
    return (
      <div
        className={`bg-yellow-50 border-l-4 border-yellow-400 p-4 ${className}`}
        role='alert'
        aria-label='Evaluation mode notice'
      >
        <div className='flex'>
          <div className='flex-shrink-0'>
            <svg
              className='h-5 w-5 text-yellow-400'
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
          </div>
          <div className='ml-3'>
            <p className='text-sm text-yellow-800'>
              <strong>Evaluation Mode:</strong> All data shown is for
              demonstration purposes only. This is not real account data and
              recommendations are illustrative examples.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default: subtle type
  return (
    <div
      className={`text-xs text-gray-500 border-t border-gray-200 pt-2 mt-4 ${className}`}
      data-testid='mock-disclaimer'
      role='note'
      aria-label='Mock data disclaimer'
    >
      <div className='flex items-center justify-center space-x-2'>
        <svg
          className='h-3 w-3 text-gray-400'
          fill='currentColor'
          viewBox='0 0 20 20'
          aria-hidden='true'
        >
          <path
            fillRule='evenodd'
            d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
            clipRule='evenodd'
          />
        </svg>
        <span>Illustrative mock data - evaluation mode only</span>
      </div>
    </div>
  );
}
