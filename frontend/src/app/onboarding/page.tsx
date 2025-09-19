'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '../providers/TenantProvider';

export default function OnboardingPage() {
  const [formData, setFormData] = useState({
    tenantName: '',
    roleArn: '',
    externalId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { setTenant } = useTenant();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // In mock mode, simulate successful tenant setup
      const mockTenant = {
        id: '01234567-89ab-cdef-0123-456789abcdef',
        name: formData.tenantName || 'Demo Organization',
        connectionStatus: 'unconfigured' as const
      };

      // Set the tenant in context
      setTenant(mockTenant);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to dashboard
      router.push('/app/dashboard');
    } catch (err) {
      setError('Failed to set up workspace. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Blocks
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Set up your AWS cost optimization workspace
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700">
                Workspace Name
              </label>
              <input
                id="tenantName"
                name="tenantName"
                type="text"
                required
                value={formData.tenantName}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="My Organization"
              />
            </div>
            
            <div>
              <label htmlFor="roleArn" className="block text-sm font-medium text-gray-700">
                AWS IAM Role ARN
              </label>
              <input
                id="roleArn"
                name="roleArn"
                type="text"
                required
                value={formData.roleArn}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="arn:aws:iam::123456789012:role/BlocksRole"
              />
            </div>
            
            <div>
              <label htmlFor="externalId" className="block text-sm font-medium text-gray-700">
                External ID
              </label>
              <input
                id="externalId"
                name="externalId"
                type="text"
                required
                value={formData.externalId}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="blocks-ext-12345678"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Setting up...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}