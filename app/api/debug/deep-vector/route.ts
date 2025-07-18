import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateQueryEmbedding } from "@/utils/embeddings";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'business growth machine';
    
    console.error(`🔬 [DEEP DEBUG] Testing vector search components for: "${query}"`);
    
    const supabase = await createClient();
    const results: any = {
      query,
      timestamp: new Date().toISOString(),
      steps: []
    };

    // Step 1: Test embedding generation
    console.error('🔬 [STEP 1] Testing embedding generation...');
    try {
      const embedding = await generateQueryEmbedding(query);
      results.steps.push({
        step: 1,
        name: 'Embedding Generation',
        success: true,
        embeddingLength: embedding.length,
        embeddingPreview: embedding.slice(0, 5)
      });
      console.error(`✅ [STEP 1] Generated ${embedding.length}-dimensional embedding`);
      
      // Step 2: Test RPC function directly
      console.error('🔬 [STEP 2] Testing RPC function directly...');
      try {
        const { data: rpcResults, error: rpcError } = await supabase.rpc(
          'match_chatbot_instructions',
          {
            query_embedding: embedding,
            match_threshold: 0.1, // Very low threshold
            match_count: 10
          }
        );
        
        if (rpcError) {
          results.steps.push({
            step: 2,
            name: 'RPC Function Call',
            success: false,
            error: rpcError.message,
            errorCode: rpcError.code
          });
          console.error(`❌ [STEP 2] RPC Error:`, rpcError);
        } else {
          results.steps.push({
            step: 2,
            name: 'RPC Function Call',
            success: true,
            resultsCount: rpcResults?.length || 0,
            results: rpcResults?.slice(0, 3).map((r: any) => ({
              id: r.id,
              title: r.title,
              similarity: r.similarity,
              hasEmbedding: !!r.embedding
            }))
          });
          console.error(`✅ [STEP 2] RPC returned ${rpcResults?.length || 0} results`);
        }
        
        // Step 3: Test direct table query to see raw embeddings
        console.error('🔬 [STEP 3] Checking raw embeddings in database...');
        try {
          const { data: rawData, error: rawError } = await supabase
            .from('chatbot_instructions')
            .select('id, title, embedding, is_active')
            .eq('is_active', true)
            .not('embedding', 'is', null)
            .limit(5);
            
          if (rawError) {
            results.steps.push({
              step: 3,
              name: 'Raw Embedding Check',
              success: false,
              error: rawError.message
            });
          } else {
            results.steps.push({
              step: 3,
              name: 'Raw Embedding Check',
              success: true,
              embeddingsFound: rawData?.length || 0,
              embeddings: rawData?.map(r => ({
                id: r.id,
                title: r.title,
                hasEmbedding: !!r.embedding,
                embeddingLength: r.embedding ? r.embedding.length : 0
              }))
            });
            console.error(`✅ [STEP 3] Found ${rawData?.length || 0} records with embeddings`);
          }
          
          // Step 4: Manual similarity calculation
          if (rawData && rawData.length > 0 && rawData[0].embedding) {
            console.error('🔬 [STEP 4] Testing manual similarity calculation...');
            try {
              // Calculate cosine similarity manually for first embedding
              const firstEmbedding = rawData[0].embedding;
              const dotProduct = embedding.reduce((sum, a, i) => sum + a * firstEmbedding[i], 0);
              const magnitudeA = Math.sqrt(embedding.reduce((sum, a) => sum + a * a, 0));
              const magnitudeB = Math.sqrt(firstEmbedding.reduce((sum, b) => sum + b * b, 0));
              const similarity = dotProduct / (magnitudeA * magnitudeB);
              
              results.steps.push({
                step: 4,
                name: 'Manual Similarity Test',
                success: true,
                testTitle: rawData[0].title,
                similarity: similarity,
                similarityThresholdTest: similarity > 0.1 ? 'PASS' : 'FAIL'
              });
              
              console.error(`✅ [STEP 4] Manual similarity: ${similarity} with "${rawData[0].title}"`);
            } catch (simError) {
              results.steps.push({
                step: 4,
                name: 'Manual Similarity Test',
                success: false,
                error: simError instanceof Error ? simError.message : String(simError)
              });
            }
          }
          
        } catch (rawQueryError) {
          results.steps.push({
            step: 3,
            name: 'Raw Embedding Check',
            success: false,
            error: rawQueryError instanceof Error ? rawQueryError.message : String(rawQueryError)
          });
        }
        
      } catch (rpcCallError) {
        results.steps.push({
          step: 2,
          name: 'RPC Function Call',
          success: false,
          error: rpcCallError instanceof Error ? rpcCallError.message : String(rpcCallError)
        });
      }
      
    } catch (embeddingError) {
      results.steps.push({
        step: 1,
        name: 'Embedding Generation',
        success: false,
        error: embeddingError instanceof Error ? embeddingError.message : String(embeddingError)
      });
    }
    
    // Summary
    const successfulSteps = results.steps.filter((s: any) => s.success).length;
    results.summary = {
      totalSteps: results.steps.length,
      successfulSteps,
      overallSuccess: successfulSteps === results.steps.length
    };
    
    console.error(`🔬 [SUMMARY] ${successfulSteps}/${results.steps.length} steps successful`);
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('❌ [DEEP DEBUG] Test failed:', error);
    return NextResponse.json({
      error: 'Deep debug test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}