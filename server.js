/**
 * Custom Next.js server with WebSocket support
 * Clean voice AI streaming with simplified logging
 */

// Load environment variables from .env.local file
require('dotenv').config({ path: '.env.local' });

// Import required modules
const express = require('express');
const next = require('next');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Import title generation utilities
const { generateChatTitle, shouldGenerateTitle, validateTitle } = require('./lib/title-generator.js');
const { getTitleGenerationOptions } = require('./lib/chat-pipeline-config.js');

// Import response quality optimizer and pipeline config
const { responseQualityOptimizer } = require('./lib/response-quality-optimizer.js');
const { getQualityConfig } = require('./lib/chat-pipeline-config.js');

// Import Groq client for optimization consistency
const { groqClient: importedGroqClient, GROQ_MODELS } = require('./lib/groq-client.js');

// Initialize Supabase client
const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Verify API keys are loaded
console.log('🔑 [ENV] API Keys Status:');
console.log('🔑 [ENV] DEEPGRAM_API_KEY:', process.env.DEEPGRAM_API_KEY ? `${process.env.DEEPGRAM_API_KEY.substring(0, 8)}...` : '❌ NOT SET');
console.log('🔑 [ENV] GEMINI_API_KEY:', process.env.NEXT_PUBLIC_GEMINI_API_KEY ? `${process.env.NEXT_PUBLIC_GEMINI_API_KEY.substring(0, 8)}...` : '❌ NOT SET');
console.log('🔑 [ENV] GROQ_API_KEY:', process.env.GROQ_API_KEY ? `${process.env.GROQ_API_KEY.substring(0, 8)}...` : '❌ NOT SET');
console.log('🔑 [ENV] SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ SET' : '❌ NOT SET');
console.log('🔑 [ENV] SUPABASE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ SET' : '❌ NOT SET');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

// 🚀 OPTIMIZATION 1: Import AI services directly (bypass HTTP API)
// Fallback clients for when TypeScript modules aren't available
let groqClient = null;
let aggressiveCache = null;

// 🧠 RAG INTELLIGENCE: Import enhanced components
let ragOptimizer = null;
let promptOptimizer = null;
let ragEnabled = false;

// 🚀 GROQ AI: Import Groq AI client for ultra-fast generation
let groqAIClient = null;
let formatMessagesForGroq = null;

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

async function initializeGroqAI() {
  if (!groqAIClient) {
    try {
      if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'placeholder_groq_key') {
        // Use Groq SDK directly in JavaScript (avoid TypeScript import issues)
        const Groq = require('groq-sdk');
        const groq = new Groq({
          apiKey: process.env.GROQ_API_KEY,
        });
        
        // Define models
        GROQ_MODELS = {
          INSTANT: "llama-3.1-8b-instant", // Ultra-fast for voice AI
          FASTEST: "llama-3.3-70b-versatile", // Fast for general use
          BALANCED: "mixtral-8x7b-32768", // Good balance
          QUALITY: "llama-3.1-70b-versatile" // Higher quality
        };
        
        // Create Groq AI client
        groqAIClient = {
          generateResponse: async (messages, config = {}) => {
            const startTime = Date.now();
            const finalConfig = {
              model: config.model || GROQ_MODELS.INSTANT,
              maxTokens: config.maxTokens || 600,
              temperature: config.temperature || 0.4,
              topP: config.topP || 0.9
            };
            
            console.log(`🚀 [GROQ AI] Starting generation with ${finalConfig.model}`);
            
            const completion = await groq.chat.completions.create({
              messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content
              })),
              model: finalConfig.model,
              max_tokens: finalConfig.maxTokens,
              temperature: finalConfig.temperature,
              top_p: finalConfig.topP
            });

            const responseText = completion.choices[0]?.message?.content || '';
            const generationTime = Date.now() - startTime;
            
            console.log(`✅ [GROQ AI] Generated ${responseText.length} chars in ${generationTime}ms`);
            return responseText;
          }
        };
        
        // Create formatMessagesForGroq function
        formatMessagesForGroq = (systemPrompt, userMessage, conversationHistory = []) => {
          const messages = [];
          
          // Add system prompt if provided
          if (systemPrompt && systemPrompt.trim()) {
            // Optimize for token limits
            let optimizedSystemPrompt = systemPrompt;
            if (systemPrompt.length > 12000) { // ~3000 tokens
              optimizedSystemPrompt = systemPrompt.substring(0, 12000) + '...';
              console.log(`🔧 [GROQ AI] Optimized system prompt from ${systemPrompt.length} to ${optimizedSystemPrompt.length} chars`);
            }
            messages.push({ role: 'system', content: optimizedSystemPrompt });
          }
          
          // Add conversation history (limited)
          if (conversationHistory && conversationHistory.length > 0) {
            const recentHistory = conversationHistory.slice(-1); // Only last exchange
            for (const msg of recentHistory) {
              if (msg.role === 'user' || msg.role === 'assistant') {
                messages.push({ 
                  role: msg.role, 
                  content: msg.content.length > 100 ? msg.content.substring(0, 100) + "..." : msg.content
                });
              }
            }
          }
          
          // Add current user message
          messages.push({ role: 'user', content: userMessage });
          
          console.log(`🔧 [GROQ AI] Prepared ${messages.length} messages for context`);
          return messages;
        };
        
        console.log('✅ [GROQ AI] Ultra-fast AI client initialized with Llama 8B Instant');
        console.log(`🚀 [GROQ AI] Using model: ${GROQ_MODELS.INSTANT}`);
      } else {
        throw new Error('Groq API key not configured for AI generation');
      }
    } catch (error) {
      console.warn('🔄 [GROQ AI] Could not initialize AI client:', error.message);
      console.warn('🔄 [GROQ AI] Will use Gemini fallback only');
      groqAIClient = null;
    }
  }
  return groqAIClient;
}

async function initializeAggressiveCache() {
  if (!aggressiveCache) {
    try {
      // Try to create a simple mock cache for testing
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
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "test-key");

async function initializeRAGComponents() {
  try {
    console.log('🔄 [RAG] Loading JavaScript bridge for RAG components...');
    
    // Use the JavaScript bridge instead of TypeScript imports
    const ragBridge = require('./utils/rag-bridge.js');
    
    ragOptimizer = ragBridge.ragOptimizer;
    promptOptimizer = ragBridge.promptOptimizer;
    ragEnabled = true;
    
    console.log('✅ [RAG] Enhanced intelligence loaded via JavaScript bridge');
    return true;
  } catch (error) {
    console.warn('🔄 [RAG] Failed to load RAG bridge:', error.message);
    console.warn('🔄 [RAG] Using pattern matching fallback');
    ragEnabled = false;
    return false;
  }
}

// Auto-migration function to ensure database schema is up to date
async function ensureDatabaseSchema() {
  try {
    console.log('🔧 [AUTO-MIGRATION] Checking database schema...');
    
    // Test if is_starred column exists by trying to query it
    const { data, error } = await supabase
      .from('chat_history')
      .select('is_starred')
      .limit(1);
    
    if (error && error.code === '42703') {
      console.log('🔧 [AUTO-MIGRATION] is_starred column missing, attempting to create...');
      
      // Try to create the column and indexes
      const migrationSQL = `
        ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE;
        CREATE INDEX IF NOT EXISTS idx_chat_history_starred_user 
        ON chat_history(user_id, is_starred, updated_at DESC) 
        WHERE is_starred = TRUE;
        CREATE INDEX IF NOT EXISTS idx_chat_history_user_recent
        ON chat_history(user_id, updated_at DESC);
      `;
      
      // Note: Supabase doesn't allow direct DDL through client libraries for security
      // This will be handled gracefully in the API calls instead
      console.log('ℹ️ [AUTO-MIGRATION] Database schema updates will be handled via API fallbacks');
      console.log('💡 [AUTO-MIGRATION] For optimal performance, manually run this SQL in Supabase Dashboard:');
      console.log('   ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE;');
    } else if (!error) {
      console.log('✅ [AUTO-MIGRATION] Database schema is up to date');
    } else {
      console.log('⚠️ [AUTO-MIGRATION] Could not check schema, will handle gracefully');
    }
  } catch (error) {
    console.log('⚠️ [AUTO-MIGRATION] Schema check failed, fallback mode enabled');
  }
}

// Initialize Next.js app
app.prepare().then(async () => {
  // Initialize services
  await initializeGroqClient();
  await initializeGroqAI();
  await initializeAggressiveCache();
  await initializeRAGComponents();
  await ensureDatabaseSchema();

  const server = express();
  server.use(cors());
  server.use(express.json({ limit: '10mb' }));

  // Create HTTP server
  const httpServer = createServer(server);

  // Create Socket.IO server with CORS
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Basic test route to verify server is working
  server.get('/test', (req, res) => {
    res.json({ 
      message: 'Voice chat server is running!', 
      timestamp: new Date().toISOString(),
      optimizations: 'Active'
    });
  });

  // Handle chat instance management
  server.post('/api/chat/instance', async (req, res) => {
    const { action, instanceId, title } = req.body;
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      switch (action) {
        case 'create':
          const { data: newInstance, error: createError } = await supabase
            .from('chat_history')
            .insert([
              { 
                user_id: userId,
                title: title || 'New Chat'
              }
            ])
            .select()
            .single();

          if (createError) throw createError;
          return res.json({ success: true, instance: newInstance });

        case 'delete':
          const { error: deleteError } = await supabase
            .from('chat_history')
            .delete()
            .eq('id', instanceId)
            .eq('user_id', userId);

          if (deleteError) throw deleteError;
          return res.json({ success: true });

        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error) {
      console.error('Error managing chat instance:', error);
      return res.status(500).json({ 
        error: 'Failed to process request',
        details: error.message
      });
    }
  });

  // Handle chat history retrieval
  server.get('/api/chat/history', async (req, res) => {
    const userId = req.headers['x-user-id'];
    const instanceId = req.query.instanceId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      let query = supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId);

      if (instanceId) {
        query = query.eq('id', instanceId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, history: data });
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch history',
        details: error.message
      });
    }
  });

  // Handle WebSocket connections
  io.on('connection', async (socket) => {
    console.log('🔌 [WS] Client connected:', socket.id);
    
    // Handle voice processing
    socket.on('voice-process', async (data) => {
      try {
        await processVoiceDirectly(data, socket.id, socket);
      } catch (error) {
        console.error('❌ [WS] Voice processing error:', error);
        socket.emit('voice-error', { error: 'Voice processing failed' });
      }
    });

    // Handle text processing
    socket.on('text-process', async (data) => {
      try {
        await processTextDirectly(data, socket.id, socket);
      } catch (error) {
        console.error('❌ [WS] Text processing error:', error);
        socket.emit('text-error', { error: 'Text processing failed' });
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 [WS] Client disconnected:', socket.id);
    });
  });

  // Handle Next.js requests
  server.use((req, res) => {
    return handle(req, res);
  });

  // Start server
  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});

// Helper function to convert stream to buffer chunks
async function streamToChunks(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return chunks;
}

// Helper function to strip markdown formatting for TTS
function stripMarkdownForTTS(text) {
  let cleaned = text
    // Remove bold/italic markers (**text** and *text*)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    // Remove headers (# ## ### etc)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bullet points and list markers
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove links [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove code blocks
    .replace(/```[^`]*```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
  
  // 🔧 FIX: Truncate to Deepgram's 2000 character limit
  if (cleaned.length > 1950) {
    console.log(`⚠️ [TTS] Text too long (${cleaned.length} chars), truncating to 1950 chars`);
    cleaned = cleaned.substring(0, 1950) + '...';
  }
  
  return cleaned;
}

// Helper function to get Deepgram voice based on accent and gender
function getDeepgramVoice(accent, gender) {
  const voiceMap = {
    // US English
    'US-female': 'aura-asteria-en',
    'US-male': 'aura-orion-en',
    // UK English  
    'UK-female': 'aura-athena-en',
    'UK-male': 'aura-helios-en',
    // Australian English
    'AU-female': 'aura-luna-en',
    'AU-male': 'aura-arcas-en',
    // Default fallbacks
    'female': 'aura-asteria-en',
    'male': 'aura-orion-en'
  };

  // Normalize inputs
  accent = (accent || 'US').toUpperCase();
  gender = (gender || 'female').toLowerCase();
  
  // Try exact match first
  const exactKey = `${accent}-${gender}`;
  if (voiceMap[exactKey]) {
    console.log(`🎙️ [VOICE] Selected ${voiceMap[exactKey]} for ${accent} ${gender}`);
    return voiceMap[exactKey];
  }
  
  // Fall back to gender-only
  const fallbackVoice = voiceMap[gender] || voiceMap['female'];
  console.log(`🎙️ [VOICE] Fallback to ${fallbackVoice} for ${accent} ${gender}`);
  return fallbackVoice;
}

// Helper function to save message to chat history
async function saveToHistory(userId, message, role, instanceId = null) {
  if (!userId) {
    console.log('⚠️ [HISTORY] No userId provided, not saving message');
    return null;
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
        .select('id, messages')
        .eq('id', instanceId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('❌ [HISTORY] Error fetching chat instance:', fetchError);
        return null;
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
        return null;
      }
      
      console.log('✅ [HISTORY] Updated chat instance');
      return instanceId;
    } else {
      // Get the user's most recent instance or create a new one
      const { data: recentInstance, error: recentError } = await supabase
        .from('chat_history')
        .select('id, messages')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (recentError && recentError.code !== 'PGRST116') {
        console.error('❌ [HISTORY] Error fetching recent chat instance:', recentError);
        return null;
      }

      if (!recentInstance) {
        // Create new instance
        console.log('🔄 [HISTORY] Creating new chat instance');
        const { data: newInstance, error: insertError } = await supabase
          .from('chat_history')
          .insert({
            user_id: userId,
            title: 'New Chat',
            messages: [messageObj]
          })
          .select('id')
          .single();
      
        if (insertError) {
          console.error('❌ [HISTORY] Error creating chat instance:', insertError);
          return null;
        }

        console.log('✅ [HISTORY] Created new chat instance');
        return newInstance.id;
      } else {
        // Update existing instance
        console.log('🔄 [HISTORY] Updating recent chat instance');
        const messages = recentInstance.messages || [];
        messages.push(messageObj);
        
        // Limit to the last 50 messages
        const limitedMessages = messages.slice(-50);

        const { error: updateError } = await supabase
          .from('chat_history')
          .update({ messages: limitedMessages })
          .eq('id', recentInstance.id);
        
        if (updateError) {
          console.error('❌ [HISTORY] Error updating chat instance:', updateError);
          return null;
        }

        console.log('✅ [HISTORY] Updated chat instance');
        return recentInstance.id;
      }
    }
  } catch (error) {
    console.error('❌ [HISTORY] Error saving message to history:', error);
    return null;
  }
}

// 🚀 OPTIMIZATION 1: Direct text processing function (bypasses HTTP API entirely)
async function processTextDirectly(data, sessionId, socket) {
  const startTime = Date.now();
  
  // 🚀 STARTED SIGNAL: Notify frontend that text processing has started
  socket.emit('text-started', { 
    sessionId, 
    startTime,
    type: 'text'
  });
  
  // Phase 1: No STT needed for text messages - use text directly
  const sttTime = 0; // No transcription needed
  const transcription = data.text;
  
  console.log(`✅ [TEXT] Using provided text: "${transcription}"`);
  
  // Save user message to history
  const instanceId = await saveToHistory(data.userId, transcription, 'user', data.instanceId);
  
  // 🔧 FIX: Don't emit transcription for text messages - frontend already has the message!
  // This was causing duplicate user messages in the chat interface
  // Removed: socket.emit('voice-stream', { type: 'transcription', ... })

  // Phase 2: AI Generation using VOICE-OPTIMIZED logic for consistency
  const aiStart = Date.now();
  
  let response;
  try {
    // Get quality-optimized config (same as voice pipeline)
    const { configName, maxTokens } = getQualityConfig('text', transcription);
    const qualityConfig = responseQualityOptimizer.getGenerationConfig(configName, transcription);
    qualityConfig.maxOutputTokens = maxTokens;

    // Generate response with standardized quality optimization (same as voice)
    const systemPrompt = responseQualityOptimizer.getPromptEnhancement(configName, transcription);
    
    console.log(`🧠 [VOICE-OPTIMIZED TEXT] Using voice pipeline optimizations for text...`);
    console.log(`📝 [PROMPT] Generated for TEXT query with VOICE-QUALITY OPTIMIZATION`);
    console.log(`🎯 [QUALITY] Prompt enhanced with "Quality Over Quantity" principles`);
    
    // Try Groq first (ultra-fast, same as voice pipeline)
    if (importedGroqClient) {
      try {
        console.log(`🚀 [GROQ AI] Using ultra-fast llama-3.1-8b-instant model...`);
        
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
        
        console.log(`✅ [GROQ AI] Generated ${response.length} chars with ultra-fast AI`);
        
        // Apply post-processing (link formatting, quality optimization)
        response = await postProcessResponse(response);
      } catch (groqError) {
        console.warn('🔄 [GROQ AI] Failed, will use intelligent response fallback:', groqError.message);
        response = null;
      }
    }

    // Fallback to intelligent response if Groq fails
    if (!response) {
      console.log(`🧠 [INTELLIGENT FALLBACK] Using enhanced RAG response...`);
      response = await getIntelligentResponse(transcription, data.userId, instanceId, false);
    }
    
    if (response) {
      console.log(`✅ [INTELLIGENT] Using enhanced RAG response`);
    } else {
      console.log(`🔄 [INTELLIGENT] Using pattern matching fallback`);
      
      // Keep existing pattern matching as fallback
      const lowerTranscription = transcription.toLowerCase();
      
      if (lowerTranscription.includes('chain of command') || lowerTranscription.includes('organizational structure') || lowerTranscription.includes('hierarchy') || lowerTranscription.includes('leadership structure') || lowerTranscription.includes('team structure') || lowerTranscription.includes('command structure') || lowerTranscription.includes('organization chart') || lowerTranscription.includes('reporting structure') || lowerTranscription.includes('delegation') || lowerTranscription.includes('delegate') || lowerTranscription.includes('authority')) {
        response = `Here's how to build an effective chain of command for your business:

**1. Define Clear Authority Levels:**
- CEO/Owner at the top with ultimate decision-making authority
- Department heads with operational control over their areas
- Team leads with day-to-day management responsibilities
- Individual contributors with specific task ownership

**2. Establish Decision-Making Authority:**
- Financial decisions: Who can approve what dollar amounts
- Hiring/firing authority: Clear levels of HR decision-making
- Strategic decisions: Board, CEO, or executive team authority
- Operational decisions: Department and team lead authority

**3. Communication Protocols:**
- Regular one-on-one meetings between each level
- Weekly team meetings with clear agendas
- Monthly departmental reviews with metrics
- Quarterly leadership alignment sessions

**4. Accountability Structure:**
- Clear job descriptions with specific responsibilities
- Performance metrics for each role and level
- Regular performance reviews and feedback cycles
- Consequences and rewards tied to performance

**5. Delegation Framework:**
- Define what can be delegated vs. what must be escalated
- Create standard operating procedures for common decisions
- Establish approval workflows for different types of requests
- Train managers on effective delegation techniques

Remember: The best chain of command is clear, respected, and enables fast decision-making while maintaining oversight!`;
      } else if (lowerTranscription.includes('growth machine') || lowerTranscription.includes('grow')) {
        response = `Here's how to build a powerful growth machine for your company:

**1. Revenue Engine Framework:**
- Identify your highest-value customer segments
- Create systematic lead generation processes
- Build automated nurturing sequences
- Track conversion metrics at each stage

**2. Operational Excellence:**
- Document and optimize core processes
- Implement feedback loops for continuous improvement
- Scale what works, eliminate what doesn't
- Create standard operating procedures

**3. Team & Culture Growth:**
- Hire for culture fit and growth mindset
- Develop clear advancement paths
- Implement regular training programs
- Foster innovation and accountability

**4. Data-Driven Decisions:**
- Track key performance indicators (KPIs)
- Use analytics for strategic planning
- Test and iterate on growth strategies
- Monitor customer satisfaction metrics

Start with one area and systematically build your growth foundation!`;
      } else if (lowerTranscription.includes('social media') || lowerTranscription.includes('marketing')) {
        response = `Here's your social media growth strategy:

**1. Platform Selection & Audience:**
- Focus on 2-3 platforms where your customers spend time
- Research competitor presence and engagement
- Define your ideal customer persona clearly

**2. Content Strategy:**
- Share valuable business insights and tips
- Show behind-the-scenes of your company culture
- Post customer success stories and testimonials
- Create educational content that solves problems

**3. Engagement & Community:**
- Respond to comments within 2-4 hours
- Start conversations with questions and polls
- Collaborate with industry leaders and influencers
- Share user-generated content when possible

**4. Consistency & Growth:**
- Post regularly with a content calendar
- Use analytics to optimize posting times
- Run targeted ads for wider reach
- Track engagement rates and adjust strategy

Remember: Quality content that helps your audience beats quantity every time!`;
      } else if (lowerTranscription.includes('battle plan') || lowerTranscription.includes('strategy')) {
        response = `Let's create your business battle plan:

**1. Mission & Objectives:**
- Define your clear business mission
- Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
- Identify 3-5 key strategic priorities

**2. Market Analysis:**
- Study your competition thoroughly
- Identify market gaps and opportunities
- Understand your unique value proposition
- Analyze customer needs and pain points

**3. Resource Allocation:**
- Budget allocation across departments
- Timeline for major initiatives
- Team responsibilities and accountability
- Technology and tool requirements

**4. Execution & Monitoring:**
- Create weekly/monthly review processes
- Establish key performance indicators (KPIs)
- Build feedback loops with customers
- Plan for obstacles and contingencies

**5. Victory Metrics:**
- Revenue targets and growth rates
- Customer acquisition and retention goals
- Market share objectives
- Operational efficiency benchmarks

Your battle plan should be ambitious but achievable. Start executing today!`;
      } else {
        response = `I'm here to help you grow your business! I can assist with:

• **Growth Strategies** - Building sustainable revenue systems with your [Growth Machine](/growth-machine)
• **Marketing & Social Media** - Expanding your reach and engagement  
• **Operations** - Streamlining processes and improving efficiency
• **Team Development** - Building strong company culture via [Chain of Command](/chain-of-command)
• **Strategic Planning** - Creating actionable [Battle Plans](/battle-plan) for success

Start by reviewing your [Company Scorecard](/company-scorecard) to see where you need the most help.

What specific area would you like to focus on today? I'm ready to provide detailed, actionable guidance tailored to your business needs.`;
      }
      
      console.log(`✅ [DIRECT-RAG] Generated business response: "${response.substring(0, 50)}..."`);
    }
  } catch (error) {
    console.warn('🔄 [DIRECT-RAG] Error in direct processing, using fallback:', error.message);
    response = "I'm here to help with your business questions! Let me know what specific area you'd like to focus on.";
  }
  
  const aiTime = Date.now() - aiStart;
  console.log(`🤖 [AI] Complete (${aiTime}ms)`);
  
  // Save assistant response to history
  await saveToHistory(data.userId, response, 'assistant', instanceId);
  
  // Stream AI response to client
  console.log(`📤 [EMIT] Sending text-stream AI response for session: ${sessionId}`);
  socket.emit('text-stream', {
    type: 'chunk',
    data: { content: response, chunk: response, fullText: response, isComplete: true },
    timestamp: Date.now(),
    sessionId
  });
  console.log(`✅ [EMIT] text-stream AI response sent successfully`);

  // Phase 3: TTS (Text-to-Speech) - Only if generateTTS is enabled
  const ttsStart = Date.now();
  let ttsTime = 0;
  
  if (data.generateTTS) {
    try {
      // 🚀 OPTIMIZATION: Try Deepgram TTS if available, otherwise use browser TTS
      if (process.env.DEEPGRAM_API_KEY && process.env.DEEPGRAM_API_KEY !== 'placeholder_deepgram_key') {
        console.log('🔊 [TTS] Deepgram API available, attempting TTS...');
        try {
          const { createClient: createDeepgramClient } = require("@deepgram/sdk");
          const deepgram = createDeepgramClient(process.env.DEEPGRAM_API_KEY);
          
          // Clean markdown formatting for better TTS
          const cleanTextForTTS = stripMarkdownForTTS(response);
          const selectedVoice = getDeepgramVoice(data.accent, data.gender);
          console.log(`🔊 [TTS] Original: "${response.substring(0, 100)}..."`);
          console.log(`🔊 [TTS] Cleaned: "${cleanTextForTTS.substring(0, 100)}..."`);
          console.log(`🎙️ [TTS] Using voice: ${selectedVoice} (${data.accent || 'US'} ${data.gender || 'female'})`);
          
          const deepgramResponse = await deepgram.speak.request(
            { text: cleanTextForTTS },
            {
              model: selectedVoice,
              encoding: 'mp3'
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
                text: cleanTextForTTS,
                originalText: response,
                provider: 'deepgram',
              voice: selectedVoice,
              accent: data.accent || 'US',
              gender: data.gender || 'female'
              },
              timestamp: Date.now(),
              sessionId
            });
            
            ttsTime = Date.now() - ttsStart;
            console.log(`🔊 [TTS] Deepgram ready (${ttsTime}ms)`);
            
            // Return complete result object
            return {
              transcription,
              response,
              sttTime,
              aiTime,
              ttsTime
            };
          } else {
            console.warn('🔄 [TTS] Deepgram stream is null, falling back to browser TTS');
          }
        } catch (deepgramError) {
          console.warn('🔄 [TTS] Deepgram failed:', deepgramError.message);
        }
      }
      
      // Always fall back to browser TTS (for testing and when Deepgram isn't available)
      console.log('🔊 [TTS] Using browser TTS fallback');
      const cleanTextForBrowserTTS = stripMarkdownForTTS(response);
      console.log(`🔊 [TTS-BROWSER] Cleaned: "${cleanTextForBrowserTTS.substring(0, 100)}..."`);
      
      socket.emit('voice-stream', {
        type: 'tts-fallback',
        data: {
          text: cleanTextForBrowserTTS,
          originalText: response,
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
      const cleanTextForUltimateFallback = stripMarkdownForTTS(response);
      console.log(`🔊 [TTS-ULTIMATE] Cleaned: "${cleanTextForUltimateFallback.substring(0, 100)}..."`);
      
      socket.emit('voice-stream', {
        type: 'tts-fallback',
        data: {
          text: cleanTextForUltimateFallback,
          originalText: response,
          useBrowserTTS: true,
          accent: data.accent || 'US',
          gender: data.gender || 'female',
          fallback: true
        },
        timestamp: Date.now(),
        sessionId
      });
    }
  } else {
    console.log('🔇 [TTS] TTS disabled for this text message');
  }

  // Try to generate a title for the chat (TEXT PROCESSING)
  try {
    // Get the current title from database to check if we should generate
    const { data: currentChat, error: fetchError } = await supabase
      .from('chat_history')
      .select('title')
      .eq('id', instanceId)
      .eq('user_id', data.userId)
      .single();

    const currentTitle = currentChat?.title || 'New Chat';
    
    if (!fetchError && shouldGenerateTitle(currentTitle)) {
      console.log(`🏷️ [TITLE] Generating title for text conversation with current title: "${currentTitle}"...`);
      
      try {
        const titleResult = await generateChatTitle(
          getTitleGenerationOptions(transcription, response, 'text')
        );
        
        console.log(`✅ [TITLE] Generated title: "${titleResult.title}" (${titleResult.method}, confidence: ${titleResult.confidence})`);
        
        // Update the chat instance with the title
        if (instanceId && titleResult.title) {
          try {
            const { error: updateError } = await supabase
              .from('chat_history')
              .update({ title: titleResult.title })
              .eq('id', instanceId)
              .eq('user_id', data.userId);

            if (!updateError) {
              console.log('✅ [TITLE] Updated title in database');
              
              // 🚀 REAL-TIME UPDATE: Notify client of title change
              socket.emit('title-updated', {
                instanceId: instanceId,
                newTitle: titleResult.title,
                timestamp: Date.now()
              });
            } else {
              console.error('❌ [TITLE] Failed to update title:', updateError);
            }
          } catch (updateError) {
            console.error('❌ [TITLE] Exception updating title:', updateError);
          }
        }
      } catch (titleGenerationError) {
        console.error('❌ [TITLE] Title generation failed:', titleGenerationError);
      }
    } else {
      console.log(`🔒 [TITLE] Title locked - current: "${currentTitle}" (not generic)`);
    }
  } catch (error) {
    console.error('❌ [TITLE] Error checking title:', error);
  }

  ttsTime = Date.now() - ttsStart;
  console.log(`🔊 [TTS] TTS phase complete, proceeding to completion signal...`);

  // 🚀 COMPLETION SIGNAL: Notify frontend that text processing is complete
  try {
    const totalTime = Date.now() - startTime;
    console.log(`🎯 [COMPLETION] Sending text completion signal for session: ${sessionId}`);
    console.log(`📤 [EMIT] Emitting text-stream completion event...`);
    socket.emit('text-stream', {
      type: 'complete',
      data: { 
        content: response,
        totalTime,
        sessionType: 'text'
      },
      timestamp: Date.now(),
      sessionId
    });
    console.log(`✅ [COMPLETION] Text completion signal sent!`);
    console.log(`📋 [EMIT] Event details: type=complete, contentLength=${response.length}, sessionId=${sessionId}`);
  } catch (completionError) {
    console.error('❌ [COMPLETION] Error sending completion signal:', completionError);
  }

  console.log(`🎉 [TEXT] Processing complete! Returning result...`);
  return {
    transcription,
    response,
    sttTime,
    aiTime,
    ttsTime
  };
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
    transcription = "Hello! This is a test transcription - audio processing working!";
  }
  
  const sttTime = Date.now() - sttStart;
  console.log(`✅ [STT] "${transcription}" (${sttTime}ms)`);
  
  // Save user message to history
  const instanceId = await saveToHistory(data.userId, transcription, 'user', data.instanceId);
  
  // Emit transcription immediately
  socket.emit('voice-stream', {
    type: 'transcription',
    data: { text: transcription, status: 'complete' },
                      timestamp: Date.now(),
                      sessionId
  });

  // Phase 2: AI Generation using DIRECT RAG logic (no circular API calls)
  const aiStart = Date.now();
  
  let response;
  try {
    console.log(`🧠 [DIRECT-RAG] Using embedded RAG system directly in WebSocket`);
    
    // 🧠 STEP 1: Try intelligent RAG processing first (VOICE)
    response = await getIntelligentResponse(transcription, data.userId, instanceId, true);
    
    if (response) {
      console.log(`✅ [INTELLIGENT] Using enhanced RAG response`);
    } else {
      console.log(`🔄 [INTELLIGENT] Using pattern matching fallback`);
      
      // Keep existing pattern matching as fallback
      const lowerTranscription = transcription.toLowerCase();
      
      if (lowerTranscription.includes('chain of command') || lowerTranscription.includes('organizational structure') || lowerTranscription.includes('hierarchy') || lowerTranscription.includes('leadership structure') || lowerTranscription.includes('team structure') || lowerTranscription.includes('command structure') || lowerTranscription.includes('organization chart') || lowerTranscription.includes('reporting structure') || lowerTranscription.includes('delegation') || lowerTranscription.includes('delegate') || lowerTranscription.includes('authority')) {
        response = `Here's how to build an effective chain of command for your business:

**1. Define Clear Authority Levels:**
- CEO/Owner at the top with ultimate decision-making authority
- Department heads with operational control over their areas
- Team leads with day-to-day management responsibilities
- Individual contributors with specific task ownership

**2. Establish Decision-Making Authority:**
- Financial decisions: Who can approve what dollar amounts
- Hiring/firing authority: Clear levels of HR decision-making
- Strategic decisions: Board, CEO, or executive team authority
- Operational decisions: Department and team lead authority

**3. Communication Protocols:**
- Regular one-on-one meetings between each level
- Weekly team meetings with clear agendas
- Monthly departmental reviews with metrics
- Quarterly leadership alignment sessions

**4. Accountability Structure:**
- Clear job descriptions with specific responsibilities
- Performance metrics for each role and level
- Regular performance reviews and feedback cycles
- Consequences and rewards tied to performance

**5. Delegation Framework:**
- Define what can be delegated vs. what must be escalated
- Create standard operating procedures for common decisions
- Establish approval workflows for different types of requests
- Train managers on effective delegation techniques

Remember: The best chain of command is clear, respected, and enables fast decision-making while maintaining oversight!`;
      } else if (lowerTranscription.includes('growth machine') || lowerTranscription.includes('grow')) {
        response = `Here's how to build a powerful growth machine for your company:

**1. Revenue Engine Framework:**
- Identify your highest-value customer segments
- Create systematic lead generation processes
- Build automated nurturing sequences
- Track conversion metrics at each stage

**2. Operational Excellence:**
- Document and optimize core processes
- Implement feedback loops for continuous improvement
- Scale what works, eliminate what doesn't
- Create standard operating procedures

**3. Team & Culture Growth:**
- Hire for culture fit and growth mindset
- Develop clear advancement paths
- Implement regular training programs
- Foster innovation and accountability

**4. Data-Driven Decisions:**
- Track key performance indicators (KPIs)
- Use analytics for strategic planning
- Test and iterate on growth strategies
- Monitor customer satisfaction metrics

Start with one area and systematically build your growth foundation!`;
      } else if (lowerTranscription.includes('social media') || lowerTranscription.includes('marketing')) {
        response = `Here's your social media growth strategy:

**1. Platform Selection & Audience:**
- Focus on 2-3 platforms where your customers spend time
- Research competitor presence and engagement
- Define your ideal customer persona clearly

**2. Content Strategy:**
- Share valuable business insights and tips
- Show behind-the-scenes of your company culture
- Post customer success stories and testimonials
- Create educational content that solves problems

**3. Engagement & Community:**
- Respond to comments within 2-4 hours
- Start conversations with questions and polls
- Collaborate with industry leaders and influencers
- Share user-generated content when possible

**4. Consistency & Growth:**
- Post regularly with a content calendar
- Use analytics to optimize posting times
- Run targeted ads for wider reach
- Track engagement rates and adjust strategy

Remember: Quality content that helps your audience beats quantity every time!`;
      } else if (lowerTranscription.includes('battle plan') || lowerTranscription.includes('strategy')) {
        response = `Let's create your business battle plan:

**1. Mission & Objectives:**
- Define your clear business mission
- Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
- Identify 3-5 key strategic priorities

**2. Market Analysis:**
- Study your competition thoroughly
- Identify market gaps and opportunities
- Understand your unique value proposition
- Analyze customer needs and pain points

**3. Resource Allocation:**
- Budget allocation across departments
- Timeline for major initiatives
- Team responsibilities and accountability
- Technology and tool requirements

**4. Execution & Monitoring:**
- Create weekly/monthly review processes
- Establish key performance indicators (KPIs)
- Build feedback loops with customers
- Plan for obstacles and contingencies

**5. Victory Metrics:**
- Revenue targets and growth rates
- Customer acquisition and retention goals
- Market share objectives
- Operational efficiency benchmarks

Your battle plan should be ambitious but achievable. Start executing today!`;
      } else {
        response = `I'm here to help you grow your business! I can assist with:

• **Growth Strategies** - Building sustainable revenue systems with your [Growth Machine](/growth-machine)
• **Marketing & Social Media** - Expanding your reach and engagement  
• **Operations** - Streamlining processes and improving efficiency
• **Team Development** - Building strong company culture via [Chain of Command](/chain-of-command)
• **Strategic Planning** - Creating actionable [Battle Plans](/battle-plan) for success

Start by reviewing your [Company Scorecard](/company-scorecard) to see where you need the most help.

What specific area would you like to focus on today? I'm ready to provide detailed, actionable guidance tailored to your business needs.`;
      }
      
      console.log(`✅ [DIRECT-RAG] Generated business response: "${response.substring(0, 50)}..."`);
    }
  } catch (error) {
    console.warn('🔄 [DIRECT-RAG] Error in direct processing, using fallback:', error.message);
    response = "I'm here to help with your business questions! Let me know what specific area you'd like to focus on.";
  }
  
  const aiTime = Date.now() - aiStart;
  console.log(`🤖 [AI] Complete (${aiTime}ms)`);
  
  // Save assistant response to history
  await saveToHistory(data.userId, response, 'assistant', instanceId);
  
  // Stream AI response to client
  socket.emit('voice-stream', {
    type: 'ai-chunk',
    data: { chunk: response, fullText: response, isComplete: true },
    timestamp: Date.now(),
    sessionId
  });

  // Phase 3: TTS (Text-to-Speech) - Only if generateTTS is enabled
  const ttsStart = Date.now();
  let ttsTime = 0;
  
  if (data.generateTTS) {
    try {
      // 🚀 OPTIMIZATION: Try Deepgram TTS if available, otherwise use browser TTS
      if (process.env.DEEPGRAM_API_KEY && process.env.DEEPGRAM_API_KEY !== 'placeholder_deepgram_key') {
        console.log('🔊 [TTS] Deepgram API available, attempting TTS...');
        try {
          const { createClient: createDeepgramClient } = require("@deepgram/sdk");
          const deepgram = createDeepgramClient(process.env.DEEPGRAM_API_KEY);
          
          // Clean markdown formatting for better TTS
          const cleanTextForTTS = stripMarkdownForTTS(response);
          const selectedVoice = getDeepgramVoice(data.accent, data.gender);
          console.log(`🔊 [TTS] Original: "${response.substring(0, 100)}..."`);
          console.log(`🔊 [TTS] Cleaned: "${cleanTextForTTS.substring(0, 100)}..."`);
          console.log(`🎙️ [TTS] Using voice: ${selectedVoice} (${data.accent || 'US'} ${data.gender || 'female'})`);
          
          const deepgramResponse = await deepgram.speak.request(
            { text: cleanTextForTTS },
            {
              model: selectedVoice,
              encoding: 'mp3'
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
                text: cleanTextForTTS,
                originalText: response,
                provider: 'deepgram',
              voice: selectedVoice,
              accent: data.accent || 'US',
              gender: data.gender || 'female'
              },
              timestamp: Date.now(),
              sessionId
            });
            
            ttsTime = Date.now() - ttsStart;
            console.log(`🔊 [TTS] Deepgram ready (${ttsTime}ms)`);
            
            // Return complete result object
            return {
              transcription,
              response,
              sttTime,
              aiTime,
              ttsTime
            };
          } else {
            console.warn('🔄 [TTS] Deepgram stream is null, falling back to browser TTS');
          }
        } catch (deepgramError) {
          console.warn('🔄 [TTS] Deepgram failed:', deepgramError.message);
        }
      }
      
      // Always fall back to browser TTS (for testing and when Deepgram isn't available)
      console.log('🔊 [TTS] Using browser TTS fallback');
      const cleanTextForBrowserTTS = stripMarkdownForTTS(response);
      console.log(`🔊 [TTS-BROWSER] Cleaned: "${cleanTextForBrowserTTS.substring(0, 100)}..."`);
      
      socket.emit('voice-stream', {
        type: 'tts-fallback',
        data: {
          text: cleanTextForBrowserTTS,
          originalText: response,
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
      const cleanTextForUltimateFallback = stripMarkdownForTTS(response);
      console.log(`🔊 [TTS-ULTIMATE] Cleaned: "${cleanTextForUltimateFallback.substring(0, 100)}..."`);
      
      socket.emit('voice-stream', {
        type: 'tts-fallback',
        data: {
          text: cleanTextForUltimateFallback,
          originalText: response,
          useBrowserTTS: true,
          accent: data.accent || 'US',
          gender: data.gender || 'female',
          fallback: true
        },
        timestamp: Date.now(),
        sessionId
      });
    }
  } else {
    console.log('🔇 [TTS] TTS disabled for this text message');
  }

  ttsTime = Date.now() - ttsStart;

  return {
    transcription,
    response,
    sttTime,
    aiTime,
    ttsTime
  };
}

// 🧠 INTELLIGENT RESPONSE: Enhanced RAG for WebSocket with GROQ SPEED + Gemini Fallback
async function getIntelligentResponse(transcription, userId, instanceId = null, isVoiceQuery = false) {
  if (!ragEnabled || !ragOptimizer || !promptOptimizer) {
    return null; // Fall back to pattern matching
  }
  
  try {
    console.log(`🧠 [INTELLIGENT] Processing with RAG (${isVoiceQuery ? 'VOICE-OPTIMIZED' : 'TEXT'})...`);
    
    // Get optimized instructions (fewer for speed)
    const instructions = await ragOptimizer.getOptimizedInstructions(
      supabase, 
      transcription, 
      isVoiceQuery ? 2 : 3  // Reduced for speed
    );
    
    // 🎯 QUALITY OVER QUANTITY: Add quality enhancement to prompt
    const basePrompt = promptOptimizer.generateFinalPrompt(
      transcription, 
      instructions, 
      null,
      isVoiceQuery
    );
    
    const qualityEnhancement = responseQualityOptimizer.getPromptEnhancement('main-chat', transcription, isVoiceQuery ? 'voice' : 'text');
    const optimizedPrompt = basePrompt + qualityEnhancement;

    console.log(`📝 [PROMPT] Generated for ${isVoiceQuery ? 'VOICE' : 'TEXT'} query with QUALITY OPTIMIZATION`);
    console.log(`🎯 [QUALITY] Prompt enhanced with "Quality Over Quantity" principles`);
    console.log(`🔗 [PROMPT] Contains link formatting rules: ${optimizedPrompt.includes('MANDATORY LINK FORMATTING')}`);

    // 🚀 SPEED OPTIMIZATION: Try Groq first (ultra-fast Llama 8B Instant)
    if (groqAIClient && formatMessagesForGroq && GROQ_MODELS) {
      try {
        console.log(`🚀 [GROQ AI] Using ultra-fast ${GROQ_MODELS.INSTANT} model...`);
        
        const groqMessages = formatMessagesForGroq(
          optimizedPrompt,
          `${transcription}\n\nREMINDER: Include clickable links like [Company Scorecard](/company-scorecard) for any business tools.`
        );
        
                // 🎯 QUALITY OVER QUANTITY: Use response quality optimizer limits
    const qualityConfig = responseQualityOptimizer.getGenerationConfig('main-chat', isVoiceQuery ? 'voice' : 'text');
    
    const response = await groqAIClient.generateResponse(groqMessages, {
      model: GROQ_MODELS.INSTANT, // Ultra-fast 8B model
      maxTokens: qualityConfig.maxOutputTokens, // 400 tokens max for quality responses
      temperature: qualityConfig.temperature
    });
        
        console.log(`✅ [GROQ AI] Generated ${response.length} chars with ultra-fast AI`);
        return await postProcessResponse(response); // Apply link formatting
        
      } catch (groqError) {
        console.warn('🔄 [GROQ AI] Failed, falling back to Gemini:', groqError.message);
      }
    } else {
      console.log('🔄 [GROQ AI] Not available, using Gemini directly');
    }
    
    // Fallback to Gemini (but optimized)
    console.log(`🔄 [GEMINI AI] Using Gemini fallback with quality limits...`);
    
    // 🎯 QUALITY OVER QUANTITY: Use same quality config for Gemini fallback
    const qualityConfig = responseQualityOptimizer.getGenerationConfig('main-chat', isVoiceQuery ? 'voice' : 'text');
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: optimizedPrompt }] },
        { role: 'model', parts: [{ text: isVoiceQuery ? "I'll provide concise, actionable guidance with clickable links." : "I understand and will provide comprehensive guidance with clickable links for business tools." }] },
        { role: 'user', parts: [{ text: `${transcription}\n\nREMINDER: Include clickable links like [Company Scorecard](/company-scorecard) for any business tools mentioned.` }] }
      ],
      generationConfig: {
        maxOutputTokens: qualityConfig.maxOutputTokens, // 400 tokens max for quality responses
        temperature: qualityConfig.temperature,
        topK: qualityConfig.topK,
        topP: qualityConfig.topP,
      }
    });
    
    const response = result.response.text();
    console.log(`✅ [GEMINI AI] Generated ${response.length} chars with fallback`);
    return await postProcessResponse(response);
    
  } catch (error) {
    console.error('❌ [INTELLIGENT] Failed:', error);
    return null; // Fall back to pattern matching
  }
}

// Helper function for link post-processing and length enforcement
async function postProcessResponse(response) {
  const linkReplacements = {
    'Company Scorecard': '[Company Scorecard](/company-scorecard)',
    'Chain of Command': '[Chain of Command](/chain-of-command)',
    'Growth Machine': '[Growth Machine](/growth-machine)',
    'Growth Machine Planner': '[Growth Machine Planner](/growth-machine-planner)',
    'Battle Plan': '[Battle Plan](/battle-plan)',
    'Meeting Rhythm Planner': '[Meeting Rhythm Planner](/meeting-rhythm-planner)',
    'Quarterly Sprint Canvas': '[Quarterly Sprint Canvas](/quarterly-sprint-canvas)',
    'Fulfillment Machine': '[Fulfillment Machine](/fulfillment-machine)',
    'Fulfillment Machine Planner': '[Fulfillment Machine Planner](/fulfillment-machine-planner)',
    'Innovation Machine': '[Innovation Machine](/innovation-machine)',
    'Triage Planner': '[Triage Planner](/triage-planner)',
    'SOP Creator': '[SOP Creator](/sop)',
    'Command HQ': '[Company Scorecard](/company-scorecard)'
  };
  
  let linksAdded = 0;
  for (const [term, linkedTerm] of Object.entries(linkReplacements)) {
    // Only replace if it's not already a link and appears as a standalone term
    const regex = new RegExp(`(?<!\\[)\\b${term}\\b(?!\\]|\\()`, 'gi');
    const beforeCount = (response.match(regex) || []).length;
    if (beforeCount > 0) {
      response = response.replace(regex, linkedTerm);
      linksAdded += beforeCount;
      console.log(`🔗 [POST-PROCESS] Added ${beforeCount} link(s) for "${term}"`);
    }
  }
  
  // 🎯 SMART LENGTH ENFORCEMENT: Preserve formatting while controlling length
  const maxWords = 350; // 350 words target (increased to accommodate links)
  const maxChars = 1800; // 1800 chars target (increased to preserve links and formatting)
  
  const wordCount = response.split(/\s+/).length;
  const charCount = response.length;
  
  if (wordCount > maxWords || charCount > maxChars) {
    console.log(`⚠️ [QUALITY] Response too long: ${wordCount} words, ${charCount} chars - smart trimming`);
    
    // SMART TRIMMING: Preserve structure and formatting
    const sections = response.split(/(?=^#{1,6}\s)/m); // Split by headers
    let trimmedResponse = '';
    let currentWords = 0;
    const targetWords = Math.floor(maxWords * 0.85); // Leave ~50 word buffer for better completion
    
    for (const section of sections) {
      const sectionWords = section.split(/\s+/).length;
      
      if (currentWords + sectionWords <= targetWords) {
        // Include full section
        trimmedResponse += section;
        currentWords += sectionWords;
      } else {
        // Try to include partial section with proper ending
        const remainingWords = targetWords - currentWords;
        if (remainingWords > 20) { // Only if we have meaningful space left
          const words = section.split(/\s+/);
          const partialSection = words.slice(0, remainingWords).join(' ');
          
          // Find the last complete sentence or bullet point - improved regex for links
          const lastSentence = partialSection.match(/.*[.!?](?:\s|$)/);
          const lastBullet = partialSection.match(/.*(?:\n|^)\s*[-*•]\s+[^-*•]*[.!?]?(?:\s|$)/);
          const lastCompleteLink = partialSection.match(/.*\[.*?\]\([^)]*\)(?:[.!?]?)(?:\s|$)/);
          const incompleteLink = partialSection.match(/.*\[.*?(?:\]\([^)]*)?$/);
          
          if (incompleteLink) {
            // If we have an incomplete link, backtrack to the last complete content
            const beforeIncompleteLink = partialSection.replace(/\[.*?(?:\]\([^)]*)?$/, '').trim();
            if (beforeIncompleteLink.length > 10) {
              trimmedResponse += beforeIncompleteLink.replace(/[,;:]?\s*$/, '') + '.';
            }
            break;
          } else if (lastCompleteLink) {
            // Prioritize complete links to avoid cutting them off
            trimmedResponse += lastCompleteLink[0];
          } else if (lastBullet) {
            trimmedResponse += lastBullet[0];
          } else if (lastSentence) {
            trimmedResponse += lastSentence[0];
          } else {
            // Add ellipsis to incomplete section, ensuring no partial links
            trimmedResponse += partialSection.replace(/[,;:]?\s*$/, '') + '...';
          }
        }
        break;
      }
    }
    
    // If nothing was preserved, fall back to sentence-based trimming
    if (trimmedResponse.trim().length < 100) {
      // Split sentences while preserving links
      const sentences = response.split(/(?<=[.!?])\s+(?![^[]*\])/);
      trimmedResponse = '';
      currentWords = 0;
      
      for (const sentence of sentences) {
        const sentenceWords = sentence.split(/\s+/).length;
        if (currentWords + sentenceWords <= targetWords && sentence.trim()) {
          // Check if sentence contains incomplete link
          if (sentence.includes('[') && sentence.includes('](') && !sentence.match(/\[.*?\]\([^)]*\)/)) {
            // Skip sentences with incomplete links
            continue;
          }
          trimmedResponse += sentence.trim() + (sentence.match(/[.!?]\s*$/) ? ' ' : '. ');
          currentWords += sentenceWords;
        } else {
          break;
        }
      }
    }
    
    // Ensure proper ending
    if (!trimmedResponse.match(/[.!?]\s*$/)) {
      trimmedResponse = trimmedResponse.replace(/[,;:]?\s*$/, '') + '.';
    }
    
    const finalWordCount = trimmedResponse.split(/\s+/).length;
    const finalCharCount = trimmedResponse.length;
    
    console.log(`✅ [QUALITY] Smart trimming: ${finalWordCount} words, ${finalCharCount} chars (was ${wordCount}/${charCount})`);
    response = trimmedResponse;
  }
  
  if (linksAdded > 0) {
    console.log(`✅ [POST-PROCESS] Added ${linksAdded} total clickable links to response`);
    console.log(`🔗 [POST-PROCESS] Final link check - contains [Company Scorecard]: ${response.includes('[Company Scorecard]')}`);
  } else {
    console.log(`ℹ️ [POST-PROCESS] No additional links needed - response already formatted`);
  }
  
  return response;
}