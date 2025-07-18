import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getRelevantInstructions } from "@/utils/embeddings";

// Create a simple streaming response to test if streaming causes the 500 error
function createStreamingResponse() {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial data
      controller.enqueue(encoder.encode(JSON.stringify({
        type: 'transcription',
        data: 'Hello nuclear streaming test'
      }) + '\n'));
      
      // Send AI response
      controller.enqueue(encoder.encode(JSON.stringify({
        type: 'ai-response', 
        data: 'This is a streaming nuclear test response!'
      }) + '\n'));
      
      // Send TTS data
      controller.enqueue(encoder.encode(JSON.stringify({
        type: 'tts-warning',
        message: 'Using browser text-to-speech for maximum speed',
        fallbackText: 'This is a streaming nuclear test response!',
        nuclear: true
      }) + '\n'));
      
      // Close stream
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked'
    }
  });
}

export async function POST(req: Request) {
  try {
    console.error('🧪 [TEST ROUTE] Testing nuclear optimizations');
    const startTime = Date.now();
    
    const { audio, userId, testStreaming, testPromiseAll, testDependencies } = await req.json();
    
    // Test streaming if requested
    if (testStreaming) {
      console.error('🧪 [TEST ROUTE] Testing streaming response');
      return createStreamingResponse();
    }
    
    // Test Promise.all() pattern like in main route
    if (testPromiseAll) {
      console.error('🧪 [TEST ROUTE] Testing Promise.all() pattern');
      
      // Simulate the Promise.all pattern from main route
      const [transcriptionResult, aiResult, ttsResult] = await Promise.all([
        // Transcription promise - NUCLEAR OPTIMIZATION (WORKING)
        (async () => {
          console.error('⚡ [NUCLEAR STT] Ultra-fast transcription bypass');
          const startTime = Date.now();
          
          // Nuclear optimization: Return instant transcription
          const transcription = "Hello Promise.all test";
          const duration = Date.now() - startTime;
          
          console.error(`🚀 [NUCLEAR STT] Completed in ${duration}ms: "${transcription}"`);
          return transcription;
        })(),
        
        // AI Generation promise - simulate
        (async () => {
          console.error('⚡ [NUCLEAR AI] Ultra-fast AI bypass');
          const startTime = Date.now();
          
          const aiResponse = "This is a Promise.all nuclear test response!";
          const duration = Date.now() - startTime;
          
          console.error(`🚀 [NUCLEAR AI] Completed in ${duration}ms`);
          return aiResponse;
        })(),
        
        // TTS promise - NUCLEAR OPTIMIZATION (WORKING)
        (async () => {
          console.error('⚡ [NUCLEAR TTS] Ultra-fast TTS bypass');
          const startTime = Date.now();
          
          try {
            const ttsResponse = {
              type: 'tts-warning',
              message: 'Using browser text-to-speech for maximum speed',
              fallbackText: "This is a Promise.all nuclear test response!",
              nuclear: true,
              processingTime: Date.now() - startTime
            };
            
            console.error(`🚀 [NUCLEAR TTS] Completed in ${Date.now() - startTime}ms - browser TTS ready`);
            return ttsResponse;
          } catch (ttsError) {
            console.error(`⚠️ [NUCLEAR TTS] Write error:`, ttsError);
            throw ttsError;
          }
        })()
      ]);
      
      const response = {
        transcription: transcriptionResult,
        aiResponse: aiResult,
        ttsResult,
        processingTime: Date.now() - startTime,
        test: true,
        nuclear: true,
        promiseAll: true
      };
      
      console.error(`🚀 [TEST ROUTE] Promise.all test completed in ${response.processingTime}ms`);
      return NextResponse.json(response);
    }
    
    // Test external dependencies that might cause 500 errors
    if (testDependencies) {
      console.error('🧪 [TEST ROUTE] Testing external dependencies');
      
      try {
        // Test Supabase client creation
        const supabase = await createClient();
        console.error('✅ [TEST ROUTE] Supabase client created successfully');
        
        // Test embedding function call (this was the bottleneck we fixed)
        const testQuery = "Hello test query";
        console.error('🔄 [TEST ROUTE] Testing getRelevantInstructions...');
        
        const instructions = await getRelevantInstructions(supabase, testQuery, 1, 0.7);
        console.error(`✅ [TEST ROUTE] getRelevantInstructions completed, found ${instructions.length} instructions`);
        
        const response = {
          transcription: "Hello dependency test",
          aiResponse: "Dependencies test completed successfully!",
          supabaseWorking: true,
          embeddingsWorking: true,
          instructionsFound: instructions.length,
          processingTime: Date.now() - startTime,
          test: true,
          dependencies: true
        };
        
        console.error(`🚀 [TEST ROUTE] Dependencies test completed in ${response.processingTime}ms`);
        return NextResponse.json(response);
        
      } catch (depError) {
        console.error('❌ [TEST ROUTE] Dependencies error:', depError);
        return NextResponse.json({ 
          error: `Dependencies failed: ${depError instanceof Error ? depError.message : String(depError)}`,
          test: true,
          dependencies: true
        }, { status: 500 });
      }
    }
    
    // Test nuclear STT optimization
    const transcriptionPromise = (async () => {
      console.error('⚡ [NUCLEAR STT TEST] Ultra-fast transcription bypass');
      const sttStart = Date.now();
      
      const transcription = "Hello nuclear test";
      const duration = Date.now() - sttStart;
      
      console.error(`🚀 [NUCLEAR STT TEST] Completed in ${duration}ms: "${transcription}"`);
      return transcription;
    })();
    
    // Test nuclear TTS optimization (minimal version)
    const processTTSTest = async (text: string) => {
      console.error('⚡ [NUCLEAR TTS TEST] Ultra-fast TTS bypass');
      const ttsStart = Date.now();
      
      try {
        // Nuclear optimization: Instant browser TTS fallback
        const ttsResponse = {
          type: 'tts-warning',
          message: 'Using browser text-to-speech for maximum speed',
          fallbackText: text.trim(),
          nuclear: true,
          processingTime: Date.now() - ttsStart
        };
        
        console.error(`🚀 [NUCLEAR TTS TEST] Completed in ${Date.now() - ttsStart}ms - browser TTS ready`);
        return ttsResponse;
      } catch (ttsError) {
        console.error(`⚠️ [NUCLEAR TTS TEST] Error:`, ttsError);
        throw ttsError;
      }
    };
    
    const transcription = await transcriptionPromise;
    const ttsResult = await processTTSTest("This is a test response with nuclear optimizations!");
    
    const response = {
      transcription,
      aiResponse: "This is a test response with nuclear STT + TTS optimization!",
      ttsResult,
      processingTime: Date.now() - startTime,
      test: true,
      nuclear: true
    };
    
    console.error(`🚀 [TEST ROUTE] Nuclear STT + TTS test completed in ${response.processingTime}ms`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ [TEST ROUTE] Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error),
      test: true 
    }, { status: 500 });
  }
}