"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function EnvironmentChecker() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  const envVars = [
    {
      name: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
      value: googleClientId,
      required: true,
      description: 'Google OAuth Client ID for Analytics connection'
    },
    {
      name: 'NEXT_PUBLIC_GA_MEASUREMENT_ID',
      value: gaMeasurementId,
      required: false,
      description: 'Google Analytics Measurement ID for website tracking'
    }
  ];

  const requiredMissing = envVars.filter(env => env.required && !env.value).length;

  return (
    <Card className="mb-6 hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {requiredMissing === 0 ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          Environment Configuration
        </CardTitle>
        <CardDescription>
          Check your environment variables setup for Google Analytics OAuth
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {envVars.map((env) => (
            <div key={env.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {env.name}
                  </code>
                  {env.required && (
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">{env.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {env.value ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">Set</span>
                  </>
                ) : env.required ? (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700">Missing</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700">Optional</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {requiredMissing > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Setup Required</h4>
            <div className="text-sm text-red-700 space-y-2">
              <p>To connect Google Analytics, you need to:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Create a Google OAuth application in Google Cloud Console</li>
                <li>Add environment variables to your <code>.env.local</code> file</li>
                <li>Restart your development server</li>
              </ol>
              <p className="mt-2">
                <strong>See <code>README_GOOGLE_ANALYTICS_SETUP.md</code> for detailed instructions.</strong>
              </p>
            </div>
          </div>
        )}

        {requiredMissing === 0 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Configuration Complete</h4>
            <p className="text-sm text-green-700">
              All required environment variables are set. You can now connect your Google Analytics account.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 