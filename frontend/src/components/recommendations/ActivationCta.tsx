/**
 * ActivationCta Component
 *
 * Call-to-action panel/modal for enabling the recommendations feature.
 * Shows confirmation dialog without actual state mutation in evaluation mode.
 */

import React, { useState } from 'react';

interface ActivationCtaProps {
  onActivationAttempt?: () => void;
  className?: string;
}

export default function ActivationCta({
  onActivationAttempt,
  className = '',
}: ActivationCtaProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleEnableClick = () => {
    setShowConfirmation(true);
    onActivationAttempt?.();
  };

  const handleConfirm = () => {
    // In evaluation mode, we don't actually enable anything
    // Just show a message and close the modal
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      {/* Main CTA Panel */}
      <div
        className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 ${className}`}
      >
        <div className='flex items-start space-x-4'>
          {/* Icon */}
          <div className='flex-shrink-0'>
            <div className='flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white'>
              <svg
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className='flex-1'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Enable Advanced Recommendations
            </h3>
            <p className='text-sm text-gray-600 mb-4'>
              Get access to detailed optimization insights and automated
              cost-saving recommendations tailored to your infrastructure. Start
              reducing cloud spend with data-driven suggestions.
            </p>

            {/* Benefits list */}
            <ul className='text-sm text-gray-600 space-y-1 mb-6'>
              <li className='flex items-center'>
                <svg
                  className='h-4 w-4 text-green-500 mr-2 flex-shrink-0'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
                Automated rightsizing recommendations
              </li>
              <li className='flex items-center'>
                <svg
                  className='h-4 w-4 text-green-500 mr-2 flex-shrink-0'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
                Unused resource identification
              </li>
              <li className='flex items-center'>
                <svg
                  className='h-4 w-4 text-green-500 mr-2 flex-shrink-0'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
                Real-time cost optimization alerts
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Button */}
        <div className='flex justify-end'>
          <button
            data-testid='enable-button'
            onClick={handleEnableClick}
            className='inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            aria-label='Enable advanced recommendations feature'
          >
            Enable Recommendations
            <svg
              className='ml-2 -mr-1 h-4 w-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5l7 7-7 7'
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div
          className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'
          aria-labelledby='modal-title'
          role='dialog'
          aria-modal='true'
        >
          <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
            <div className='mt-3'>
              {/* Icon */}
              <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4'>
                <svg
                  className='h-6 w-6 text-yellow-600'
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

              {/* Content */}
              <div className='text-center'>
                <h3
                  id='modal-title'
                  className='text-lg font-medium text-gray-900 mb-2'
                >
                  Evaluation Mode
                </h3>
                <p className='text-sm text-gray-600 mb-6'>
                  This is a demonstration of the recommendations feature. In the
                  full version, this would enable real optimization insights for
                  your account.
                </p>
              </div>

              {/* Buttons */}
              <div className='flex space-x-3'>
                <button
                  onClick={handleCancel}
                  className='flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  className='flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
