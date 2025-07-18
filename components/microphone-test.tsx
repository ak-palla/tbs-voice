"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2 } from 'lucide-react';

export function MicrophoneTest() {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [maxLevel, setMaxLevel] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check for browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      setError('Your browser does not support microphone access');
    }
    
    return () => {
      stopListening();
    };
  }, []);

  const startListening = async () => {
    try {
      setError(null);
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });
      
      streamRef.current = stream;
      
      // Create audio context and analyser
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      // Connect microphone to analyser
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      setIsListening(true);
      
      // Start monitoring audio levels
      monitorAudioLevel();
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopListening = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    setIsListening(false);
    setAudioLevel(0);
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      
      const average = sum / bufferLength;
      const normalizedLevel = (average / 255) * 100;
      
      setAudioLevel(normalizedLevel);
      setMaxLevel(prev => Math.max(prev, normalizedLevel));
      
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };

  const resetMaxLevel = () => {
    setMaxLevel(0);
  };

  const getLevelColor = (level: number) => {
    if (level < 10) return 'bg-red-500'; // Too quiet
    if (level < 30) return 'bg-yellow-500'; // Acceptable
    if (level < 70) return 'bg-green-500'; // Good
    return 'bg-blue-500'; // Loud
  };

  const getLevelText = (level: number) => {
    if (level < 10) return 'Too Quiet - Speak Louder';
    if (level < 30) return 'Acceptable Volume';
    if (level < 70) return 'Good Volume - Perfect!';
    return 'Very Loud - Can Be Softer';
  };

  if (!isSupported) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MicOff className="h-5 w-5" />
            Microphone Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Microphone Level Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        
        <Button
          onClick={isListening ? stopListening : startListening}
          variant={isListening ? "destructive" : "default"}
          className="w-full"
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Stop Test
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Start Microphone Test
            </>
          )}
        </Button>

        {isListening && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Current Level:</span>
                <span>{audioLevel.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-75 ${getLevelColor(audioLevel)}`}
                  style={{ width: `${Math.min(audioLevel, 100)}%` }}
                />
              </div>
              <p className="text-xs mt-1 text-center">
                {getLevelText(audioLevel)}
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Peak Level:</span>
                <span>{maxLevel.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getLevelColor(maxLevel)}`}
                  style={{ width: `${Math.min(maxLevel, 100)}%` }}
                />
              </div>
              <Button
                onClick={resetMaxLevel}
                variant="ghost"
                size="sm"
                className="w-full mt-1 text-xs"
              >
                Reset Peak
              </Button>
            </div>

            <div className="bg-blue-50 p-3 rounded text-sm">
              <p className="font-semibold mb-1">For best voice AI results:</p>
              <ul className="text-xs space-y-1">
                <li>• Keep level between 30-70% (green zone)</li>
                <li>• Speak clearly and at normal pace</li>
                <li>• Reduce background noise</li>
                <li>• Hold device steady while recording</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}