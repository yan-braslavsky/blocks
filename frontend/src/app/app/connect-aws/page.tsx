'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTenant } from '../../providers/TenantProvider'

export default function ConnectAWSPage() {
  const [isValidating, setIsValidating] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()
  const { tenant } = useTenant()

  const handleValidateConnection = async () => {
    setIsValidating(true)
    setConnectionStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/connection-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          region: 'us-east-1', // Default region for demo
          roleArn: `arn:aws:iam::ACCOUNT_ID:role/BlocksReadOnlyRole`
        })
      })

      const data = await response.json()

      if (response.ok) {
        setConnectionStatus('success')
        // Auto-redirect to dashboard after successful validation
        setTimeout(() => {
          router.push('/app/dashboard')
        }, 2000)
      } else {
        setConnectionStatus('error')
        setErrorMessage(data.message || 'Connection validation failed')
      }
    } catch (error) {
      setConnectionStatus('error')
      setErrorMessage('Network error during validation')
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Connect Your AWS Account</h1>
        <p className="text-gray-600">
          Follow these steps to securely connect your AWS account to Blocks.
        </p>
      </div>

      <div className="space-y-8">
        {/* Step 1: Create IAM Role */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Create IAM Role in AWS Console
              </h3>
              <p className="text-gray-600 mb-4">
                Create a new IAM role in your AWS account with the following configuration:
              </p>
              
              <div className="bg-gray-50 rounded-md p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Role Name:</h4>
                <code className="text-sm bg-white px-2 py-1 rounded border">BlocksReadOnlyRole</code>
              </div>

              <div className="bg-gray-50 rounded-md p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Trust Policy:</h4>
                <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::${process.env.NEXT_PUBLIC_BLOCKS_AWS_ACCOUNT || 'BLOCKS_ACCOUNT_ID'}:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "YOUR_EXTERNAL_ID"
        }
      }
    }
  ]
}`}
                </pre>
              </div>

              <div className="bg-gray-50 rounded-md p-4">
                <h4 className="font-medium text-gray-900 mb-2">Required Permissions:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <code>ce:GetCostAndUsage</code></li>
                  <li>• <code>ce:GetDimensionValues</code></li>
                  <li>• <code>ce:GetReservationCoverage</code></li>
                  <li>• <code>ce:GetReservationPurchaseRecommendation</code></li>
                  <li>• <code>ce:GetReservationUtilization</code></li>
                  <li>• <code>ce:GetRightsizingRecommendation</code></li>
                  <li>• <code>ce:GetUsageAndCosts</code></li>
                  <li>• <code>organizations:ListAccounts</code> (if using Organizations)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Validate Connection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Validate Connection
              </h3>
              <p className="text-gray-600 mb-4">
                Once you've created the IAM role, click the button below to validate the connection.
              </p>

              {connectionStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-green-800">Connection Successful!</h4>
                      <p className="text-sm text-green-700">Redirecting to dashboard...</p>
                    </div>
                  </div>
                </div>
              )}

              {connectionStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-red-800">Connection Failed</h4>
                      <p className="text-sm text-red-700">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleValidateConnection}
                disabled={isValidating}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? 'Validating...' : 'Validate Connection'}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Security Note</h4>
              <p className="text-sm text-blue-700">
                Blocks only requests read-only access to your AWS Cost Explorer data. 
                We never have write permissions to your AWS resources.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}