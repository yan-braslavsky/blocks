'use client';

import React from 'react';
import { useTenant } from '../../providers/TenantProvider';
import { Card, KPIStat } from '../../../components/ui';

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

export default function DashboardPage() {
  const { tenant, isLoading } = useTenant();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* KPI skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </Card>
          ))}
        </div>

        {/* Chart skeleton */}
        <Card>
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">No workspace found</h2>
          <p className="text-gray-500">Please complete onboarding to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{tenant.name} Dashboard</h1>
        <p className="text-gray-600">AWS cost optimization overview</p>
      </div>

      {/* Connection Status Banner */}
      {tenant.connectionStatus !== 'validated' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                AWS Connection Required
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Complete your AWS setup to start receiving cost data and recommendations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <KPIStat 
            label="Monthly Spend" 
            value="$4,500" 
            change={{ value: "↑ 12%", type: "increase", period: "from last month" }}
          />
        </Card>
        <Card>
          <KPIStat 
            label="Potential Savings" 
            value="$900" 
            change={{ value: "20%", type: "decrease", period: "reduction available" }}
          />
        </Card>
        <Card>
          <KPIStat 
            label="Active Recommendations" 
            value="3" 
            change={{ value: "2", type: "neutral", period: "new this week" }}
          />
        </Card>
      </div>

      {/* Spend Chart Placeholder */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Spending Trends</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h4 className="mt-2 text-sm font-medium text-gray-900">Chart Placeholder</h4>
            <p className="text-sm text-gray-500">Spend visualization will appear here</p>
          </div>
        </div>
      </Card>

      {/* Recommendations Preview */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Recommendations</h3>
        <div className="space-y-3">
          <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Right-size EC2 Instance</h4>
                <p className="text-sm text-gray-600">Instance i-0abc123 is underutilized</p>
              </div>
              <span className="text-sm font-medium text-green-600">$25/month</span>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Savings Plan Opportunity</h4>
                <p className="text-sm text-gray-600">1-year commitment available</p>
              </div>
              <span className="text-sm font-medium text-green-600">$75/month</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}