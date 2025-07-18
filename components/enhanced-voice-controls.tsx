/**
 * Enhanced Voice Controls Component
 * Provides comprehensive audio playback controls for both Deepgram and Browser TTS
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Square as Stop, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  FastForward as SkipForward,
  Rewind as SkipBack
} from 'lucide-react';
import { enhancedAudioHandler } from '@/lib/enhanced-audio-handler';

interface AudioControlState {
  isPlaying: boolean;
  isPaused: boolean;
  duration: number;
  currentTime: number;
  volume: number;
}

interface EnhancedVoiceControlsProps {
  messageId?: string;
  audioUrl?: string;
  audioData?: string;
  text?: string;
  accent?: 'US' | 'UK';
  gender?: 'female' | 'male';
  service?: 'deepgram' | 'browser';
  useBrowserTTS?: boolean;
  className?: string;
  showProgressBar?: boolean;
  showVolumeControl?: boolean;
  showStopButton?: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: string) => void;
  sharedAudioRef?: React.RefObject<HTMLAudioElement>;
}

export function EnhancedVoiceControls({
  messageId = 'default',
  audioUrl,
  audioData,
  text,
  accent = 'US',
  gender = 'female',
  service = 'deepgram',
  useBrowserTTS = false,
  className = '',
  showProgressBar = true,
  showVolumeControl = true,
  showStopButton = false,
  onPlayStart,
  onPlayEnd,
  onError,
  sharedAudioRef
}: EnhancedVoiceControlsProps) {
  const [controlState, setControlState] = useState<AudioControlState>({
    isPlaying: false,
    isPaused: false,
    duration: 0,
    currentTime: 0,
    volume: 1.0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1.0);

  // Register for audio control state updates and shared audio events
  useEffect(() => {
    const handleStateUpdate = (state: AudioControlState) => {
      setControlState(state);
    };

    enhancedAudioHandler.onControlStateUpdate(messageId, handleStateUpdate);

    // If we have a shared audio element, listen to its events
    if (sharedAudioRef?.current) {
      const audio = sharedAudioRef.current;
      console.log('🔧 [VOICE CONTROLS] Setting up shared audio event listeners');

      const updateState = () => {
        setControlState({
          isPlaying: !audio.paused && !audio.ended,
          isPaused: audio.paused && audio.currentTime > 0,
          duration: audio.duration || 0,
          currentTime: audio.currentTime || 0,
          volume: audio.volume || 1.0
        });
      };

      const handlePlay = () => {
        console.log('🔧 [VOICE CONTROLS] Shared audio play event');
        updateState();
      };

      const handlePause = () => {
        console.log('🔧 [VOICE CONTROLS] Shared audio pause event');
        updateState();
      };

      const handleTimeUpdate = () => {
        updateState();
      };

      const handleLoadedMetadata = () => {
        console.log('🔧 [VOICE CONTROLS] Shared audio metadata loaded');
        updateState();
      };

      const handleVolumeChange = () => {
        console.log('🔧 [VOICE CONTROLS] Shared audio volume changed');
        updateState();
      };

      // Add event listeners
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('volumechange', handleVolumeChange);
      audio.addEventListener('ended', handlePause);

      // Initial state update
      updateState();

      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('volumechange', handleVolumeChange);
        audio.removeEventListener('ended', handlePause);
        enhancedAudioHandler.offControlStateUpdate(messageId);
      };
    }

    return () => {
      enhancedAudioHandler.offControlStateUpdate(messageId);
    };
  }, [messageId, sharedAudioRef]);

  // Play audio
  const handlePlay = useCallback(async () => {
    console.log('🔧 [VOICE CONTROLS] handlePlay called');
    console.log('🔧 [VOICE CONTROLS] Props:', { text: !!text, audioUrl: !!audioUrl, audioData: !!audioData, service, useBrowserTTS, hasSharedAudio: !!sharedAudioRef });
    
    // If we have a shared audio element (for Deepgram), use that instead
    if (sharedAudioRef?.current && audioUrl) {
      console.log('🔧 [VOICE CONTROLS] Using shared audio element for Deepgram');
      const audio = sharedAudioRef.current;
      
      if (audio.src !== audioUrl) {
        audio.src = audioUrl;
      }
      
      try {
        await audio.play();
        onPlayStart?.();
        console.log('✅ [VOICE CONTROLS] Shared audio playing');
        return;
      } catch (error) {
        console.error('❌ [VOICE CONTROLS] Shared audio play failed:', error);
        onError?.(error instanceof Error ? error.message : String(error));
        return;
      }
    }
    
    if (!text && !audioUrl && !audioData) {
      console.error('❌ [VOICE CONTROLS] No audio content available');
      onError?.('No audio content available');
      return;
    }

    setIsLoading(true);
    console.log('🔧 [VOICE CONTROLS] Starting separate audio playback...');

    try {
      const audioOptions = {
        volume: controlState.volume,
        onStart: () => {
          setIsLoading(false);
          onPlayStart?.();
        },
        onEnd: () => {
          onPlayEnd?.();
        },
        onError: (error: string) => {
          setIsLoading(false);
          onError?.(error);
        }
      };

      if (useBrowserTTS || service === 'browser' || (!audioUrl && !audioData)) {
        // Use Browser TTS
        if (text) {
          await enhancedAudioHandler.playBrowserTTS(text, accent, gender, audioOptions);
        } else {
          throw new Error('No text available for Browser TTS');
        }
      } else {
        // Use Deepgram audio file
        const url = audioUrl || (audioData ? `data:audio/mp3;base64,${audioData}` : '');
        if (url) {
          await enhancedAudioHandler.playDeepgramAudio(audioData || '', url, audioOptions);
        } else {
          throw new Error('No audio URL or data available');
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error(`❌ [VOICE CONTROLS] Play failed:`, error);
      onError?.(error instanceof Error ? error.message : String(error));
    }
  }, [text, audioUrl, audioData, accent, gender, service, useBrowserTTS, controlState.volume, onPlayStart, onPlayEnd, onError]);

  // Pause audio
  const handlePause = useCallback(() => {
    console.log('🔧 [VOICE CONTROLS] handlePause called');
    try {
      if (sharedAudioRef?.current) {
        console.log('🔧 [VOICE CONTROLS] Pausing shared audio');
        sharedAudioRef.current.pause();
      } else {
        enhancedAudioHandler.pause();
      }
    } catch (error) {
      console.error('❌ [VOICE CONTROLS] Pause error:', error);
    }
  }, [sharedAudioRef]);

  // Resume audio
  const handleResume = useCallback(() => {
    console.log('🔧 [VOICE CONTROLS] handleResume called');
    try {
      if (sharedAudioRef?.current) {
        console.log('🔧 [VOICE CONTROLS] Resuming shared audio');
        sharedAudioRef.current.play();
      } else {
        enhancedAudioHandler.resume();
      }
    } catch (error) {
      console.error('❌ [VOICE CONTROLS] Resume error:', error);
    }
  }, [sharedAudioRef]);

  // Stop audio
  const handleStop = useCallback(() => {
    if (useBrowserTTS && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setControlState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        currentTime: 0
      }));
      onPlayEnd?.();
    } else if (sharedAudioRef?.current) {
      sharedAudioRef.current.pause();
      sharedAudioRef.current.currentTime = 0;
    }
  }, [useBrowserTTS, sharedAudioRef, onPlayEnd]);

  // Replay from beginning
  const handleReplay = useCallback(() => {
    console.log('🔧 [VOICE CONTROLS] handleReplay called');
    try {
      if (sharedAudioRef?.current) {
        console.log('🔧 [VOICE CONTROLS] Replaying shared audio from beginning');
        sharedAudioRef.current.currentTime = 0;
        if (!controlState.isPlaying && !controlState.isPaused) {
          sharedAudioRef.current.play();
        }
      } else {
        enhancedAudioHandler.seekTo(0);
        if (!controlState.isPlaying) {
          handlePlay();
        }
      }
    } catch (error) {
      console.error('❌ [VOICE CONTROLS] Replay error:', error);
    }
  }, [controlState.isPlaying, controlState.isPaused, handlePlay, sharedAudioRef]);

  // Skip forward
  const handleSkipForward = useCallback(() => {
    const newTime = Math.min(controlState.duration, controlState.currentTime + 10);
    console.log('🔧 [VOICE CONTROLS] handleSkipForward called, newTime:', newTime);
    try {
      if (sharedAudioRef?.current) {
        console.log('🔧 [VOICE CONTROLS] Skipping forward in shared audio');
        sharedAudioRef.current.currentTime = newTime;
      } else {
        enhancedAudioHandler.seekTo(newTime);
      }
    } catch (error) {
      console.error('❌ [VOICE CONTROLS] Skip forward error:', error);
    }
  }, [controlState.currentTime, controlState.duration, sharedAudioRef]);

  // Skip backward
  const handleSkipBack = useCallback(() => {
    const newTime = Math.max(0, controlState.currentTime - 10);
    console.log('🔧 [VOICE CONTROLS] handleSkipBack called, newTime:', newTime);
    try {
      if (sharedAudioRef?.current) {
        console.log('🔧 [VOICE CONTROLS] Skipping backward in shared audio');
        sharedAudioRef.current.currentTime = newTime;
      } else {
        enhancedAudioHandler.seekTo(newTime);
      }
    } catch (error) {
      console.error('❌ [VOICE CONTROLS] Skip backward error:', error);
    }
  }, [controlState.currentTime, sharedAudioRef]);

  // Handle volume change
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0] / 100; // Convert from 0-100 to 0-1 for HTML media element
    console.log('🔧 [VOICE CONTROLS] handleVolumeChange called, slider value:', value[0], 'converted volume:', newVolume);
    
    setControlState(prev => ({ ...prev, volume: newVolume }));
    
    try {
      if (sharedAudioRef?.current) {
        console.log('🔧 [VOICE CONTROLS] Setting shared audio volume');
        sharedAudioRef.current.volume = newVolume;
      } else {
        enhancedAudioHandler.setVolume(newVolume);
      }
    } catch (error) {
      console.error('❌ [VOICE CONTROLS] Volume change error:', error);
    }
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
      setPreviousVolume(newVolume);
    }
  }, [sharedAudioRef]);

  // Toggle mute
  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      const newVolume = previousVolume > 0 ? previousVolume * 100 : 50; // Convert to 0-100 range
      handleVolumeChange([newVolume]);
    } else {
      setPreviousVolume(controlState.volume);
      handleVolumeChange([0]);
    }
  }, [isMuted, previousVolume, controlState.volume, handleVolumeChange]);

  // Handle progress change
  const handleProgressChange = useCallback((value: number[]) => {
    const newTime = (value[0] / 100) * controlState.duration;
    console.log('🔧 [VOICE CONTROLS] handleProgressChange called, newTime:', newTime);
    
    try {
      if (sharedAudioRef?.current) {
        console.log('🔧 [VOICE CONTROLS] Seeking shared audio to new time');
        sharedAudioRef.current.currentTime = newTime;
      } else {
        enhancedAudioHandler.seekTo(newTime);
      }
    } catch (error) {
      console.error('❌ [VOICE CONTROLS] Progress change error:', error);
    }
  }, [controlState.duration, sharedAudioRef]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = controlState.duration > 0 
    ? (controlState.currentTime / controlState.duration) * 100 
    : 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={controlState.isPlaying ? handlePause : handlePlay}
        disabled={isLoading}
        className="h-8 w-8 p-0"
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        ) : controlState.isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      {/* Stop Button - Only show for Browser TTS or when explicitly requested */}
      {showStopButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStop}
          disabled={isLoading || (!controlState.isPlaying && !controlState.isPaused)}
          className="h-8 w-8 p-0"
        >
          <Stop className="h-4 w-4" />
        </Button>
      )}

      {/* Replay Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReplay}
        className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
        title="Replay from beginning"
      >
        <RotateCcw className="h-4 w-4 text-gray-600" />
      </Button>

      {/* Skip Controls (only show if audio is playing and has duration) */}
      {controlState.duration > 0 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkipBack}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            title="Skip back 10s"
          >
            <SkipBack className="h-4 w-4 text-gray-600" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkipForward}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            title="Skip forward 10s"
          >
            <SkipForward className="h-4 w-4 text-gray-600" />
          </Button>
        </>
      )}

      {/* Progress Bar */}
      {showProgressBar && controlState.duration > 0 && (
        <div className="flex-1">
          <Slider
            value={[controlState.currentTime]}
            max={controlState.duration}
            step={0.1}
            onValueChange={handleProgressChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(controlState.currentTime)}</span>
            <span>{formatTime(controlState.duration)}</span>
          </div>
        </div>
      )}

      {/* Volume Control */}
      {showVolumeControl && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMuteToggle}
            className="h-8 w-8 p-0"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : controlState.volume * 100]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      )}

      {/* Audio Info Badge */}
      {service && (
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          service === 'deepgram' 
            ? 'bg-blue-100 text-blue-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {service === 'deepgram' ? 'DG' : 'TTS'}
        </div>
      )}
    </div>
  );
}

export default EnhancedVoiceControls;