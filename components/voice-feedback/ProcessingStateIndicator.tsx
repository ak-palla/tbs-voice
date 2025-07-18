'use client';

import React, { useEffect, useState } from 'react';
import { Brain, Loader2, MessageSquare, Volume2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceState } from '@/hooks/useVoiceFeedback';

interface ProcessingStateIndicatorProps {
  state: VoiceState;
  processingText?: string;
  duration: number;
  className?: string;
  showIcon?: boolean;
  showDuration?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProcessingStateIndicator({
  state,
  processingText,
  duration,
  className = '',
  showIcon = true,
  showDuration = true,
  size = 'md'
}: ProcessingStateIndicatorProps) {
  const [dots, setDots] = useState('');

  // Animate dots for processing states
  useEffect(() => {
    if (state === 'idle' || state === 'error') {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [state]);

  // Get state configuration
  const getStateConfig = () => {
    switch (state) {
      case 'listening':
        return {
          icon: MessageSquare,
          text: processingText || 'Listening',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          animation: 'animate-pulse',
          showSpinner: false
        };
      case 'recording':
        return {
          icon: MessageSquare,
          text: processingText || 'Recording',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          animation: 'animate-pulse',
          showSpinner: false
        };
      case 'processing':
        return {
          icon: Brain,
          text: processingText || 'Processing speech',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          animation: 'animate-bounce',
          showSpinner: true
        };
      case 'thinking':
        return {
          icon: Brain,
          text: processingText || 'Thinking',
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200',
          animation: 'animate-pulse',
          showSpinner: true
        };
      case 'generating':
        return {
          icon: Loader2,
          text: processingText || 'Generating response',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          animation: 'animate-spin',
          showSpinner: true
        };
      case 'speaking':
        return {
          icon: Volume2,
          text: processingText || 'Speaking',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          animation: 'animate-pulse',
          showSpinner: false
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: processingText || 'Error occurred',
          color: 'text-red-700',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300',
          animation: 'animate-bounce',
          showSpinner: false
        };
      default:
        return null;
    }
  };

  const config = getStateConfig();
  if (!config || state === 'idle') return null;

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'px-3 py-1.5',
      textSize: 'text-sm',
      iconSize: 16,
      gap: 'gap-2'
    },
    md: {
      padding: 'px-4 py-2',
      textSize: 'text-base',
      iconSize: 18,
      gap: 'gap-2.5'
    },
    lg: {
      padding: 'px-5 py-3',
      textSize: 'text-lg',
      iconSize: 20,
      gap: 'gap-3'
    }
  };

  const sizeStyles = sizeConfig[size];
  const IconComponent = config.icon;

  // Format duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn(
        'flex items-center rounded-full border transition-all duration-300',
        sizeStyles.padding,
        sizeStyles.gap,
        config.bgColor,
        config.borderColor,
        config.animation
      )}>
        {/* Icon */}
        {showIcon && (
          <div className="relative">
            <IconComponent 
              className={cn(
                'transition-colors duration-300',
                config.color,
                config.showSpinner && config.icon === Loader2 ? 'animate-spin' : ''
              )} 
              size={sizeStyles.iconSize}
            />
            
            {/* Additional spinner for non-Loader2 icons when needed */}
            {config.showSpinner && config.icon !== Loader2 && (
              <div className="absolute -inset-1">
                <div className={cn(
                  'w-full h-full rounded-full border-2 border-transparent animate-spin',
                  'border-t-current opacity-30',
                  config.color
                )} />
              </div>
            )}
          </div>
        )}

        {/* Text with animated dots */}
        <span className={cn(
          'font-medium transition-colors duration-300 min-w-0',
          sizeStyles.textSize,
          config.color
        )}>
          {config.text}{dots}
        </span>

        {/* Duration */}
        {showDuration && duration > 0 && (
          <>
            <div className={cn('w-px h-4 opacity-30', config.color.replace('text-', 'bg-'))} />
            <span className={cn(
              'text-xs font-mono tabular-nums opacity-75',
              config.color
            )}>
              {formatDuration(duration)}
            </span>
          </>
        )}
      </div>
    </div>
  );
} 