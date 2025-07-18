'use client';

import React from 'react';
import { AlertCircle, MicOff, Wifi, RefreshCw, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ErrorType } from '@/hooks/useVoiceFeedback';

interface ErrorStateHandlerProps {
  errorType: ErrorType;
  errorMessage?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  onHelp?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showActions?: boolean;
}

export function ErrorStateHandler({
  errorType,
  errorMessage,
  onRetry,
  onDismiss,
  onHelp,
  className = '',
  size = 'md',
  showActions = true
}: ErrorStateHandlerProps) {
  
  // Get error configuration
  const getErrorConfig = () => {
    switch (errorType) {
      case 'microphone-permission':
        return {
          icon: MicOff,
          title: 'Microphone Access Required',
          message: errorMessage || 'Please allow microphone access to use voice features.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
          retryLabel: 'Request Permission',
          showHelp: true,
          severity: 'warning'
        };
      case 'network-error':
        return {
          icon: Wifi,
          title: 'Connection Problem',
          message: errorMessage || 'Unable to connect to the server. Please check your internet connection.',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-600',
          titleColor: 'text-orange-800',
          messageColor: 'text-orange-700',
          retryLabel: 'Reconnect',
          showHelp: false,
          severity: 'warning'
        };
      case 'speech-not-recognized':
        return {
          icon: AlertCircle,
          title: 'Speech Not Recognized',
          message: errorMessage || "Sorry, I couldn't understand what you said. Please try speaking more clearly.",
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          retryLabel: 'Try Again',
          showHelp: true,
          severity: 'info'
        };
      case 'api-failure':
        return {
          icon: AlertCircle,
          title: 'Service Unavailable',
          message: errorMessage || 'The voice service is temporarily unavailable. Please try again later.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          retryLabel: 'Retry',
          showHelp: false,
          severity: 'error'
        };
      case 'unknown-error':
      default:
        return {
          icon: AlertCircle,
          title: 'Something went wrong',
          message: errorMessage || 'An unexpected error occurred. Please try again.',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700',
          retryLabel: 'Try Again',
          showHelp: true,
          severity: 'error'
        };
    }
  };

  const config = getErrorConfig();
  const IconComponent = config.icon;

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'p-3',
      iconSize: 18,
      titleSize: 'text-sm',
      messageSize: 'text-xs',
      buttonSize: 'sm' as const,
      gap: 'gap-2'
    },
    md: {
      padding: 'p-4',
      iconSize: 20,
      titleSize: 'text-base',
      messageSize: 'text-sm',
      buttonSize: 'sm' as const,
      gap: 'gap-3'
    },
    lg: {
      padding: 'p-5',
      iconSize: 24,
      titleSize: 'text-lg',
      messageSize: 'text-base',
      buttonSize: 'default' as const,
      gap: 'gap-4'
    }
  };

  const sizeStyles = sizeConfig[size];

  // Get help text based on error type
  const getHelpText = () => {
    switch (errorType) {
      case 'microphone-permission':
        return 'Click the microphone icon in your browser\'s address bar and select "Allow"';
      case 'speech-not-recognized':
        return 'Try speaking closer to your microphone in a quiet environment';
      default:
        return 'Contact support if this problem persists';
    }
  };

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div className={cn(
        'rounded-lg border transition-all duration-300',
        sizeStyles.padding,
        config.bgColor,
        config.borderColor
      )}>
        {/* Header */}
        <div className={cn('flex items-start', sizeStyles.gap)}>
          {/* Icon */}
          <div className={cn('flex-shrink-0 mt-0.5')}>
            <IconComponent 
              className={cn('animate-pulse', config.iconColor)} 
              size={sizeStyles.iconSize}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'font-semibold',
              sizeStyles.titleSize,
              config.titleColor
            )}>
              {config.title}
            </h3>
            <p className={cn(
              'mt-1 leading-relaxed',
              sizeStyles.messageSize,
              config.messageColor
            )}>
              {config.message}
            </p>

            {/* Help text */}
            {config.showHelp && (
              <p className={cn(
                'mt-2 text-xs opacity-75 italic',
                config.messageColor
              )}>
                💡 {getHelpText()}
              </p>
            )}
          </div>

          {/* Dismiss button */}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className={cn(
                'flex-shrink-0 h-6 w-6 p-0 hover:bg-transparent',
                config.iconColor,
                'hover:opacity-70'
              )}
            >
              <X size={14} />
            </Button>
          )}
        </div>

        {/* Actions */}
        {showActions && (onRetry || onHelp) && (
          <div className={cn('flex items-center justify-end mt-4', sizeStyles.gap)}>
            {config.showHelp && onHelp && (
              <Button
                variant="ghost"
                size={sizeStyles.buttonSize}
                onClick={onHelp}
                className={cn(
                  'flex items-center gap-1.5',
                  config.iconColor,
                  'hover:bg-transparent hover:opacity-70'
                )}
              >
                <HelpCircle size={14} />
                Help
              </Button>
            )}

            {onRetry && (
              <Button
                variant="outline"
                size={sizeStyles.buttonSize}
                onClick={onRetry}
                className={cn(
                  'flex items-center gap-1.5 transition-colors',
                  config.borderColor,
                  config.iconColor,
                  'hover:bg-white/50'
                )}
              >
                <RefreshCw size={14} />
                {config.retryLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 