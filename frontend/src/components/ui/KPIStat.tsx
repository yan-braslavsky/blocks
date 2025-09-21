import React from 'react';
// (Design tokens import removed) Not directly referenced in component implementation.

interface KPIStatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'compact';
}

const KPIStat = React.forwardRef<HTMLDivElement, KPIStatProps>(
  (
    {
      label,
      value,
      change,
      icon,
      variant = 'default',
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      bg-white rounded-lg border border-slate-200 p-6
      dark:bg-slate-800 dark:border-slate-600
    `;

    const compactStyles = `
      bg-white rounded-lg border border-slate-200 p-4
      dark:bg-slate-800 dark:border-slate-600
    `;

    const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
      switch (type) {
        case 'increase':
          return 'text-red-600 dark:text-red-400'; // Increases in cost are typically bad
        case 'decrease':
          return 'text-green-600 dark:text-green-400'; // Decreases in cost are typically good
        case 'neutral':
          return 'text-slate-600 dark:text-slate-400';
        default:
          return 'text-slate-600 dark:text-slate-400';
      }
    };

    const getChangeIcon = (type: 'increase' | 'decrease' | 'neutral') => {
      if (type === 'increase') {
        return (
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 10l7-7m0 0l7 7m-7-7v18'
            />
          </svg>
        );
      }
      if (type === 'decrease') {
        return (
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 14l-7 7m0 0l-7-7m7 7V3'
            />
          </svg>
        );
      }
      return (
        <svg
          className='w-4 h-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M20 12H4'
          />
        </svg>
      );
    };

    const combinedClassName = `
      ${variant === 'compact' ? compactStyles : baseStyles}
      ${className}
    `
      .replace(/\s+/g, ' ')
      .trim();

    return (
      <div ref={ref} className={combinedClassName} {...props}>
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <div className='flex items-center space-x-2'>
              {icon && (
                <div className='text-slate-400 dark:text-slate-500'>{icon}</div>
              )}
              <p
                className={`text-sm font-medium text-slate-600 dark:text-slate-300 ${variant === 'compact' ? 'text-xs' : ''}`}
              >
                {label}
              </p>
            </div>
            <p
              className={`font-bold text-slate-900 dark:text-slate-100 mt-2 ${variant === 'compact' ? 'text-lg' : 'text-2xl'}`}
            >
              {value}
            </p>
            {change && (
              <div className='flex items-center space-x-1 mt-2'>
                <span
                  className={`flex items-center space-x-1 text-sm font-medium ${getChangeColor(change.type)}`}
                >
                  {getChangeIcon(change.type)}
                  <span>{change.value}</span>
                </span>
                {change.period && (
                  <span className='text-xs text-slate-500 dark:text-slate-400'>
                    {change.period}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

KPIStat.displayName = 'KPIStat';

export default KPIStat;
