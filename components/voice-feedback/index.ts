// Main components
export { VoiceFeedbackIndicator } from './VoiceFeedbackIndicator';
export { VoiceActivityIndicator } from './VoiceActivityIndicator';
export { ProcessingStateIndicator } from './ProcessingStateIndicator';
export { ErrorStateHandler } from './ErrorStateHandler';
export { SubtleVoiceIndicator } from './SubtleVoiceIndicator';

// Convenience components
export { 
  VoiceRecordingIndicator, 
  VoiceProcessingIndicator, 
  VoiceErrorIndicator 
} from './VoiceFeedbackIndicator';

// Hook and types
export { 
  useVoiceFeedback, 
  type VoiceState, 
  type ErrorType, 
  type VoiceFeedbackState, 
  type VoiceFeedbackActions 
} from '@/hooks/useVoiceFeedback';

// Demo component (create separately if needed)
// export { VoiceFeedbackDemo } from './VoiceFeedbackDemo'; 