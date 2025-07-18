/**
 * Enhanced Voice Demo Component
 * Demonstrates the complete TTS integration with WebSocket
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react';
import { WebSocketVoiceClient } from '@/lib/websocket-client';
import { EnhancedVoiceControls } from './enhanced-voice-controls';

interface DemoMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  audioData?: string;
  service?: 'deepgram' | 'browser';
  useBrowserTTS?: boolean;
}

export function EnhancedVoiceDemo() {
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [autoAudioEnabled, setAutoAudioEnabled] = useState(true);
  const [accent, setAccent] = useState<'US' | 'UK'>('US');
  const [gender, setGender] = useState<'female' | 'male'>('female');
  
  const wsClient = useRef<WebSocketVoiceClient | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Initialize WebSocket client
  useEffect(() => {
    const client = new WebSocketVoiceClient({
      onConnected: () => {
        console.log('🔌 Demo: WebSocket connected');
        setIsConnected(true);
      },
      onDisconnected: () => {
        console.log('🔌 Demo: WebSocket disconnected');
        setIsConnected(false);
      },
      onTranscription: (data) => {
        console.log('🎤 Demo: Transcription received:', data);
        if (data.text) {
          addMessage('user', data.text);
        }
      },
      onAIChunk: (data) => {
        console.log('🤖 Demo: AI chunk received:', data);
        // Handle streaming AI response
        updateLastAssistantMessage(data.fullText || data.chunk);
      },
      onTTSAudio: (data) => {
        console.log('🎵 Demo: TTS audio received:', data);
        if (data.complete && (data.audioData || data.audioUrl)) {
          updateLastAssistantMessageAudio(data.audioUrl || `data:audio/${data.format};base64,${data.audioData}`, 'deepgram');
        }
      },
      onTTSFallback: (data) => {
        console.log('🌐 Demo: TTS fallback received:', data);
        if (data.useBrowserTTS) {
          updateLastAssistantMessageAudio('', 'browser', true);
        }
      },
      onError: (error) => {
        console.error('❌ Demo: WebSocket error:', error);
      }
    });

    wsClient.current = client;

    // Connect to WebSocket
    client.connect().catch(console.error);

    // Enable auto audio playback
    client.setAutoAudioPlayback(autoAudioEnabled);

    return () => {
      client.disconnect();
    };
  }, [autoAudioEnabled]);

  // Add message to chat
  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: DemoMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  // Update last assistant message
  const updateLastAssistantMessage = (content: string) => {
    setMessages(prev => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
        updated[lastIndex].content = content;
      } else {
        updated.push({
          id: `msg-${Date.now()}-${Math.random()}`,
          role: 'assistant',
          content
        });
      }
      return updated;
    });
  };

  // Update last assistant message with audio
  const updateLastAssistantMessageAudio = (audioUrl: string, service: 'deepgram' | 'browser', useBrowserTTS = false) => {
    setMessages(prev => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
        updated[lastIndex].audioUrl = audioUrl;
        updated[lastIndex].service = service;
        updated[lastIndex].useBrowserTTS = useBrowserTTS;
      }
      return updated;
    });
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = async () => {
          const audioData = reader.result as string;
          if (wsClient.current && isConnected) {
            await wsClient.current.processVoice(audioData, 'demo-user', '', accent, gender, [], undefined, true);
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('❌ Demo: Failed to start recording:', error);
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  // Send text message
  const sendTextMessage = async () => {
    if (!inputText.trim() || !wsClient.current || !isConnected) return;

    addMessage('user', inputText);
    
    // For demo, simulate processing text message through WebSocket
    // In real implementation, this would be handled by the WebSocket API
    const mockAudioData = ''; // Would be base64 audio from WebSocket
          await wsClient.current.processVoice(mockAudioData, 'demo-user', inputText, accent, gender, [], undefined, true);
    
    setInputText('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Enhanced Voice AI Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected to WebSocket' : 'Disconnected'}
            </span>
          </div>

          {/* Settings */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Accent:</label>
              <select 
                value={accent} 
                onChange={(e) => setAccent(e.target.value as 'US' | 'UK')}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="US">US</option>
                <option value="UK">UK</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Gender:</label>
              <select 
                value={gender} 
                onChange={(e) => setGender(e.target.value as 'female' | 'male')}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoAudioEnabled(!autoAudioEnabled)}
              className="flex items-center gap-1"
            >
              {autoAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              Auto Play
            </Button>
          </div>

          {/* Input Area */}
          <div className="flex items-center gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message or use voice..."
              onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
              className="flex-1"
            />
            <Button onClick={sendTextMessage} disabled={!inputText.trim() || !isConnected}>
              <Send className="h-4 w-4" />
            </Button>
            <Button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={!isConnected}
              className={`${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>

          {/* Messages */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  
                  {/* Enhanced Voice Controls for Assistant Messages */}
                  {message.role === 'assistant' && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <EnhancedVoiceControls
                        messageId={message.id}
                        audioUrl={message.audioUrl}
                        text={message.content}
                        accent={accent}
                        gender={gender}
                        service={message.service}
                        useBrowserTTS={message.useBrowserTTS}
                        className="w-full"
                        showProgressBar={!!message.audioUrl}
                        showVolumeControl={true}
                        onPlayStart={() => console.log(`🎵 Playing demo message ${message.id}`)}
                        onPlayEnd={() => console.log(`🎵 Finished demo message ${message.id}`)}
                        onError={(error) => console.error(`❌ Demo audio error:`, error)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EnhancedVoiceDemo;