import { useState, useCallback, useRef, useEffect } from 'react';

export type VoiceState = 
  | 'idle'
  | 'listening' 
  | 'recording'
  | 'processing'
  | 'thinking'
  | 'generating'
  | 'speaking'
  | 'error';

export type ErrorType = 
  | 'microphone-permission'
  | 'network-error'
  | 'speech-not-recognized'
  | 'api-failure'
  | 'unknown-error';

export interface VoiceFeedbackState {
  state: VoiceState;
  isActive: boolean;
  audioLevel: number;
  duration: number;
  errorType?: ErrorType;
  errorMessage?: string;
  processingText?: string;
}

export interface VoiceFeedbackActions {
  setState: (state: VoiceState) => void;
  setAudioLevel: (level: number) => void;
  setError: (type: ErrorType, message?: string) => void;
  clearError: () => void;
  setProcessingText: (text: string) => void;
  reset: () => void;
}

const DEFAULT_PROCESSING_TEXTS = {
  listening: "Listening...",
  recording: "Recording...",
  processing: "Processing speech...",
  thinking: "Thinking...",
  generating: "Generating response...",
  speaking: "Speaking..."
};

export function useVoiceFeedback(initialState: VoiceState = 'idle'): VoiceFeedbackState & VoiceFeedbackActions {
  const [state, setState] = useState<VoiceState>(initialState);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [errorType, setErrorType] = useState<ErrorType | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [processingText, setProcessingText] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update duration when state changes
  useEffect(() => {
    if (state !== 'idle' && state !== 'error') {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setDuration((Date.now() - startTimeRef.current) / 1000);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setDuration(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state]);

  // Auto-update processing text based on state
  useEffect(() => {
    if (!processingText && DEFAULT_PROCESSING_TEXTS[state as keyof typeof DEFAULT_PROCESSING_TEXTS]) {
      setProcessingText(DEFAULT_PROCESSING_TEXTS[state as keyof typeof DEFAULT_PROCESSING_TEXTS]);
    }
  }, [state, processingText]);

  const handleSetState = useCallback((newState: VoiceState) => {
    setState(newState);
    if (newState !== 'error') {
      setErrorType(undefined);
      setErrorMessage(undefined);
    }
  }, []);

  const handleSetError = useCallback((type: ErrorType, message?: string) => {
    setErrorType(type);
    setErrorMessage(message);
    setState('error');
  }, []);

  const clearError = useCallback(() => {
    setErrorType(undefined);
    setErrorMessage(undefined);
    setState('idle');
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setAudioLevel(0);
    setErrorType(undefined);
    setErrorMessage(undefined);
    setProcessingText('');
    setDuration(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleSetProcessingText = useCallback((text: string) => {
    setProcessingText(text);
  }, []);

  return {
    // State
    state,
    isActive: state !== 'idle' && state !== 'error',
    audioLevel,
    duration,
    errorType,
    errorMessage,
    processingText,
    
    // Actions
    setState: handleSetState,
    setAudioLevel,
    setError: handleSetError,
    clearError,
    setProcessingText: handleSetProcessingText,
    reset
  };
} 