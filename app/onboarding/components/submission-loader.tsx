'use client';

import { Check } from "lucide-react";

interface SubmissionLoaderProps {
  loadingSteps: {
    title: string;
    done: boolean;
  }[];
}

export function SubmissionLoader({ loadingSteps }: SubmissionLoaderProps) {
  const completedSteps = loadingSteps.filter(step => step.done).length;
  const totalSteps = loadingSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
       
          <h1 className="text-3xl text-gray-900 mb-2 tracking-tight">
            Setting up your account
          </h1>
          <p className="text-gray-500 text-lg">
            This will only take a moment
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600 font-medium">Progress</span>
            <span className="text-sm text-blue-600 font-medium">
              {completedSteps}/{totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Loading Steps */}
        <div className="space-y-6">
          {loadingSteps.map((step, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-4 transition-all duration-500 ${
                step.done || index === completedSteps ? 'opacity-100' : 'opacity-60'
              }`}
            >
              <div className={`relative flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
                step.done 
                  ? 'bg-green-500 scale-100' 
                  : 'bg-gray-100 scale-95'
              }`}>
                {step.done ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                )}
                {step.done && (
                  <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-lg transition-colors duration-300 ${
                  step.done || index === completedSteps ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {step.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Spinner */}
        <div className="flex mt-12">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}