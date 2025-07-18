'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceActivityDetector, VADConfig, VADCallbacks, createVAD } from '@/lib/voice-activity-detection';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Settings, Volume2, VolumeX, Pause, Play, Square, RotateCcw } from 'lucide-react';

interface EnhancedVADControlsProps {
  isVoiceEnabled: boolean;
  onVoiceToggle: () => void;
  onRecordingStart?: () => void;
  onRecordingStop?: (reason: 'manual' | 'silence' | 'maxDuration' | 'lowEnergy') => void;
  audioVolume: number;
  onVolumeChange: (volume: number) => void;
  className?: string;
}

export function EnhancedVADControls({
  isVoiceEnabled,
  onVoiceToggle,
  onRecordingStart,
  onRecordingStop,
  audioVolume,
  onVolumeChange,
  className = ''
}: EnhancedVADControlsProps) {
  // VAD instance and state
  const [vad, setVad] = useState<VoiceActivityDetector | null>(null);
  const [vadConfig, setVadConfig] = useState<VADConfig>(createVAD('balanced'));
  const [isRecording, setIsRecording] = useState(false);
  const [vadStatus, setVadStatus] = useState<'inactive' | 'calibrating' | 'listening' | 'speaking' | 'silence'>('inactive');
  
  // Real-time metrics
  const [currentVolume, setCurrentVolume] = useState(0);
  const [backgroundNoise, setBackgroundNoise] = useState(0);
  const [adaptiveThreshold, setAdaptiveThreshold] = useState(0);
  const [silenceDuration, setSilenceDuration] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [vadPreset, setVadPreset] = useState<'sensitive' | 'balanced' | 'noise-tolerant'>('balanced');
  const [autoStopEnabled, setAutoStopEnabled] = useState(true);
  
  // Recording timer
  const recordingStartTime = useRef<number>(0);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize VAD system
   */
  const initializeVAD = useCallback(async () => {
    if (!isVoiceEnabled) return;
    
    console.log('🎤 [VAD CONTROLS] Initializing VAD system...');
    setVadStatus('calibrating');
    
    try {
      const callbacks: VADCallbacks = {
        onVoiceStart: () => {
          console.log('🎤 [VAD] Voice activity started');
          setVadStatus('speaking');
        },
        onVoiceEnd: () => {
          console.log('🔇 [VAD] Voice activity ended');
          setVadStatus('silence');
        },
        onSilenceDetected: (duration) => {
          setSilenceDuration(duration);
        },
        onVolumeChange: (volume) => {
          setCurrentVolume(volume);
        },
        onAutoStop: (reason) => {
          console.log(`⏹️ [VAD] Auto-stop triggered: ${reason}`);
          stopRecording(reason);
        },
        onError: (error) => {
          console.error('❌ [VAD] Error:', error);
          setVadStatus('inactive');
        }
      };
      
      const vadInstance = new VoiceActivityDetector(vadConfig, callbacks);
      await vadInstance.initialize();
      
      setVad(vadInstance);
      setVadStatus('listening');
      
      // Update state with calibration results
      const state = vadInstance.getState();
      setBackgroundNoise(state.backgroundNoiseLevel);
      setAdaptiveThreshold(state.adaptiveThreshold);
      
      console.log('✅ [VAD CONTROLS] VAD initialized successfully');
      
    } catch (error) {
      console.error('❌ [VAD CONTROLS] Failed to initialize VAD:', error);
      setVadStatus('inactive');
    }
  }, [isVoiceEnabled, vadConfig]);

  /**
   * Start recording with VAD
   */
  const startRecording = useCallback(async () => {
    if (!vad || isRecording) return;
    
    console.log('🎤 [VAD CONTROLS] Starting recording...');
    setIsRecording(true);
    setRecordingDuration(0);
    recordingStartTime.current = Date.now();
    
    // Start recording duration timer
    recordingInterval.current = setInterval(() => {
      setRecordingDuration(Date.now() - recordingStartTime.current);
    }, 100);
    
    vad.startDetection();
    onRecordingStart?.();
    
  }, [vad, isRecording, onRecordingStart]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback((reason: 'manual' | 'silence' | 'maxDuration' | 'lowEnergy' = 'manual') => {
    if (!vad || !isRecording) return;
    
    console.log(`⏹️ [VAD CONTROLS] Stopping recording: ${reason}`);
    setIsRecording(false);
    setVadStatus('listening');
    setSilenceDuration(0);
    setRecordingDuration(0);
    
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
    
    vad.stopDetection();
    onRecordingStop?.(reason);
    
  }, [vad, isRecording, onRecordingStop]);

  /**
   * Update VAD configuration
   */
  const updateVADConfig = useCallback((newConfig: Partial<VADConfig>) => {
    setVadConfig(prev => ({ ...prev, ...newConfig }));
    if (vad) {
      vad.updateConfig(newConfig);
    }
  }, [vad]);

  /**
   * Change VAD preset
   */
  const changeVADPreset = useCallback((preset: 'sensitive' | 'balanced' | 'noise-tolerant') => {
    setVadPreset(preset);
    const newConfig = createVAD(preset);
    updateVADConfig(newConfig);
  }, [updateVADConfig]);

  /**
   * Recalibrate VAD
   */
  const recalibrateVAD = useCallback(async () => {
    if (!vad) return;
    
    setVadStatus('calibrating');
    try {
      await vad.recalibrate();
      const state = vad.getState();
      setBackgroundNoise(state.backgroundNoiseLevel);
      setAdaptiveThreshold(state.adaptiveThreshold);
      setVadStatus('listening');
    } catch (error) {
      console.error('❌ [VAD] Recalibration failed:', error);
      setVadStatus('inactive');
    }
  }, [vad]);

  // Initialize VAD when voice is enabled
  useEffect(() => {
    if (isVoiceEnabled && !vad) {
      initializeVAD();
    } else if (!isVoiceEnabled && vad) {
      vad.dispose();
      setVad(null);
      setVadStatus('inactive');
    }
    
    return () => {
      if (vad) {
        vad.dispose();
      }
    };
  }, [isVoiceEnabled, vad, initializeVAD]);

  // Update VAD state display
  useEffect(() => {
    if (!vad) return;
    
    const interval = setInterval(() => {
      const state = vad.getState();
      setCurrentVolume(state.currentVolume);
      setBackgroundNoise(state.backgroundNoiseLevel);
      setAdaptiveThreshold(state.adaptiveThreshold);
    }, 100);
    
    return () => clearInterval(interval);
  }, [vad]);

  const getStatusColor = () => {
    switch (vadStatus) {
      case 'calibrating': return 'bg-yellow-500';
      case 'listening': return 'bg-green-500';
      case 'speaking': return 'bg-blue-500';
      case 'silence': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (vadStatus) {
      case 'calibrating': return 'Calibrating...';
      case 'listening': return 'Ready';
      case 'speaking': return 'Voice Active';
      case 'silence': return 'Silence Detected';
      default: return 'Inactive';
    }
  };

  const formatDuration = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Controls */}
      <div className="flex items-center gap-4">
        {/* Voice Toggle */}
        <Button
          variant={isVoiceEnabled ? "default" : "outline"}
          size="lg"
          onClick={onVoiceToggle}
          className="flex items-center gap-2"
        >
          {isVoiceEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          {isVoiceEnabled ? 'Voice On' : 'Voice Off'}
        </Button>

        {/* Recording Button */}
        {isVoiceEnabled && (
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="lg"
            onClick={isRecording ? () => stopRecording('manual') : startRecording}
            disabled={vadStatus === 'inactive' || vadStatus === 'calibrating'}
            className="flex items-center gap-2"
          >
            {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            {isRecording ? 'Stop' : 'Record'}
          </Button>
        )}

        {/* VAD Status */}
        {isVoiceEnabled && (
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
        )}

        {/* Settings Toggle */}
        {isVoiceEnabled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Volume Control */}
      {isVoiceEnabled && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {audioVolume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-sm min-w-[3ch]">{Math.round(audioVolume * 100)}%</span>
          </div>
          <Slider
            value={[audioVolume]}
            onValueChange={(value) => onVolumeChange(value[0])}
            max={1}
            step={0.1}
            className="flex-1"
          />
        </div>
      )}

      {/* Real-time Metrics */}
      {isVoiceEnabled && vadStatus !== 'inactive' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Current Volume</Label>
            <Progress value={currentVolume * 100} className="h-2" />
            <span className="text-xs text-muted-foreground">{(currentVolume * 100).toFixed(1)}%</span>
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs">Background Noise</Label>
            <Progress value={backgroundNoise * 1000} max={10} className="h-2" />
            <span className="text-xs text-muted-foreground">{backgroundNoise.toFixed(4)}</span>
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs">Threshold</Label>
            <Progress value={adaptiveThreshold * 100} className="h-2" />
            <span className="text-xs text-muted-foreground">{(adaptiveThreshold * 100).toFixed(1)}%</span>
          </div>
          
          {isRecording && (
            <div className="space-y-1">
              <Label className="text-xs">Recording</Label>
              <div className="text-sm font-mono">{formatDuration(recordingDuration)}</div>
              {silenceDuration > 0 && (
                <div className="text-xs text-orange-600">Silence: {formatDuration(silenceDuration)}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Advanced Settings */}
      {showSettings && isVoiceEnabled && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              VAD Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preset Selection */}
            <div className="space-y-2">
              <Label>Detection Preset</Label>
              <Select value={vadPreset} onValueChange={changeVADPreset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sensitive">Sensitive (Quiet environments)</SelectItem>
                  <SelectItem value="balanced">Balanced (Most environments)</SelectItem>
                  <SelectItem value="noise-tolerant">Noise Tolerant (Noisy environments)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Auto-stop Setting */}
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-stop">Auto-stop on silence</Label>
              <Switch
                id="auto-stop"
                checked={autoStopEnabled}
                onCheckedChange={(checked) => {
                  setAutoStopEnabled(checked);
                  updateVADConfig({ silenceDurationMs: checked ? 2000 : 30000 });
                }}
              />
            </div>

            {/* Threshold Controls */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Voice Threshold: {(vadConfig.voiceThreshold * 100).toFixed(1)}%</Label>
                <Slider
                  value={[vadConfig.voiceThreshold]}
                  onValueChange={(value) => updateVADConfig({ voiceThreshold: value[0] })}
                  max={0.2}
                  step={0.01}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Silence Duration: {vadConfig.silenceDurationMs}ms</Label>
                <Slider
                  value={[vadConfig.silenceDurationMs]}
                  onValueChange={(value) => updateVADConfig({ silenceDurationMs: value[0] })}
                  min={500}
                  max={5000}
                  step={100}
                  className="w-full"
                />
              </div>
            </div>

            {/* Recalibrate Button */}
            <Button
              variant="outline"
              onClick={recalibrateVAD}
              disabled={vadStatus === 'calibrating'}
              className="w-full flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Recalibrate Background Noise
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 