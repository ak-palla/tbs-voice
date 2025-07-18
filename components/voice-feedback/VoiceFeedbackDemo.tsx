'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  VoiceFeedbackIndicator, 
  VoiceRecordingIndicator, 
  VoiceProcessingIndicator, 
  VoiceErrorIndicator,
  useVoiceFeedback,
  VoiceState,
  ErrorType 
} from './index';

export function VoiceFeedbackDemo() {
  const [selectedState, setSelectedState] = useState<VoiceState>('idle');
  const [selectedError, setSelectedError] = useState<ErrorType>('microphone-permission');
  const [audioLevel, setAudioLevel] = useState([0.3]);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const voiceFeedback = useVoiceFeedback('idle');
  
  const streamRef = useRef<MediaStream | null>(null);

  const states: VoiceState[] = [
    'idle', 'listening', 'recording', 'processing', 'thinking', 'generating', 'speaking', 'error'
  ];

  const errors: ErrorType[] = [
    'microphone-permission', 'network-error', 'speech-not-recognized', 'api-failure', 'unknown-error'
  ];

  const layouts = ['horizontal', 'vertical', 'compact'] as const;
  const sizes = ['sm', 'md', 'lg'] as const;

  const handleStateChange = (state: VoiceState) => {
    setSelectedState(state);
    voiceFeedback.setState(state);
    
    if (state === 'error') {
      voiceFeedback.setError(selectedError);
    } else {
      voiceFeedback.clearError();
    }
  };

  const startMicrophone = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = newStream;
      setStream(newStream);
      setIsRecording(true);
      
      // Auto-set to recording state
      setTimeout(() => {
        voiceFeedback.setState('recording');
        voiceFeedback.setAudioLevel(audioLevel[0]);
      }, 100);
    } catch (error) {
      console.error('Microphone error:', error);
      voiceFeedback.setError('microphone-permission', 'Unable to access microphone');
    }
  };

  const stopMicrophone = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    setIsRecording(false);
    voiceFeedback.setState('idle');
  };

  const simulateAudioLevel = () => {
    const interval = setInterval(() => {
      const randomLevel = Math.random() * 0.8 + 0.1;
      voiceFeedback.setAudioLevel(randomLevel);
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      voiceFeedback.setAudioLevel(0);
    }, 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice Feedback System Demo</h1>
        <p className="text-gray-600">Interactive demonstration of voice activity indicators, processing states, and error handling</p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
          <CardDescription>Test different states and configurations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Voice State</label>
              <Select value={selectedState} onValueChange={(value: VoiceState) => handleStateChange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {states.map(state => (
                    <SelectItem key={state} value={state} className="capitalize">
                      {state.replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Error Type</label>
              <Select value={selectedError} onValueChange={(value: ErrorType) => setSelectedError(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {errors.map(error => (
                    <SelectItem key={error} value={error} className="capitalize">
                      {error.replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Audio Level: {Math.round(audioLevel[0] * 100)}%</label>
              <Slider
                value={audioLevel}
                onValueChange={setAudioLevel}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => handleStateChange('recording')}
              variant={selectedState === 'recording' ? 'default' : 'outline'}
            >
              Start Recording
            </Button>
            <Button 
              onClick={() => handleStateChange('thinking')}
              variant={selectedState === 'thinking' ? 'default' : 'outline'}
            >
              Show Thinking
            </Button>
            <Button 
              onClick={() => handleStateChange('generating')}
              variant={selectedState === 'generating' ? 'default' : 'outline'}
            >
              Show Generating
            </Button>
            <Button 
              onClick={() => handleStateChange('speaking')}
              variant={selectedState === 'speaking' ? 'default' : 'outline'}
            >
              Show Speaking
            </Button>
            <Button 
              onClick={() => handleStateChange('error')}
              variant={selectedState === 'error' ? 'destructive' : 'outline'}
            >
              Show Error
            </Button>
            <Button onClick={simulateAudioLevel} variant="secondary">
              Simulate Audio
            </Button>
          </div>

          <div className="flex gap-3">
            <Button onClick={startMicrophone} disabled={isRecording}>
              Start Real Microphone
            </Button>
            <Button onClick={stopMicrophone} disabled={!isRecording} variant="outline">
              Stop Microphone
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Indicator */}
      <Card>
        <CardHeader>
          <CardTitle>Main Voice Feedback Indicator</CardTitle>
          <CardDescription>Comprehensive indicator with all features enabled</CardDescription>
        </CardHeader>
        <CardContent>
          <VoiceFeedbackIndicator
            state={voiceFeedback.state}
            audioLevel={voiceFeedback.audioLevel}
            stream={stream}
            errorType={voiceFeedback.errorType}
            errorMessage={voiceFeedback.errorMessage}
            processingText={voiceFeedback.processingText}
            onRetry={() => {
              console.log('Retry clicked');
              voiceFeedback.clearError();
            }}
            onDismiss={() => {
              console.log('Dismiss clicked');
              voiceFeedback.clearError();
            }}
            onHelp={() => console.log('Help clicked')}
            size="lg"
            layout="horizontal"
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Layout Variations */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Variations</CardTitle>
          <CardDescription>Different layouts and sizes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {layouts.map(layout => (
            <div key={layout} className="space-y-3">
              <h4 className="font-medium capitalize">{layout} Layout</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sizes.map(size => (
                  <div key={size} className="space-y-2">
                    <div className="text-sm text-gray-600 uppercase">{size}</div>
                    <VoiceFeedbackIndicator
                      state={voiceFeedback.state}
                      audioLevel={voiceFeedback.audioLevel}
                      stream={stream}
                      errorType={voiceFeedback.errorType}
                      errorMessage={voiceFeedback.errorMessage}
                      processingText={voiceFeedback.processingText}
                      onRetry={() => voiceFeedback.clearError()}
                      onDismiss={() => voiceFeedback.clearError()}
                      size={size}
                      layout={layout}
                      className="w-full border rounded-lg p-3"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Convenience Components */}
      <Card>
        <CardHeader>
          <CardTitle>Convenience Components</CardTitle>
          <CardDescription>Pre-configured components for specific use cases</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Recording Indicator</h4>
            <VoiceRecordingIndicator
              audioLevel={voiceFeedback.audioLevel}
              stream={stream}
              size="md"
              className="border rounded-lg p-4"
            />
          </div>

          <div>
            <h4 className="font-medium mb-3">Processing Indicator</h4>
            <VoiceProcessingIndicator
              processingText="Thinking about your request..."
              size="md"
              className="border rounded-lg p-4"
            />
          </div>

          <div>
            <h4 className="font-medium mb-3">Error Indicator</h4>
            <VoiceErrorIndicator
              errorType={selectedError}
              errorMessage="This is a sample error message"
              onRetry={() => console.log('Error retry')}
              onDismiss={() => console.log('Error dismiss')}
              size="md"
              className="border rounded-lg p-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* State Information */}
      <Card>
        <CardHeader>
          <CardTitle>Current State</CardTitle>
          <CardDescription>Real-time state information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-900">State</div>
              <div className="text-gray-600 capitalize">{voiceFeedback.state}</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Audio Level</div>
              <div className="text-gray-600">{Math.round(voiceFeedback.audioLevel * 100)}%</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Duration</div>
              <div className="text-gray-600">{voiceFeedback.duration.toFixed(1)}s</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Active</div>
              <div className="text-gray-600">{voiceFeedback.isActive ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 