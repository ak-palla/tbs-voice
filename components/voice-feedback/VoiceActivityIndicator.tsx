'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceState } from '@/hooks/useVoiceFeedback';

interface VoiceActivityIndicatorProps {
  state: VoiceState;
  audioLevel: number;
  stream?: MediaStream | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showWaveform?: boolean;
  showIcon?: boolean;
}

export function VoiceActivityIndicator({
  state,
  audioLevel,
  stream,
  className = '',
  size = 'md',
  showWaveform = true,
  showIcon = true
}: VoiceActivityIndicatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | undefined>(undefined);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const barsDataRef = useRef<number[][]>([]);

  // Size configurations
  const sizeConfig = {
    sm: { 
      height: 32, 
      width: 120, 
      iconSize: 16, 
      barWidth: 1.5, 
      barGap: 3,
      maxBars: 25 
    },
    md: { 
      height: 40, 
      width: 150, 
      iconSize: 20, 
      barWidth: 2, 
      barGap: 4,
      maxBars: 30 
    },
    lg: { 
      height: 48, 
      width: 200, 
      iconSize: 24, 
      barWidth: 2.5, 
      barGap: 5,
      maxBars: 35 
    }
  };

  const config = sizeConfig[size];

  // State-based colors and animations
  const getStateStyle = useCallback(() => {
    switch (state) {
      case 'listening':
        return {
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          pulseColor: 'bg-blue-400',
          waveColor: 'rgba(59, 130, 246, 0.7)', // blue-500
          animation: 'animate-pulse'
        };
      case 'recording':
        return {
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          pulseColor: 'bg-red-400',
          waveColor: 'rgba(239, 68, 68, 0.8)', // red-500
          animation: 'animate-pulse'
        };
      case 'processing':
        return {
          color: 'text-purple-500',
          bgColor: 'bg-purple-100',
          pulseColor: 'bg-purple-400',
          waveColor: 'rgba(147, 51, 234, 0.7)', // purple-500
          animation: 'animate-bounce'
        };
      case 'thinking':
        return {
          color: 'text-indigo-500',
          bgColor: 'bg-indigo-100',
          pulseColor: 'bg-indigo-400',
          waveColor: 'rgba(99, 102, 241, 0.7)', // indigo-500
          animation: 'animate-pulse'
        };
      case 'generating':
        return {
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          pulseColor: 'bg-green-400',
          waveColor: 'rgba(34, 197, 94, 0.7)', // green-500
          animation: 'animate-bounce'
        };
      case 'speaking':
        return {
          color: 'text-orange-500',
          bgColor: 'bg-orange-100',
          pulseColor: 'bg-orange-400',
          waveColor: 'rgba(249, 115, 22, 0.7)', // orange-500
          animation: 'animate-pulse'
        };
      case 'error':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          pulseColor: 'bg-red-500',
          waveColor: 'rgba(220, 38, 38, 0.8)', // red-600
          animation: 'animate-bounce'
        };
      default:
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-100',
          pulseColor: 'bg-gray-300',
          waveColor: 'rgba(156, 163, 175, 0.5)', // gray-400
          animation: ''
        };
    }
  }, [state]);

  const stateStyle = getStateStyle();

  // Enhanced waveform animation
  useEffect(() => {
    if (!showWaveform || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup canvas for high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = config.width * dpr;
    canvas.height = config.height * dpr;
    ctx.scale(dpr, dpr);

    // Initialize bars data
    barsDataRef.current = Array(config.maxBars).fill([]).map(() => [0, 0]);

    // Setup audio analysis if stream is available
    if (stream && (state === 'listening' || state === 'recording')) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;
        
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        
        analyser.fftSize = 128;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        dataArrayRef.current = dataArray;
      } catch (error) {
        console.warn('Error setting up audio analysis:', error);
      }
    }

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      
      ctx.clearRect(0, 0, config.width, config.height);

      let averageFrequency = audioLevel * 255;

      // Get real audio data if available
      if (analyserRef.current && dataArrayRef.current && (state === 'listening' || state === 'recording')) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        averageFrequency = Array.from(dataArrayRef.current)
          .slice(0, 20)
          .reduce((sum, value) => sum + value, 0) / 20;
      } else if (state === 'processing' || state === 'thinking' || state === 'generating') {
        // Simulate processing activity
        averageFrequency = 30 + Math.sin(Date.now() * 0.005) * 20 + Math.random() * 15;
      } else if (state === 'speaking') {
        // Simulate speaking activity
        averageFrequency = 40 + Math.sin(Date.now() * 0.008) * 30 + Math.random() * 25;
      }

      // Shift bars left
      for (let i = 0; i < barsDataRef.current.length - 1; i++) {
        barsDataRef.current[i] = [...barsDataRef.current[i + 1]];
      }

      // Add new bar data
      const activityThreshold = 15;
      const normalizedHeight = averageFrequency > activityThreshold
        ? Math.min(config.height * 0.8, Math.pow(averageFrequency / 255, 0.7) * config.height * 0.6)
        : 2;

      barsDataRef.current[barsDataRef.current.length - 1] = [
        Math.max(2, normalizedHeight),
        state === 'idle' ? 0.3 : 1
      ];

      // Draw bars
      for (let i = 0; i < barsDataRef.current.length; i++) {
        const [height, opacity] = barsDataRef.current[i];
        const x = i * (config.barWidth + config.barGap);

        if (x > config.width) break;

        const fadeOpacity = height <= 3 ? 0.3 : opacity;
        ctx.fillStyle = stateStyle.waveColor.replace(/[\d\.]+\)$/, `${fadeOpacity})`);
        
        const barHeight = Math.min(height, config.height - 4);
        ctx.fillRect(
          x,
          (config.height - barHeight) / 2,
          config.barWidth,
          barHeight
        );
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (analyserRef.current) {
        try {
          // Clean up audio context
          const audioContext = (analyserRef.current as any).context;
          if (audioContext && audioContext.state !== 'closed') {
            audioContext.close();
          }
        } catch (error) {
          console.warn('Error cleaning up audio context:', error);
        }
      }
    };
  }, [state, stream, audioLevel, showWaveform, config, stateStyle.waveColor]);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Microphone Icon */}
      {showIcon && (
        <div className="relative">
          <div className={cn(
            'flex items-center justify-center rounded-full p-2 transition-all duration-300',
            stateStyle.bgColor,
            stateStyle.animation
          )}>
            {state === 'error' ? (
              <MicOff className={cn('transition-colors duration-300', stateStyle.color)} size={config.iconSize} />
            ) : (
              <Mic className={cn('transition-colors duration-300', stateStyle.color)} size={config.iconSize} />
            )}
          </div>
          
          {/* Pulse rings for active states */}
          {(state === 'listening' || state === 'recording' || state === 'processing' || state === 'speaking') && (
            <>
              <div className={cn(
                'absolute inset-0 rounded-full animate-ping opacity-20',
                stateStyle.pulseColor
              )} />
              <div className={cn(
                'absolute inset-0 rounded-full animate-pulse opacity-10',
                stateStyle.pulseColor
              )} style={{ animationDelay: '0.5s' }} />
            </>
          )}
        </div>
      )}

      {/* Waveform Visualization */}
      {showWaveform && (
        <div className="flex-1 min-w-0">
          <canvas
            ref={canvasRef}
            className="w-full rounded-md"
            style={{ height: config.height }}
            width={config.width}
            height={config.height}
          />
        </div>
      )}
    </div>
  );
} 