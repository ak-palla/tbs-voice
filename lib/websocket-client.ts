/**
 * WebSocket Client for Ultra-Fast Voice AI
 * Handles real-time streaming communication with WebSocket server
 */

import { io, Socket } from 'socket.io-client';
import { enhancedAudioHandler } from './enhanced-audio-handler';

// Custom logger to avoid Next.js console.error interception
const wsLog = {
  info: (msg: string, ...args: any[]) => console.log(`🔵 ${msg}`, ...args),
  success: (msg: string, ...args: any[]) => console.log(`🟢 ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.log(`🟡 ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.log(`🔴 ${msg}`, ...args),
  debug: (msg: string, ...args: any[]) => console.log(`🔍 ${msg}`, ...args)
};

export interface VoiceStreamData {
  type: 'transcription' | 'context' | 'rag-update' | 'ai-chunk' | 'tts-audio' | 'tts-fallback' | 'complete' | 'error' | 'stream-chunk' | 'stream-complete';
  data: any;
  timestamp: number;
  sessionId: string;
}

export interface TextStreamData {
  type: 'chunk' | 'complete' | 'error';
  data: any;
  timestamp: number;
  sessionId: string;
}

export interface WebSocketClientCallbacks {
  onTranscription?: (data: any) => void;
  onContextUpdate?: (data: any) => void;
  onAIChunk?: (data: any) => void;
  onTTSAudio?: (data: any) => void;
  onTTSFallback?: (data: any) => void;
  onComplete?: (data: any) => void;
  onError?: (error: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onTitleUpdate?: (data: any) => void;
  onTextChunk?: (data: any) => void;
  onTextComplete?: (data: any) => void;
}

export class WebSocketVoiceClient {
  private socket: Socket | null = null;
  private callbacks: WebSocketClientCallbacks = {};
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  constructor(callbacks: WebSocketClientCallbacks = {}) {
    this.callbacks = callbacks;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    try {
      wsLog.info('[WS CLIENT] Connecting to WebSocket server...');

      // OPTIMIZATION 17: Improve WebSocket client connection efficiency
      this.socket = io('http://localhost:3000', {
        transports: ['websocket', 'polling'], // OPTIMIZED: Prefer websocket first for better performance
        timeout: 5000, // OPTIMIZED: Reduced from 10000ms to 5000ms
        autoConnect: true,
        forceNew: false, // OPTIMIZED: Reuse existing connection when possible
        reconnection: true,
        reconnectionAttempts: 2, // OPTIMIZED: Reduced from 3 to 2 for faster fallback
        reconnectionDelay: 500 // OPTIMIZED: Reduced from 1000ms to 500ms
      });

      this.setupEventHandlers();

      return new Promise((resolve, reject) => {
        if (!this.socket) return reject(new Error('Socket not initialized'));

        this.socket.on('connect', () => {
          wsLog.success('[WS CLIENT] Connected to WebSocket server');
          wsLog.success(`[WS CLIENT] Socket ID: ${this.socket?.id}`);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.callbacks.onConnected?.();
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ [WS CLIENT] Connection failed:', error);
          this.isConnected = false;
          reject(new Error('WebSocket connection failed'));
        });

        // OPTIMIZATION 18: Faster timeout fallback
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('WebSocket connection timeout - using HTTP fallback'));
          }
        }, 5000); // OPTIMIZED: Reduced from 10000ms to 5000ms
      });
    } catch (error) {
      console.error('❌ [WS CLIENT] Connection error:', error);
      throw error;
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Handle voice streaming data
    this.socket.on('voice-stream', (streamData: VoiceStreamData) => {
      console.log(`🔍 [WS CLIENT DEBUG] voice-stream received:`, streamData);
      console.log(`🔍 [WS CLIENT DEBUG] voice-stream type:`, streamData?.type);
      console.log(`🔍 [WS CLIENT DEBUG] voice-stream data:`, streamData?.data);
      console.log(`🔍 [WS CLIENT DEBUG] voice-stream keys:`, Object.keys(streamData || {}));
      
      // Extra detailed logging for debugging
      if (streamData?.type === 'tts-audio') {
        console.log(`🔍 [WS CLIENT DEBUG] TTS audio data keys:`, Object.keys(streamData.data || {}));
        console.log(`🔍 [WS CLIENT DEBUG] TTS audio data:`, streamData.data);
      }
      wsLog.info(`[WS CLIENT] Received voice-stream event:`, streamData);
      
      switch (streamData.type) {
        case 'transcription':
          console.log(`🔍 [WS DEBUG] Matched transcription case, calling callback`);
          this.callbacks.onTranscription?.(streamData.data);
          break;
        case 'context':
          console.log(`🔍 [WS DEBUG] Matched context case, calling callback`);
          this.callbacks.onContextUpdate?.(streamData.data);
          break;
        case 'ai-chunk':
          console.log(`🔍 [WS DEBUG] Matched ai-chunk case, calling callback`);
          this.callbacks.onAIChunk?.(streamData.data);
          break;
        case 'tts-audio':
          console.log(`🔍 [WS DEBUG] Matched tts-audio case, calling callback`);
          this.callbacks.onTTSAudio?.(streamData.data);
          break;
        case 'tts-fallback':
          console.log(`🔍 [WS DEBUG] Matched tts-fallback case, calling callback`);
          console.log(`🔍 [WS DEBUG] Callback exists:`, !!this.callbacks.onTTSFallback);
          console.log(`🔍 [WS DEBUG] Callback type:`, typeof this.callbacks.onTTSFallback);
          console.log(`🔍 [WS DEBUG] TTS fallback data:`, streamData.data);
          if (this.callbacks.onTTSFallback) {
            console.log(`🔍 [WS DEBUG] CALLING onTTSFallback callback now...`);
            this.callbacks.onTTSFallback(streamData.data);
            console.log(`🔍 [WS DEBUG] onTTSFallback callback completed`);
          } else {
            console.log(`❌ [WS DEBUG] onTTSFallback callback is missing!`);
          }
          break;
        case 'complete':
          console.log(`🔍 [WS DEBUG] Matched complete case, calling callback`);
          this.callbacks.onComplete?.(streamData.data);
          break;
        case 'error':
          console.log(`🔍 [WS DEBUG] Matched error case, calling callback`);
          this.callbacks.onError?.(streamData.data.error);
          break;
        default:
          console.log(`🔍 [WS DEBUG] No case matched for type: "${streamData.type}"`);
      }
    });

    // Handle direct events with detailed debugging
    this.socket.on('voice-started', (data) => {
      // Use multiple logging methods to bypass Next.js interception
      console.log('🟢 [WS CLIENT] voice-started raw data:', data);
      console.log('🟢 [WS CLIENT] voice-started keys:', Object.keys(data || {}));
      console.log('🟢 [WS CLIENT] voice-started type:', typeof data);
      console.log('🟢 [WS CLIENT] voice-started stringified:', JSON.stringify(data));
      wsLog.info(`[WS CLIENT] Received voice-started:`, data);
    });

    this.socket.on('voice-complete', (data) => {
      console.log('🟢 [WS CLIENT] voice-complete raw data:', data);
      console.log('🟢 [WS CLIENT] voice-complete keys:', Object.keys(data || {}));
      wsLog.info(`[WS CLIENT] Received voice-complete:`, data);
      this.callbacks.onComplete?.(data);
    });

    this.socket.on('voice-error', (data) => {
      console.error('❌ [WS CLIENT] Received voice-error:', data);
      this.callbacks.onError?.(data?.error || data || 'Unknown WebSocket error');
    });

    // Handle connection test from server
    this.socket.on('connection-test', (data) => {
      console.log('🟢 [WS CLIENT] CONNECTION TEST received:', data);
      console.log('🟢 [WS CLIENT] CONNECTION TEST keys:', Object.keys(data || {}));
      console.log('🟢 [WS CLIENT] CONNECTION TEST stringified:', JSON.stringify(data));
    });

    // 🚀 REAL-TIME TITLE UPDATES: Handle title updates from server
    this.socket.on('title-updated', (data) => {
      console.log('🏷️ [WS CLIENT] Title updated received:', data);
      this.callbacks.onTitleUpdate?.(data);
    });

    // Listen for ALL events for debugging
    this.socket.onAny((eventName, ...args) => {
      wsLog.info(`[WS CLIENT] Received ANY event: ${eventName}`, args);
      
      // Validate payload structure
      if (args.length === 0) {
        wsLog.error(`[WS CLIENT] Event ${eventName} has NO arguments!`);
      } else {
        args.forEach((arg, index) => {
          if (arg === null || arg === undefined) {
            wsLog.error(`[WS CLIENT] Event ${eventName} arg[${index}] is null/undefined`);
          } else if (typeof arg === 'object' && Object.keys(arg).length === 0) {
            wsLog.error(`[WS CLIENT] Event ${eventName} arg[${index}] is empty object {}`);
          } else {
            wsLog.success(`[WS CLIENT] Event ${eventName} arg[${index}] is valid:`, typeof arg, Object.keys(arg || {}));
          }
        });
      }
    });

    // Handle connection events
    this.socket.on('disconnect', (reason) => {
      console.log(`🔌 [WS CLIENT] Disconnected: ${reason}`);
      this.isConnected = false;
      this.callbacks.onDisconnected?.();
      
      // Auto-reconnect on unexpected disconnection
      if (reason === 'io server disconnect') {
        this.attemptReconnect();
      }
    });

    this.socket.on('reconnect', () => {
      console.log('🔄 [WS CLIENT] Reconnected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.callbacks.onConnected?.();
    });

    // Keep-alive ping
    this.socket.on('pong', (data) => {
      console.log(`💓 [WS CLIENT] Pong received: ${data.timestamp}`);
    });
  }

  /**
   * Process voice input via WebSocket streaming
   */
  async processVoice(audioData: string, userId: string, query?: string, accent: string = 'US', gender: string = 'female', history?: any[], instanceId?: string, generateTTS: boolean = true): Promise<void> {
    wsLog.debug(`[WS CLIENT DEBUG] Socket exists: ${!!this.socket}`);
    wsLog.debug(`[WS CLIENT DEBUG] Is connected: ${this.isConnected}`);
    wsLog.debug(`[WS CLIENT DEBUG] Socket connected: ${this.socket?.connected}`);
    wsLog.debug(`[WS CLIENT DEBUG] Socket id: ${this.socket?.id}`);

    if (!this.socket || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    wsLog.info('[WS CLIENT] Starting voice processing...');
    wsLog.info('[WS CLIENT] Emitting voice-process event...');

    const payload = {
      audio: audioData,
      userId,
      query: query || '',
      accent,
      gender,
      history: history || [],
      instanceId: instanceId || null,
      generateTTS,
      timestamp: Date.now()
    };

    // Validate payload before sending
    wsLog.debug('[WS CLIENT] Emitting payload:', {
      audioLength: audioData?.length || 0,
      userId: userId || 'MISSING',
      query: query || 'EMPTY',
      instanceId: instanceId || 'NONE',
      generateTTS,
      timestamp: payload.timestamp,
      payloadKeys: Object.keys(payload)
    });

    this.socket.emit('voice-process', payload);
    wsLog.success('[WS CLIENT] voice-process event emitted');
  }

  /**
   * Send text message via WebSocket for processing
   */
  async sendMessage(
    text: string,
    generateTTS: boolean = false,
    userId?: string,
    accent: string = 'US',
    gender: string = 'female',
    history?: any[],
    instanceId?: string
  ): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    try {
      // Generate unique session ID for tracking
      const sessionId = `text-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      // Format history for the model
      const formattedHistory = history?.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      // Prepare payload
      const payload = {
        type: 'text',
        text,
        userId,
        accent,
        gender,
        history: formattedHistory,
        instanceId,
        sessionId,
        generateTTS,
        timestamp: Date.now()
      };

      // Send message
      this.socket.emit('text-process', payload);

      wsLog.info(`[WS CLIENT] Sent text message:`, {
        sessionId,
        textLength: text.length,
        timestamp: Date.now()
      });

      // Return a promise that resolves when streaming is complete
      return new Promise((resolve, reject) => {
        let timeout: NodeJS.Timeout;
        const socket = this.socket;

        if (!socket) {
          reject(new Error('WebSocket not connected'));
          return;
        }

        // Set timeout for initial response
        timeout = setTimeout(() => {
          socket.off('text-stream');
          reject(new Error('WebSocket response timeout'));
        }, 30000); // 30s for initial response

        // Listen for text stream events
        const handleTextStream = (streamData: TextStreamData) => {
          console.log('🔍 [WS CLIENT DEBUG] Received text-stream event:', streamData.type, streamData);
          
          // Reset timeout on each chunk
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            socket.off('text-stream', handleTextStream);
            reject(new Error('WebSocket stream timeout'));
          }, 15000); // 15s for stream chunks

          try {
            switch (streamData.type) {
              case 'chunk':
                wsLog.info(`[WS CLIENT] Received text chunk: ${streamData.data.content.length} chars`);
                this.callbacks.onTextChunk?.(streamData.data);
                break;

              case 'complete':
                console.log('🎯 [WS CLIENT DEBUG] Processing completion event, calling onTextComplete...');
                clearTimeout(timeout);
                socket.off('text-stream', handleTextStream);
                wsLog.success(`[WS CLIENT] Text stream complete: ${streamData.data.content.length} total chars`);
                console.log('🔍 [WS CLIENT DEBUG] onTextComplete callback exists:', !!this.callbacks.onTextComplete);
                this.callbacks.onTextComplete?.(streamData.data);
                console.log('✅ [WS CLIENT DEBUG] onTextComplete callback called, resolving promise...');
                resolve();
                break;

              case 'error':
                clearTimeout(timeout);
                socket.off('text-stream', handleTextStream);
                const errorMsg = streamData.data.error || 'Unknown error';
                wsLog.error(`[WS CLIENT] Text stream error: ${errorMsg}`);
                this.callbacks.onError?.(errorMsg);
                reject(new Error(errorMsg));
                break;

              default:
                wsLog.debug(`[WS CLIENT] Ignoring text stream event: ${streamData.type}`);
            }
          } catch (error) {
            wsLog.error(`[WS CLIENT] Error handling text stream event:`, error);
            clearTimeout(timeout);
            socket.off('text-stream', handleTextStream);
            reject(error);
          }
        };

        socket.on('text-stream', handleTextStream);
      });

    } catch (error) {
      console.error('❌ [WS CLIENT] Failed to send text message:', error);
      throw error;
    }
  }

  /**
   * Trigger early TTS for immediate audio feedback
   */
  triggerEarlyTTS(text: string, sessionId: string): void {
    if (!this.socket || !this.isConnected) return;

    console.log('⚡ [WS CLIENT] Triggering early TTS');
    this.socket.emit('early-tts-trigger', {
      text,
      sessionId,
      timestamp: Date.now()
    });
  }

  /**
   * Send keep-alive ping
   */
  ping(): void {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('ping');
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ [WS CLIENT] Max reconnection attempts reached');
      this.callbacks.onError?.('Connection lost and unable to reconnect');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 [WS CLIENT] Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error(`❌ [WS CLIENT] Reconnection ${this.reconnectAttempts} failed:`, error?.message || error);
        this.attemptReconnect();
      });
    }, Math.min(2000 * this.reconnectAttempts, 10000)); // Exponential backoff with max 10s
  }

  /**
   * Update callbacks
   */
  updateCallbacks(newCallbacks: Partial<WebSocketClientCallbacks>): void {
    console.log('🔧 [WS CLIENT] Updating callbacks...');
    console.log('🔧 [WS CLIENT] Old callbacks keys:', Object.keys(this.callbacks));
    console.log('🔧 [WS CLIENT] New callbacks keys:', Object.keys(newCallbacks));
    console.log('🔧 [WS CLIENT] onTTSFallback before update:', !!this.callbacks.onTTSFallback);
    
    this.callbacks = { ...this.callbacks, ...newCallbacks };
    
    console.log('🔧 [WS CLIENT] onTTSFallback after update:', !!this.callbacks.onTTSFallback);
    console.log('🔧 [WS CLIENT] Final callbacks keys:', Object.keys(this.callbacks));
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): { connected: boolean; attempts: number } {
    return {
      connected: this.isConnected,
      attempts: this.reconnectAttempts
    };
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 [WS CLIENT] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Test WebSocket connection with a simple ping
   */
  async testConnection(): Promise<{ success: boolean; latency: number }> {
    if (!this.socket || !this.isConnected) {
      return { success: false, latency: -1 };
    }

    const startTime = Date.now();
    
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false, latency: -1 });

      // OPTIMIZATION 19: Faster connection test timeout
      const timeout = setTimeout(() => {
        resolve({ success: false, latency: -1 });
      }, 3000); // OPTIMIZED: Reduced from 5000ms to 3000ms

      this.socket.once('pong', () => {
        clearTimeout(timeout);
        const latency = Date.now() - startTime;
        resolve({ success: true, latency });
      });

      this.socket.emit('ping');
    });
  }

  /**
   * Handle TTS audio playback from WebSocket events
   */
  async handleTTSAudio(data: any): Promise<void> {
    try {
      console.log(`🎵 [WS CLIENT] Handling TTS audio:`, data);
      
      if (data.complete && (data.audioData || data.audioUrl)) {
        // Complete Deepgram audio file
        await enhancedAudioHandler.playDeepgramAudio(
          data.audioData || '',
          data.audioUrl || `data:audio/${data.format || 'mp3'};base64,${data.audioData}`,
          {
            volume: 1.0,
            onStart: () => console.log(`🎵 [WS CLIENT] Audio playback started`),
            onEnd: () => console.log(`🎵 [WS CLIENT] Audio playback completed`),
            onError: (error) => console.error(`❌ [WS CLIENT] Audio playback error:`, error)
          }
        );
      }
    } catch (error) {
      console.error(`❌ [WS CLIENT] TTS audio handling failed:`, error);
    }
  }

  /**
   * Handle TTS fallback to browser TTS
   */
  async handleTTSFallback(data: any): Promise<void> {
    try {
      console.log(`🌐 [WS CLIENT] Handling TTS fallback:`, data);
      
      if (data.useBrowserTTS && data.text) {
        await enhancedAudioHandler.playBrowserTTS(
          data.text,
          data.accent || 'US',
          data.gender || 'female',
          {
            volume: 1.0,
            onStart: () => console.log(`🌐 [WS CLIENT] Browser TTS playback started`),
            onEnd: () => console.log(`🌐 [WS CLIENT] Browser TTS playback completed`),
            onError: (error) => console.error(`❌ [WS CLIENT] Browser TTS error:`, error)
          }
        );
      }
    } catch (error) {
      console.error(`❌ [WS CLIENT] TTS fallback handling failed:`, error);
    }
  }

  /**
   * Auto-handle audio events when enabled
   */
  setAutoAudioPlayback(enabled: boolean): void {
    if (enabled) {
      this.updateCallbacks({
        onTTSAudio: (data) => this.handleTTSAudio(data),
        onTTSFallback: (data) => this.handleTTSFallback(data)
      });
    } else {
      this.updateCallbacks({
        onTTSAudio: undefined,
        onTTSFallback: undefined
      });
    }
  }
}

export default WebSocketVoiceClient;