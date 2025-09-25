/**
 * TimelineChart Component
 *
 * Simple SVG-based chart component for displaying timeline data
 * with proper accessibility support.
 */

import React from 'react';
import type { TimelineDataPoint } from '@blocks/shared';

interface TimelineChartProps {
  dataPoints: TimelineDataPoint[];
  title: string;
  metricType: string;
  className?: string;
}

export default function TimelineChart({
  dataPoints,
  title,
  metricType,
  className = '',
}: TimelineChartProps) {
  if (!dataPoints || dataPoints.length === 0) {
    return (
      <div
        className={`bg-gray-100 rounded-lg p-4 text-center ${className}`}
        role='img'
        aria-label={`${title} chart - no data available`}
      >
        <p className='text-gray-500 text-sm'>No data available</p>
      </div>
    );
  }

  // Calculate chart dimensions and scaling
  const width = 400;
  const height = 150;
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Find min/max values for scaling
  const values = dataPoints.map(point => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1; // Prevent division by zero

  // Generate SVG path for the line
  const pathData = dataPoints
    .map((point, index) => {
      const x = padding + (index / (dataPoints.length - 1)) * chartWidth;
      const y = padding + ((maxValue - point.value) / valueRange) * chartHeight;

      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  // Format value for display
  const formatValue = (value: number): string => {
    if (metricType === 'Spend') {
      return `$${value.toFixed(2)}`;
    } else if (metricType === 'Performance') {
      return `${value.toFixed(1)}%`;
    } else {
      return value.toFixed(1);
    }
  };

  // Generate accessible description
  const description =
    `Chart showing ${title.toLowerCase()} over time. ` +
    `Values range from ${formatValue(minValue)} to ${formatValue(maxValue)}. ` +
    `Current value: ${formatValue(values[values.length - 1] || 0)}.`;

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <svg
        width='100%'
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        data-testid='timeline-chart'
        role='img'
        aria-labelledby={`chart-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
        aria-describedby={`chart-desc-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className='w-full'
      >
        <title id={`chart-title-${title.replace(/\s+/g, '-').toLowerCase()}`}>
          {title} Timeline Chart
        </title>
        <desc id={`chart-desc-${title.replace(/\s+/g, '-').toLowerCase()}`}>
          {description}
        </desc>

        {/* Grid lines */}
        <defs>
          <pattern
            id='grid'
            width='20'
            height='20'
            patternUnits='userSpaceOnUse'
          >
            <path
              d='M 20 0 L 0 0 0 20'
              fill='none'
              stroke='#e5e7eb'
              strokeWidth='0.5'
            />
          </pattern>
        </defs>
        <rect
          x={padding}
          y={padding}
          width={chartWidth}
          height={chartHeight}
          fill='url(#grid)'
          opacity='0.5'
        />

        {/* Chart line */}
        <path
          d={pathData}
          fill='none'
          stroke='#3b82f6'
          strokeWidth='2.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />

        {/* Data points */}
        {dataPoints.map((point, index) => {
          const x = padding + (index / (dataPoints.length - 1)) * chartWidth;
          const y =
            padding + ((maxValue - point.value) / valueRange) * chartHeight;

          return (
            <circle
              key={point.timestamp}
              cx={x}
              cy={y}
              r='3'
              fill='#3b82f6'
              className='hover:r-4 transition-all'
            >
              <title>{`${formatValue(point.value)} on ${new Date(point.timestamp).toLocaleDateString()}`}</title>
            </circle>
          );
        })}

        {/* Y-axis labels */}
        <text
          x={padding - 5}
          y={padding}
          textAnchor='end'
          alignmentBaseline='middle'
          className='text-xs fill-gray-600'
        >
          {formatValue(maxValue)}
        </text>
        <text
          x={padding - 5}
          y={padding + chartHeight}
          textAnchor='end'
          alignmentBaseline='middle'
          className='text-xs fill-gray-600'
        >
          {formatValue(minValue)}
        </text>
      </svg>

      {/* Value summary below chart */}
      <div className='mt-2 flex justify-between text-xs text-gray-600'>
        <span>30 days ago</span>
        <span className='font-medium'>
          Latest: {formatValue(values[values.length - 1] || 0)}
        </span>
        <span>Today</span>
      </div>
    </div>
  );
}
