'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useVoiceFeedback, VoiceState, ErrorType } from '@/hooks/useVoiceFeedback';
import { VoiceActivityIndicator } from './VoiceActivityIndicator';
import { ProcessingStateIndicator } from './ProcessingStateIndicator';
import { ErrorStateHandler } from './ErrorStateHandler';

interface VoiceFeedbackIndicatorProps {
  // State props
  state?: VoiceState;
  audioLevel?: number;
  stream?: MediaStream | null;
  errorType?: ErrorType;
  errorMessage?: string;
  processingText?: string;
  
  // Behavior props
  onRetry?: () => void;
  onDismiss?: () => void;
  onHelp?: () => void;
  
  // Appearance props
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical' | 'compact';
  
  // Feature toggles
  showWaveform?: boolean;
  showIcon?: boolean;
  showDuration?: boolean;
  showProcessingState?: boolean;
  showErrorState?: boolean;
  
  // For hook-managed state
  useHookState?: boolean;
  initialState?: VoiceState;
}

export function VoiceFeedbackIndicator({
  // State props
  state: externalState,
  audioLevel: externalAudioLevel = 0,
  stream,
  errorType: externalErrorType,
  errorMessage: externalErrorMessage,
  processingText: externalProcessingText,
  
  // Behavior props
  onRetry,
  onDismiss,
  onHelp,
  
  // Appearance props
  className = '',
  size = 'md',
  layout = 'horizontal',
  
  // Feature toggles
  showWaveform = true,
  showIcon = true,
  showDuration = true,
  showProcessingState = true,
  showErrorState = true,
  
  // Hook management
  useHookState = false,
  initialState = 'idle'
}: VoiceFeedbackIndicatorProps) {
  
  // Use internal hook if requested
  const hookState = useVoiceFeedback(initialState);
  
  // Determine which state to use
  const state = useHookState ? hookState.state : (externalState || 'idle');
  const audioLevel = useHookState ? hookState.audioLevel : externalAudioLevel;
  const errorType = useHookState ? hookState.errorType : externalErrorType;
  const errorMessage = useHookState ? hookState.errorMessage : externalErrorMessage;
  const processingText = useHookState ? hookState.processingText : externalProcessingText;
  const duration = useHookState ? hookState.duration : 0;

  // Layout configurations
  const layoutConfig = {
    horizontal: {
      container: 'flex items-center gap-4',
      activityWrapper: 'flex-1',
      processingWrapper: 'flex-shrink-0',
      errorWrapper: 'w-full mt-3'
    },
    vertical: {
      container: 'flex flex-col gap-3',
      activityWrapper: 'w-full',
      processingWrapper: 'w-full',
      errorWrapper: 'w-full'
    },
    compact: {
      container: 'flex items-center gap-2',
      activityWrapper: 'flex-1',
      processingWrapper: 'flex-shrink-0',
      errorWrapper: 'absolute inset-x-0 top-full mt-2 z-10'
    }
  };

  const layoutStyles = layoutConfig[layout];

  // Don't render anything if idle and no error
  if (state === 'idle' && !errorType) {
    return null;
  }

  // Helper function to handle error actions
  const handleRetry = () => {
    if (useHookState) {
      hookState.clearError();
    }
    onRetry?.();
  };

  const handleDismiss = () => {
    if (useHookState) {
      hookState.clearError();
    }
    onDismiss?.();
  };

  // Expose hook state for external control
  React.useImperativeHandle(
    React.useRef(), 
    () => useHookState ? hookState : undefined,
    [useHookState, hookState]
  );

  return (
    <div className={cn('relative w-full', className)}>
      <div className={layoutStyles.container}>
        {/* Voice Activity Indicator */}
        {(state !== 'idle' && state !== 'error') && (
          <div className={layoutStyles.activityWrapper}>
            <VoiceActivityIndicator
              state={state}
              audioLevel={audioLevel}
              stream={stream}
              size={size}
              showWaveform={showWaveform}
              showIcon={showIcon}
            />
          </div>
        )}

        {/* Processing State Indicator */}
        {showProcessingState && (state !== 'idle' && state !== 'error') && (
          <div className={layoutStyles.processingWrapper}>
            <ProcessingStateIndicator
              state={state}
              processingText={processingText}
              duration={duration}
              size={size}
              showDuration={showDuration}
            />
          </div>
        )}
        
        {/* Error State Handler */}
        {showErrorState && errorType && (
          <div className={cn(layoutStyles.errorWrapper, layout === 'compact' && 'relative')}>
            <ErrorStateHandler
              errorType={errorType}
              errorMessage={errorMessage}
              onRetry={handleRetry}
              onDismiss={handleDismiss}
              onHelp={onHelp}
              size={size}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Export hook for external state management
export { useVoiceFeedback } from '@/hooks/useVoiceFeedback';

// Convenience components for specific use cases
export function VoiceRecordingIndicator(props: Omit<VoiceFeedbackIndicatorProps, 'state'>) {
  return (
    <VoiceFeedbackIndicator
      {...props}
      state="recording"
      showProcessingState={false}
    />
  );
}

export function VoiceProcessingIndicator(props: Omit<VoiceFeedbackIndicatorProps, 'state'>) {
  return (
    <VoiceFeedbackIndicator
      {...props}
      state="thinking"
      showWaveform={false}
      showIcon={false}
    />
  );
}

export function VoiceErrorIndicator({ 
  errorType = 'unknown-error', 
  ...props 
}: Omit<VoiceFeedbackIndicatorProps, 'state'> & { errorType?: ErrorType }) {
  return (
    <VoiceFeedbackIndicator
      {...props}
      state="error"
      errorType={errorType}
      showWaveform={false}
      showProcessingState={false}
      layout="compact"
    />
  );
} 