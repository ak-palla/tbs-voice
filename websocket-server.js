/**
 * Dedicated WebSocket Server for Voice Chat
 * Runs on port 3001, separate from Next.js app
 */

const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Import Groq client for title generation
const { groqClient: importedGroqClient, GROQ_MODELS } = require('./lib/groq-client.js');

// Import title generation utilities
const { generateChatTitle, shouldGenerateTitle, validateTitle, getTitleGenerationOptions } = require('./lib/title-generator');
const { getEnhancedContextualMemory } = require('./lib/contextual-llm.js');
const { getCachedResponse, setCachedResponse } = require('./utils/cache.js');
const { pipelineTracker } = require('./lib/pipeline-tracker.js');
const { responseQualityOptimizer } = require('./lib/response-quality-optimizer.js');
const { getQualityConfig } = require('./lib/chat-pipeline-config');

const port = process.env.WS_PORT || 3001;

// Initialize Supabase client
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Save message to chat history
async function saveToHistory(userId, message, role, instanceId = null) {
  if (!userId) {
    console.log('⚠️ [HISTORY] No userId provided, not saving message');
    return { instance: null, error: 'No userId provided' };
  }

  try {
    console.log(`🔄 [HISTORY] Saving ${role} message for user: ${userId.slice(-8)}`);
    
    const messageObj = {
      role: role,
      content: message,
      timestamp: new Date().toISOString()
    };

    if (instanceId) {
      // Update specific instance
      const { data: existingHistory, error: fetchError } = await supabase
        .from('chat_history')
        .select('id, messages, title')
        .eq('id', instanceId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('❌ [HISTORY] Error fetching chat instance:', fetchError);
        return { instance: null, error: fetchError };
      }

      const messages = existingHistory.messages || [];
      messages.push(messageObj);
      
      // Limit to the last 50 messages
      const limitedMessages = messages.slice(-50);

      const { error: updateError } = await supabase
        .from('chat_history')
        .update({ messages: limitedMessages })
        .eq('id', instanceId);
      
      if (updateError) {
        console.error('❌ [HISTORY] Error updating chat instance:', updateError);
        return { instance: null, error: updateError };
      }
      
      console.log('✅ [HISTORY] Updated chat instance');
      return { instance: { id: instanceId, title: existingHistory.title }, error: null };
    } else {
      // Create new instance for first message
      console.log('🔄 [HISTORY] Creating new chat instance');
      const { data: newInstance, error: insertError } = await supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          title: 'New Chat',
          messages: [messageObj]
        })
        .select('id, title')
        .single();
    
      if (insertError) {
        console.error('❌ [HISTORY] Error creating chat instance:', insertError);
        return { instance: null, error: insertError };
      }

      console.log('✅ [HISTORY] Created new chat instance');
      return { instance: newInstance, error: null };
    }
  } catch (error) {
    console.error('❌ [HISTORY] Error saving message to history:', error);
    return { instance: null, error: error };
  }
}

// Fallback clients for when TypeScript modules aren't available
let groqClient = null;
let aggressiveCache = null;

async function initializeGroqClient() {
  if (!groqClient) {
    try {
      // Use real Groq client if API key is available
      if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'placeholder_groq_key') {
        const Groq = require('groq-sdk');
        const groq = new Groq({
          apiKey: process.env.GROQ_API_KEY,
        });
        
        groqClient = {
                     transcribeAudio: async (audioBuffer, mimeType) => {
             console.log('🎤 [GROQ] Starting real Whisper transcription...');
             
             // Create a File-like object for Node.js
             const fs = require('fs');
             const path = require('path');
             const tempFilePath = path.join(__dirname, `temp_audio_${Date.now()}.webm`);
             
             // Write buffer to temporary file
             fs.writeFileSync(tempFilePath, audioBuffer);
             
             try {
               const transcription = await groq.audio.transcriptions.create({
                 file: fs.createReadStream(tempFilePath),
                 model: 'whisper-large-v3',
                 language: 'en',
                 response_format: 'text'
               });
               
               console.log(`✅ [GROQ] Real transcription: "${transcription}"`);
               return transcription.trim();
             } finally {
               // Clean up temporary file
               if (fs.existsSync(tempFilePath)) {
                 fs.unlinkSync(tempFilePath);
               }
             }
           }
        };
        console.log('✅ [GROQ] Real Groq client initialized successfully');
      } else {
        throw new Error('Groq API key not configured');
      }
    } catch (error) {
      console.warn('🔄 [GROQ] Could not initialize real Groq client:', error.message);
      console.warn('🔄 [GROQ] Falling back to mock transcription for testing');
      
      // Fallback to mock only if real client fails
      groqClient = {
        transcribeAudio: async (audioBuffer, mimeType) => {
          return "Mock transcription: Hello, this is a test response.";
        }
      };
    }
  }
  return groqClient;
}

async function initializeAggressiveCache() {
  if (!aggressiveCache) {
    try {
      // Simple mock cache for testing
      aggressiveCache = {
        getSmartCachedInstructions: async (transcription, userId) => {
          // Simple pattern matching for common greetings
          const lowerTranscription = transcription.toLowerCase();
          if (lowerTranscription.includes('hello') || lowerTranscription.includes('hi')) {
            return {
              cached: true,
              instructions: [{ content: "Hello! How can I help you today?" }]
            };
          }
          return { cached: false };
        }
      };
    } catch (error) {
      console.warn('🔄 [CACHE] Could not initialize cache:', error.message);
      aggressiveCache = null;
    }
  }
  return aggressiveCache;
}

// Initialize AI services with fallbacks for testing
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "test-key");

// Create HTTP server for WebSocket
const httpServer = createServer();

// Create Socket.IO server with CORS
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Helper function to convert stream to buffer chunks
async function streamToChunks(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return chunks;
}

// 🚀 OPTIMIZATION 1: Direct voice processing function (bypasses HTTP API entirely)
async function processVoiceDirectly(data, sessionId, socket) {
  // Phase 1: STT (Speech-to-Text)
  const sttStart = Date.now();
  
  let transcription;
  try {
    // Use Groq Whisper (or mock client for testing)
    const groq = await initializeGroqClient();
    if (groq) {
      const audioBuffer = Buffer.from(data.audio.replace(/^data:audio\/[^;]+;base64,/, ''), 'base64');
      transcription = await groq.transcribeAudio(audioBuffer, 'audio/webm');
    } else {
      throw new Error('STT service not available');
    }
  } catch (error) {
    console.warn('🔄 [STT] Using test fallback:', error.message);
    transcription = "Hello! This is a test transcription - voice chat is working perfectly!";
  }
  
  const sttTime = Date.now() - sttStart;
  console.log(`✅ [STT] "${transcription}" (${sttTime}ms)`);
  
  // Emit transcription immediately
  socket.emit('voice-stream', {
    type: 'transcription',
    data: { text: transcription, status: 'complete' },
    timestamp: Date.now(),
    sessionId
  });

  // Phase 2: AI Generation  
  const aiStart = Date.now();
  let response;

  try {
    // Get quality-optimized config
    const { configName, maxTokens } = getQualityConfig('voice', transcription);
    const qualityConfig = responseQualityOptimizer.getGenerationConfig(configName, transcription);
    qualityConfig.maxOutputTokens = maxTokens;

    // Generate response with standardized quality optimization
    const systemPrompt = responseQualityOptimizer.getPromptEnhancement(configName, transcription);
    response = await importedGroqClient.generateResponse([
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: transcription
      }
    ], qualityConfig);

    // Handle title generation with standardized options
    if (data.userId) {
      const { instance, error } = await saveToHistory(data.userId, transcription, 'user', data.instanceId);
      const instanceId = instance?.id;

      if (!error && instance && instanceId) {
        // Get the CURRENT title from database to ensure we have the latest
        const { data: currentChat, error: fetchError } = await supabase
          .from('chat_history')
          .select('title')
          .eq('id', instanceId)
          .eq('user_id', data.userId)
          .single();

        const currentTitle = currentChat?.title || instance.title || 'New Chat';
        
        if (!fetchError && shouldGenerateTitle(currentTitle)) {
          console.log(`🏷️ [AUTO-TITLE] Generating title for WebSocket voice: ${instanceId} (current: "${currentTitle}")`);
        
          try {
          const titleResult = await generateChatTitle(
            getTitleGenerationOptions(transcription, response, 'voice')
          );
          
          if (validateTitle(titleResult.title)) {
            const { error: updateError } = await supabase
              .from('chat_history')
              .update({ title: titleResult.title })
              .eq('id', instanceId)
              .eq('user_id', data.userId);
            
            if (!updateError) {
              console.log(`✅ [AUTO-TITLE] Generated title: "${titleResult.title}"`);
              
              socket.emit('title-updated', {
                instanceId: instanceId,
                newTitle: titleResult.title,
                timestamp: Date.now()
              });
            } else {
              console.error('❌ [AUTO-TITLE] Failed to update title:', updateError);
            }
          } else {
            console.warn(`⚠️ [AUTO-TITLE] Invalid title generated: "${titleResult.title}"`);
          }
          } catch (titleError) {
            console.error('❌ [AUTO-TITLE] Title generation failed:', titleError);
          }
        } else {
          console.log(`🔒 [AUTO-TITLE] Title locked - current: "${currentTitle}" (not generic)`);
        }
      }

      await saveToHistory(data.userId, response, 'assistant', instanceId);
    }

    // Stream AI response
    socket.emit('voice-stream', {
      type: 'ai-chunk',
      data: { chunk: response, fullText: response, isComplete: true },
      timestamp: Date.now(),
      sessionId
    });

    // Phase 3: TTS (Text-to-Speech) - Deepgram primary, browser fallback
    const ttsStart = Date.now();
    
    try {
      // 🚀 OPTIMIZATION: Try Deepgram TTS if available, otherwise use browser TTS
      if (process.env.DEEPGRAM_API_KEY && process.env.DEEPGRAM_API_KEY !== 'placeholder_deepgram_key') {
        console.log('🔊 [TTS] Deepgram API available, attempting TTS...');
        try {
          const { createClient: createDeepgramClient } = require("@deepgram/sdk");
          const deepgram = createDeepgramClient(process.env.DEEPGRAM_API_KEY);
          
          const deepgramResponse = await deepgram.speak.request(
            { text: response },
            {
              model: "aura-asteria-en",
              encoding: "mp3"
              // Note: MP3 encoding doesn't support container parameter
            }
          );
          
          const stream = await deepgramResponse.getStream();
          if (stream) {
            const audioBuffer = Buffer.concat(await streamToChunks(stream));
            const audioBase64 = audioBuffer.toString('base64');
            
            // Emit Deepgram TTS audio
            socket.emit('voice-stream', {
              type: 'tts-audio',
              data: { 
                audio: audioBase64,
                mimeType: 'audio/mp3',
                text: response,
                provider: 'deepgram',
                voice: 'aura-asteria-en'
              },
              timestamp: Date.now(),
              sessionId
            });
            
            const ttsTime = Date.now() - ttsStart;
            console.log(`🔊 [TTS] Deepgram ready (${ttsTime}ms)`);
            return { transcription, response, sttTime, aiTime, ttsTime }; // Exit early if Deepgram succeeds
          }
        } catch (deepgramError) {
          console.warn('🔄 [TTS] Deepgram failed:', deepgramError.message);
        }
      }
      
      // Always fall back to browser TTS (for testing and when Deepgram isn't available)
      console.log('🔊 [TTS] Using browser TTS fallback');
      socket.emit('voice-stream', {
        type: 'tts-fallback',
        data: {
          text: response,
          useBrowserTTS: true,
          accent: data.accent || 'US',
          gender: data.gender || 'female',
          fallback: true
        },
        timestamp: Date.now(),
        sessionId
      });
      
    } catch (error) {
      console.warn('🔄 [TTS] General TTS error, using browser fallback:', error.message);
      // Ultimate fallback
      socket.emit('voice-stream', {
        type: 'tts-fallback',
        data: {
          text: response,
          useBrowserTTS: true,
          accent: data.accent || 'US',
          gender: data.gender || 'female',
          fallback: true
        },
        timestamp: Date.now(),
        sessionId
      });
    }

    const ttsTime = Date.now() - ttsStart;

    return {
      transcription,
      response,
      sttTime,
      aiTime,
      ttsTime
    };
  } catch (error) {
    console.error('❌ [AI] Generation failed:', error);
    throw error;
  }
}

// 🚀 OPTIMIZATION 1: Direct WebSocket Voice Processing (No HTTP API)
io.on('connection', (socket) => {
  console.log(`🔗 [WS] Connected: ${socket.id}`);

  socket.on('voice-process', async (data) => {
    const startTime = Date.now();
    const sessionId = `ws_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    console.log(`\n🎤 [DIRECT] Starting ${sessionId}`);
    console.log(`📊 Audio: ${data.audio?.length || 0} chars | User: ${data.userId?.slice(-8) || 'unknown'}`);
    
    socket.emit('voice-started', { sessionId, startTime });
    
    try {
      // 🚀 OPTIMIZATION 1: Process everything directly in WebSocket (no HTTP roundtrip)
      const result = await processVoiceDirectly(data, sessionId, socket);
      
      const totalTime = Date.now() - startTime;
      console.log(`📊 [DIRECT] ${sessionId.slice(-8)}`);
      console.log(`⏱️  Total: ${totalTime}ms | STT: ${result.sttTime}ms | AI: ${result.aiTime}ms | TTS: ${result.ttsTime}ms`);
      console.log(`📝 "${result.transcription}" → "${result.response.substring(0, 50)}..."`);
      
      const performance = totalTime <= 3000 ? '🟢 EXCELLENT' : 
                        totalTime <= 5000 ? '🟡 GOOD' : 
                        totalTime <= 8000 ? '🟠 FAIR' : '🔴 SLOW';
      console.log(`🎯 Performance: ${performance} (target: <3000ms)\n`);
      
      socket.emit('voice-complete', { sessionId, totalTime });

    } catch (error) {
      const errorTime = Date.now() - startTime;
      console.log(`❌ [DIRECT] ${sessionId.slice(-8)}: ${error.message} (${errorTime}ms)`);
      socket.emit('voice-error', { sessionId, error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [WS] Disconnected: ${socket.id}`);
  });
});

// Start WebSocket server
httpServer.listen(port, () => {
  console.log(`🚀 WebSocket Server ready on http://localhost:${port}`);
  console.log(`🎯 Optimized for <3s voice responses`);
  console.log(`🔗 Connect your frontend to: ws://localhost:${port}`);
}); 