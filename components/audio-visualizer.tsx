"use client";

import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
  stream?: MediaStream | null;
}

export function AudioVisualizer({ isRecording, stream }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | undefined>(undefined);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const barsDataRef = useRef<number[][]>([]);

  useEffect(() => {
    if (!stream || !isRecording || !canvasRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Clear canvas if we stop recording
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')!;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyserRef.current = analyser;
    
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    
    // Set FFT size for appropriate number of bars
    analyser.fftSize = 64;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    dataArrayRef.current = dataArray;

    // Initialize bars data array for animation
    const totalBars = Math.floor(window.innerWidth / 9); // Increased spacing between bars
    barsDataRef.current = Array(totalBars).fill([]).map(() => [0, 0]); // [height, opacity]
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // For high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      // Clear the canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Calculate new bar data
      const barWidth = 2; // Slightly wider bars
      const barGap = 5; // More space between bars
      const totalWidth = rect.width;
      const maxBars = Math.floor(totalWidth / (barWidth + barGap));
      
      // Shift existing bars left
      for (let i = 0; i < barsDataRef.current.length - 1; i++) {
        barsDataRef.current[i] = [...barsDataRef.current[i + 1]];
      }

      // Add new bar data with more responsive activity detection
      const averageFrequency = Array.from(dataArray)
        .slice(0, 25) // Focus on fewer frequency bands for more concentrated response
        .reduce((sum, value) => sum + value, 0) / 25;
      
      // More dramatic scaling for voice activity
      const activityThreshold = 20; // Minimum threshold for activity
      const normalizedHeight = averageFrequency > activityThreshold
        ? Math.min(rect.height / 2 - 4, Math.pow(averageFrequency / 255, 3) * 175)
        : 1; // Very low when no activity

      barsDataRef.current[barsDataRef.current.length - 1] = [
        Math.max(1, normalizedHeight),
        1
      ];

      // Draw all bars
      for (let i = 0; i < barsDataRef.current.length; i++) {
        const [height, opacity] = barsDataRef.current[i];
        const x = i * (barWidth + barGap);

        if (x > totalWidth) break;

        // Fade out inactive bars more quickly
        const fadeOpacity = height <= 2 ? 0.3 : opacity;
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
        const barHeight = Math.min(height * 2, rect.height - 8);
        ctx.fillRect(
          x,
          (rect.height - barHeight) / 2,
          barWidth,
          barHeight
        );
      }
    };
    
    draw();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      source.disconnect();
      audioContext.close();
    };
  }, [isRecording, stream]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const totalBars = Math.floor(window.innerWidth / 15); // Match the new spacing
        barsDataRef.current = Array(totalBars).fill([]).map(() => [0, 0]);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-10 rounded-lg"
      width={300}
      height={64}
    />
  );
} 