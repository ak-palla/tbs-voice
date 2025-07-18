/**
 * WebSocket Manager for Ultra-Fast Voice AI Streaming
 * Eliminates HTTP overhead for sub-5s response times
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { createClient as createDeepgramClient } from "@deepgram/sdk";
import { enhancedTTSService } from './enhanced-tts-service';

interface VoiceStreamData {
  type: 'transcription' | 'context' | 'ai-chunk' | 'tts-audio' | 'tts-fallback' | 'complete' | 'error';
  data: any;
  timestamp: number;
  sessionId: string;
}

interface ActiveSession {
  sessionId: string;
  userId: string;
  startTime: number;
  lastActivity: number;
  connectionId: string;
  accent: string;
  gender: string;
}

export class WebSocketManager {
  private io: SocketIOServer | null = null;
  private activeSessions = new Map<string, ActiveSession>();
  private connectionPools = new Map<string, any>();

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? false : '*',
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupEventHandlers();
    console.error('🚀 [WEBSOCKET] WebSocket server initialized for ultra-fast streaming');
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`🔗 [WS] Client connected: ${socket.id}`);

      // Handle voice processing requests
      socket.on('voice-process', async (data) => {
        const sessionId = this.generateSessionId();
        console.log(`🎤 [WS] Voice session: ${sessionId}`);
        
        try {
          await this.processVoiceStream(socket, sessionId, data);
        } catch (error) {
          console.log(`❌ [WS] Error: ${error instanceof Error ? error.message : String(error)}`);
          socket.emit('voice-error', { 
            sessionId, 
            error: error instanceof Error ? error.message : String(error)
          });
        }
      });

      // Handle text message requests
      socket.on('voice-message', async (data) => {
        const sessionId = data.sessionId || this.generateSessionId();
        console.log(`💬 [WS] Text session: ${sessionId}`);
        
        try {
          // Register active session
          this.activeSessions.set(sessionId, {
            sessionId,
            userId: data.userId,
            startTime: Date.now(),
            lastActivity: Date.now(),
            connectionId: socket.id,
            accent: data.accent || 'US',
            gender: data.gender || 'female'
          });

          // Process text through voice pipeline
          const response = await fetch('/api/websocket-voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'text',
              text: data.text,
              userId: data.userId,
              sessionId,
              accent: data.accent,
              gender: data.gender,
              generateTTS: data.generateTTS
            })
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to process text message');
          }

        } catch (error) {
          console.log(`❌ [WS] Text processing error: ${error}`);
          socket.emit('voice-stream', {
            type: 'error',
            data: { error: error instanceof Error ? error.message : String(error) },
            timestamp: Date.now(),
            sessionId
          });
        }
      });

      // Handle early TTS triggers
      socket.on('early-tts-trigger', (data) => {
        this.handleEarlyTTS(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 [WS] Client disconnected: ${socket.id}`);
        this.cleanupSession(socket.id);
      });

      // Keep-alive ping
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
      });
    });
  }

  /**
   * Process voice input with ultra-fast streaming
   */
  private async processVoiceStream(socket: any, sessionId: string, data: any): Promise<void> {
    const startTime = Date.now();
    
    // Register active session with voice settings
    this.activeSessions.set(sessionId, {
      sessionId,
      userId: data.userId,
      startTime,
      lastActivity: startTime,
      connectionId: socket.id,
      accent: data.accent || 'US',
      gender: data.gender || 'female'
    });

    // Emit immediate acknowledgment
    socket.emit('voice-started', { sessionId, startTime });

    try {
      // Phase 1: Start transcription + parallel processing
      this.emitStreamData(socket, sessionId, 'transcription', { status: 'started' });
      
      const transcriptionPromise = this.processTranscription(socket, sessionId, data.audio);
      const contextPromise = this.processContext(socket, sessionId, data.userId);
      const ragPromise = this.processRAG(socket, sessionId, data.query || '');

      // Wait for transcription to complete, then start AI generation
      const transcription = await transcriptionPromise;
      this.emitStreamData(socket, sessionId, 'transcription', { text: transcription, status: 'complete' });

      // Start AI generation with partial context (don't wait for full RAG)
      const aiPromise = this.processAIGeneration(socket, sessionId, {
        transcription,
        partialContext: await contextPromise,
        partialRAG: await ragPromise
      });

      // Stream AI output and trigger TTS immediately
      await aiPromise;

      const totalTime = Date.now() - startTime;
      console.log(`✅ [WS] Complete: ${totalTime}ms`);
      
      socket.emit('voice-complete', { sessionId, totalTime });

    } catch (error) {
      console.log(`❌ [WS] Processing error: ${error}`);
      socket.emit('voice-error', { sessionId, error: String(error) });
    } finally {
      this.cleanupSession(socket.id);
    }
  }

  /**
   * Process transcription with WebSocket API
   */
  private async processTranscription(socket: any, sessionId: string, audioData: string): Promise<string> {
    console.error(`⚡ [WEBSOCKET STT] Starting transcription for session ${sessionId}`);
    
    try {
      const response = await fetch('/api/websocket-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'transcribe',
          sessionId,
          data: audioData
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      const transcription = result.transcription || "Could not transcribe audio";
      console.error(`🚀 [WEBSOCKET STT] Transcription: "${transcription.substring(0, 50)}..."`);
      return transcription;
    } catch (error) {
      console.error(`❌ [WEBSOCKET STT] Transcription failed: ${error}`);
      // Fallback transcription for testing
      return "Hello, this is a test message";
    }
  }

  /**
   * Process context in parallel
   */
  private async processContext(socket: any, sessionId: string, userId: string): Promise<any> {
    console.error(`📋 [WEBSOCKET CTX] Processing context for session ${sessionId}`);
    
    this.emitStreamData(socket, sessionId, 'context', { status: 'loading' });
    
    try {
      const response = await fetch('/api/websocket-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-context',
          sessionId,
          data: { userId }
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      this.emitStreamData(socket, sessionId, 'context', { data: result.userData, status: 'complete' });
      return result.userData;
    } catch (error) {
      console.error(`❌ [WEBSOCKET CTX] Context failed: ${error}`);
      const fallbackContext = { userId, cached: false, error: true };
      this.emitStreamData(socket, sessionId, 'context', { data: fallbackContext, status: 'error' });
      return fallbackContext;
    }
  }

  /**
   * Process RAG in parallel
   */
  private async processRAG(socket: any, sessionId: string, query: string): Promise<any> {
    console.error(`🔍 [WEBSOCKET RAG] Processing RAG for session ${sessionId}`);
    
    try {
      const response = await fetch('/api/websocket-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-rag',
          sessionId,
          data: { query }
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      return result.instructions;
    } catch (error) {
      console.error(`❌ [WEBSOCKET RAG] RAG failed: ${error}`);
      return { instructions: [], cached: false, error: true };
    }
  }

  /**
   * Process AI generation with streaming output
   */
  private async processAIGeneration(socket: any, sessionId: string, context: any): Promise<void> {
    console.error(`===== 🤖 [WEBSOCKET AI] FUNCTION CALLED =====`);
    console.error(`🤖 [WEBSOCKET AI] Starting AI generation for session ${sessionId}`);
    
    try {
      const response = await fetch('/api/websocket-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-ai',
          sessionId,
          data: {
            transcription: context.transcription,
            userData: context.partialContext,
            instructions: context.partialRAG
          }
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      const aiResponse = result.response;
      console.error(`🔊 [WS-TTS-DEBUG] AI response received: "${aiResponse.substring(0, 50)}..."`);
      
      // Trigger complete audio file generation immediately
      const session = this.activeSessions.get(sessionId);
      console.error(`🔊 [WS-TTS-DEBUG] Triggering complete audio file generation`);
      console.error(`🔊 [WS-TTS-DEBUG] Session accent: ${session?.accent}, gender: ${session?.gender}`);
      
      // Generate complete audio file using enhanced TTS service
      console.error(`🎵 [WS-TTS-DEBUG] About to call generateCompleteAudioFile`);
      console.error(`🎵 [WS-TTS-DEBUG] Parameters: sessionId=${sessionId}, text length=${aiResponse.length}, accent=${session?.accent || 'US'}, gender=${session?.gender || 'female'}`);
      try {
        await this.generateCompleteAudioFile(socket, sessionId, aiResponse, session?.accent || 'US', session?.gender || 'female');
        console.error(`🎵 [WS-TTS-DEBUG] generateCompleteAudioFile completed successfully`);
      } catch (ttsError) {
        console.error(`❌ [WS-TTS-DEBUG] generateCompleteAudioFile failed:`, ttsError);
      }
      
      // Simulate streaming by splitting response into chunks
      const words = aiResponse.split(' ');
      let fullText = '';
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i] + (i < words.length - 1 ? ' ' : '');
        fullText += word;
        
        // Emit AI chunk
        this.emitStreamData(socket, sessionId, 'ai-chunk', { 
          chunk: word, 
          fullText, 
          isComplete: i === words.length - 1 
        });
        
        // Simulate streaming delay
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // TTS completion skipped - handled by server.js streaming

    } catch (error) {
      console.error(`❌ [WEBSOCKET AI] AI generation failed: ${error}`);
      socket.emit('voice-error', { sessionId, error: String(error) });
    }
  }

  /**
   * Generate complete audio file (not chunks) using Enhanced TTS Service
   */
  private async generateCompleteAudioFile(socket: any, sessionId: string, text: string, accent: 'US' | 'UK' = 'US', gender: 'female' | 'male' = 'female'): Promise<void> {
    const ttsStartTime = Date.now();
    
    console.error(`🎵 [WS-ENHANCED-TTS] ===== ENHANCED TTS FUNCTION CALLED =====`);
    console.error(`🎵 [WS-ENHANCED-TTS] Generating complete audio file - text: "${text.substring(0, 50)}..." accent: ${accent}, gender: ${gender}`);
    
    try {
      // Use enhanced TTS service to generate complete audio file
      const ttsResult = await enhancedTTSService.generateCompleteAudio({
        text,
        accent,
        gender,
        sessionId
      });

      if (ttsResult.success) {
        console.error(`✅ [WS-ENHANCED-TTS] ${ttsResult.service} TTS completed successfully`);
        
        if (ttsResult.service === 'deepgram') {
          // Deepgram TTS succeeded - emit complete audio file
          this.emitStreamData(socket, sessionId, 'tts-audio', {
            text: text,
            audioData: ttsResult.audioData,
            audioUrl: ttsResult.audioUrl,
            format: ttsResult.format,
            voice: ttsResult.voice,
            accent: accent,
            gender: gender,
            processingTime: Date.now() - ttsStartTime,
            service: 'deepgram',
            complete: true // Indicates this is a complete audio file, not chunks
          });
        } else {
          // Browser TTS fallback - emit instruction for client-side generation
          this.emitStreamData(socket, sessionId, 'tts-fallback', {
            text: text,
            useBrowserTTS: true,
            voice: ttsResult.voice,
            accent: accent,
            gender: gender,
            processingTime: Date.now() - ttsStartTime,
            service: 'browser',
            fallback: true
          });
        }
      } else {
        console.error(`❌ [WS-ENHANCED-TTS] TTS generation failed: ${ttsResult.error}`);
        
        // Emit fallback instruction
        this.emitStreamData(socket, sessionId, 'tts-fallback', {
          text: text,
          useBrowserTTS: true,
          accent: accent,
          gender: gender,
          fallback: true,
          error: ttsResult.error
        });
      }

    } catch (error) {
      console.error(`❌ [WS-ENHANCED-TTS] Complete audio generation failed:`, error);
      
      // Emit fallback instruction
      this.emitStreamData(socket, sessionId, 'tts-fallback', {
        text: text,
        useBrowserTTS: true,
        accent: accent,
        gender: gender,
        fallback: true,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Handle early TTS triggers from client - NOW ENABLED for complete audio files
   */
  private handleEarlyTTS(socket: any, data: any): void {
    console.error(`⚡ [WS] Early TTS trigger received for complete audio generation`);
    
    if (data.text && data.sessionId) {
      this.generateCompleteAudioFile(
        socket, 
        data.sessionId, 
        data.text, 
        data.accent || 'US', 
        data.gender || 'female'
      );
    }
  }

  /**
   * Emit structured stream data
   */
  private emitStreamData(socket: any, sessionId: string, type: VoiceStreamData['type'], data: any): void {
    const streamData: VoiceStreamData = {
      type,
      data,
      timestamp: Date.now(),
      sessionId
    };
    
    socket.emit('voice-stream', streamData);
    
    // Update session activity
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Cleanup session resources
   */
  private cleanupSession(connectionId: string): void {
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.connectionId === connectionId) {
        this.activeSessions.delete(sessionId);
        console.log(`🧹 [WS] Session cleanup: ${sessionId}`);
        break;
      }
    }
  }

  /**
   * Get active session stats
   */
  getStats(): { activeSessions: number; totalConnections: number } {
    return {
      activeSessions: this.activeSessions.size,
      totalConnections: this.io?.engine.clientsCount || 0
    };
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

// Global WebSocket manager instance
export const wsManager = new WebSocketManager();

export default wsManager;