import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getRelevantInstructions } from "@/utils/embeddings";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'business growth machine';
    const threshold = parseFloat(searchParams.get('threshold') || '0.1');
    
    console.error(`🧪 [SEMANTIC TEST] Testing: "${query}" with threshold ${threshold}`);
    
    const supabase = await createClient();
    
    // Test 1: Check if embeddings are now proper vectors
    console.error('🔍 [TEST 1] Checking embedding format after fix...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('chatbot_instructions')
      .select('id, title, embedding')
      .not('embedding', 'is', null)
      .limit(1);
      
    if (sampleError) {
      console.error('❌ [TEST 1] Error:', sampleError);
    } else if (sampleData && sampleData.length > 0) {
      const embedding = sampleData[0].embedding;
      const embeddingType = typeof embedding;
      const embeddingLength = Array.isArray(embedding) ? embedding.length : (typeof embedding === 'string' ? embedding.length : 'unknown');
      console.error(`✅ [TEST 1] Embedding format: ${embeddingType}, length: ${embeddingLength}`);
    }
    
    // Test 2: Use getRelevantInstructions function
    console.error('🔍 [TEST 2] Testing getRelevantInstructions...');
    const semanticResults = await getRelevantInstructions(supabase, query, 10, threshold);
    console.error(`✅ [TEST 2] getRelevantInstructions returned: ${semanticResults.length} results`);
    
    // Test 3: Direct RPC call with very low threshold
    console.error('🔍 [TEST 3] Direct RPC call...');
    try {
      const { generateQueryEmbedding } = await import('@/utils/embeddings');
      const queryEmbedding = await generateQueryEmbedding(query);
      
      const { data: rpcResults, error: rpcError } = await supabase.rpc(
        'match_chatbot_instructions',
        {
          query_embedding: queryEmbedding,
          match_threshold: 0.01, // Extremely low threshold
          match_count: 10
        }
      );
      
      if (rpcError) {
        console.error('❌ [TEST 3] RPC Error:', rpcError);
      } else {
        console.error(`✅ [TEST 3] Direct RPC returned: ${rpcResults?.length || 0} results`);
        if (rpcResults && rpcResults.length > 0) {
          rpcResults.slice(0, 3).forEach((r: any, i: number) => {
            console.error(`📋 [TEST 3] ${i + 1}. "${r.title}" (similarity: ${r.similarity})`);
          });
        }
      }
    } catch (rpcTestError) {
      console.error('❌ [TEST 3] RPC test failed:', rpcTestError);
    }
    
    return NextResponse.json({
      query,
      threshold,
      semanticResults: semanticResults.length,
      results: semanticResults.slice(0, 5).map(r => ({
        title: r.title,
        similarity: (r as any).similarity,
        contentPreview: r.content?.substring(0, 100)
      })),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [SEMANTIC TEST] Failed:', error);
    return NextResponse.json({
      error: 'Semantic test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}