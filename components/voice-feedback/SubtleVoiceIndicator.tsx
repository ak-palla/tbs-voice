'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Brain, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceState, ErrorType } from '@/hooks/useVoiceFeedback';

interface SubtleVoiceIndicatorProps {
  state: VoiceState;
  errorType?: ErrorType;
  errorMessage?: string;
  processingText?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function SubtleVoiceIndicator({
  state,
  errorType,
  errorMessage,
  processingText,
  onRetry,
  onDismiss,
  className = ''
}: SubtleVoiceIndicatorProps) {
  const [dots, setDots] = useState('');

  // Animate dots for active states
  useEffect(() => {
    if (state === 'idle' || state === 'error') {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 600);

    return () => clearInterval(interval);
  }, [state]);

  // Don't show anything for idle state
  if (state === 'idle' && !errorType) {
    return null;
  }

  // Error state
  if (state === 'error' || errorType) {
    return (
      <div className={cn('flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm', className)}>
        <MicOff className="h-4 w-4 text-red-500 flex-shrink-0" />
        <span className="text-red-700 flex-1">
          {errorMessage || getErrorMessage(errorType)}
        </span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-red-600 hover:text-red-700 text-xs font-medium"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-500 hover:text-red-600 ml-1"
          >
            ×
          </button>
        )}
      </div>
    );
  }

  // Get state configuration
  const getStateConfig = () => {
    switch (state) {
      case 'listening':
        return {
          icon: Mic,
          text: 'Listening',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'recording':
        return {
          icon: Mic,
          text: 'Recording',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'processing':
        return {
          icon: Brain,
          text: 'Processing',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      case 'thinking':
        return {
          icon: Brain,
          text: processingText || 'Thinking',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
      case 'generating':
        return {
          icon: Brain,
          text: 'Generating response',
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200'
        };
      case 'speaking':
        return {
          icon: Volume2,
          text: 'Playing response',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      default:
        return null;
    }
  };

  const config = getStateConfig();
  if (!config) return null;

  const IconComponent = config.icon;

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200',
      config.bgColor,
      config.borderColor,
      'border',
      className
    )}>
      <IconComponent className={cn('h-4 w-4 flex-shrink-0', config.color)} />
      <span className={cn('font-medium', config.color)}>
        {config.text}{dots}
      </span>
    </div>
  );
}

function getErrorMessage(errorType?: ErrorType): string {
  switch (errorType) {
    case 'microphone-permission':
      return 'Microphone access required';
    case 'network-error':
      return 'Connection issue';
    case 'speech-not-recognized':
      return 'Speech not recognized';
    case 'api-failure':
      return 'Service unavailable';
    default:
      return 'Something went wrong';
  }
} 