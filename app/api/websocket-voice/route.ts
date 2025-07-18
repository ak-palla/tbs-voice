/**
 * WebSocket Voice API Integration
 * Bridges WebSocket streaming with existing voice processing pipeline
 */

import { NextRequest, NextResponse } from 'next/server';
import { wsManager } from '@/lib/websocket-manager';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";
import { aggressiveCache } from "@/lib/aggressive-cache";
import { groqClient, formatMessagesForGroq } from "@/lib/groq-client";
import { getRelevantInstructions } from "@/utils/embeddings";
import { createClient as createDeepgramClient } from "@deepgram/sdk";
import { responseQualityOptimizer } from "@/lib/response-quality-optimizer";
import { getTitleGenerationOptions, getQualityConfig } from '@/lib/chat-pipeline-config';
// @ts-ignore - JavaScript module import
const { pipelineTracker } = require("../../../lib/pipeline-tracker.js");

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const deepgram = createDeepgramClient(process.env.DEEPGRAM_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { action, sessionId, data } = await req.json();

    switch (action) {
      case 'transcribe':
        return await handleTranscription(data, sessionId);
      
      case 'get-context':
        return await handleContextRetrieval(data.userId, sessionId);
      
      case 'get-rag':
        return await handleRAG(data.query, sessionId);
      
      case 'generate-ai':
        return await handleAIGeneration(data, sessionId);
      
      case 'generate-tts':
        return await handleTTS(data.text, sessionId);
      
      case 'get-stats':
        const stats = wsManager.getStats();
        return NextResponse.json(stats);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ [WEBSOCKET API] Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

/**
 * Handle audio transcription with Groq Whisper (Ultra-Fast)
 */
async function handleTranscription(audioData: string, sessionId?: string) {
  const startTime = Date.now();
  
  try {
    // Start pipeline tracking for STT
    if (sessionId) {
      pipelineTracker.startService(sessionId, 'stt', 'Groq Whisper', 'whisper-large-v3');
    }

    try {
      // Convert base64 audio to buffer (no temp files needed!)
      const audioBuffer = Buffer.from(audioData.replace(/^data:audio\/[^;]+;base64,/, ''), 'base64');

      // Use Groq Whisper for ultra-fast transcription
      const transcription = await groqClient.transcribeAudio(audioBuffer, 'audio/webm');

      // Mark STT as completed successfully
      if (sessionId) {
        pipelineTracker.completeService(sessionId, 'stt');
      }

      const processingTime = Date.now() - startTime;
      
      return NextResponse.json({
        transcription,
        processingTime,
        model: 'groq-whisper-large-v3',
        service: 'Groq Whisper'
      });

    } catch (groqError) {
      console.error('❌ [WS API] Groq Whisper failed:', groqError);
      
      // Mark as fallback to Gemini
      if (sessionId) {
        pipelineTracker.markFallback(sessionId, 'stt', 'Gemini STT', 'gemini-2.0-flash-lite', 
          `Groq Whisper failed: ${groqError instanceof Error ? groqError.message : String(groqError)}`);
      }
      
      // Fallback transcription
      const processingTime = Date.now() - startTime;
      return NextResponse.json({
        transcription: "Hello, I couldn't transcribe your audio",
        processingTime,
        fallback: true,
        model: 'gemini-2.0-flash-lite',
        service: 'Gemini STT',
        error: groqError instanceof Error ? groqError.message : String(groqError)
      });
    }
    
  } catch (error) {
    console.error('❌ [WS API] STT processing failed:', error);
    throw error;
  }
}

/**
 * Handle user context retrieval with aggressive caching
 */
async function handleContextRetrieval(userId: string, sessionId?: string) {
  const startTime = Date.now();
  
  try {
    const userData = await aggressiveCache.getCachedData(
      `fast:user:${userId}`, // Simplified cache key
      async () => {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, company, industry, role, goals, challenges, preferred_communication_style, focus_areas')
          .eq('id', userId)
          .single();

        if (error) throw error;
        return data;
      },
      30000, // 30s memory cache
      300000 // 5min performance cache
    );

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      userData,
      processingTime
    });

  } catch (error) {
    console.error('❌ [WS API] Context retrieval failed:', error);
    throw error;
  }
}

/**
 * Handle RAG instruction retrieval
 */
async function handleRAG(query: string, sessionId?: string) {
  const startTime = Date.now();
  
  try {
    const supabase = await createClient();
    const instructions = await getRelevantInstructions(supabase, query, 5, 0.7);

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      instructions,
      processingTime
    });

  } catch (error) {
    console.error('❌ [WS API] RAG failed:', error);
    throw error;
  }
}

/**
 * Handle AI generation using Groq with fallback to Gemini
 */
async function handleAIGeneration(data: { transcription: string; userData: any; instructions: any[] }, sessionId?: string) {
  const startTime = Date.now();
  
  try {
    const { transcription, userData, instructions } = data;
    
    // Start pipeline tracking for AI generation
    if (sessionId) {
      pipelineTracker.startService(sessionId, 'ai', 'Groq', 'llama-3.1-8b-instant');
    }

    // Get optimized generation config based on transcription
    const qualityConfig = responseQualityOptimizer.getGenerationConfig('websocket-voice', transcription, 'voice');
    console.log('🎯 [QUALITY] Using optimized config:', qualityConfig);

    // Configure Groq with optimized settings
    groqClient.configure({
      model: GROQ_MODELS.FASTEST,
      maxTokens: qualityConfig.maxOutputTokens,
      temperature: qualityConfig.temperature,
      topK: qualityConfig.topK,
      topP: qualityConfig.topP
    });

    // Build system prompt with quality optimization
    let basePrompt = "You are Command HQ, an AI assistant focused on helping users achieve their goals.\n\n";
    
    if (userData) {
      basePrompt += `User Context:\n`;
      basePrompt += `- Name: ${userData.first_name} ${userData.last_name}\n`;
      basePrompt += `- Role: ${userData.role} at ${userData.company}\n`;
      basePrompt += `- Industry: ${userData.industry}\n`;
      basePrompt += `- Goals: ${userData.goals}\n`;
      basePrompt += `- Challenges: ${userData.challenges}\n`;
      basePrompt += `- Communication Style: ${userData.preferred_communication_style}\n\n`;
    }

    if (instructions && instructions.length > 0) {
      basePrompt += `Key Instructions:\n`;
      // Limit to top 2 instructions for voice responses (quality over quantity)
      instructions.slice(0, 2).forEach((instruction, index) => {
        basePrompt += `${index + 1}. ${instruction.title}: ${instruction.content}\n`;
      });
    }

    basePrompt += "\nProvide helpful, actionable responses based on this context.";
    
    // Get quality-optimized prompt enhancement with standardized config
    const { configName, maxTokens } = getQualityConfig('voice', transcription);
    const qualityEnhancement = responseQualityOptimizer.getPromptEnhancement(configName, transcription, 'voice');
    const systemPrompt = basePrompt + qualityEnhancement;

    // Generate response with standardized quality optimization
    const response = await groqClient.generateResponse([
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: transcription
      }
    ], { maxTokens });

    // Handle title generation with standardized options
    if (userData?.userId) {
      const { instance, error } = await saveToHistory(userData.userId, transcription, 'user');
      const instanceId = instance?.id;

      if (!error && instance && shouldGenerateTitle(instance.title, 2)) {
        try {
          const titleResult = await generateChatTitle(
            getTitleGenerationOptions(transcription, response)
          );
          
          if (validateTitle(titleResult.title)) {
            const { error: updateError } = await supabase
              .from('chat_history')
              .update({ title: titleResult.title })
              .eq('id', instanceId)
              .eq('user_id', userData.userId);
            
            if (!updateError) {
              emitter.emit('title-updated', {
                instanceId,
                newTitle: titleResult.title,
                timestamp: Date.now()
              });
            }
          }
        } catch (titleError) {
          console.error('❌ [AUTO-TITLE] Title generation failed:', titleError);
        }
      }

      await saveToHistory(userData.userId, response, 'assistant', instanceId);
    }

    const duration = Date.now() - startTime;
    if (sessionId) {
      pipelineTracker.completeService(sessionId, 'ai');
    }

    return { response, duration };
  } catch (error) {
    console.error('❌ [AI] Generation failed:', error);
    throw error;
  }
}

/**
 * Handle TTS generation - Instant Response
 */
async function handleTTS(text: string, sessionId?: string) {
  const startTime = Date.now();
  
  try {
    // Return immediately with minimal processing for speed
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json({
      text: text,
      audioUrl: null,
      processingTime,
      model: 'instant',
      useBrowserTTS: true
    });

  } catch (error) {
    console.error('❌ [WS API] TTS failed:', error);
    throw error;
  }
}