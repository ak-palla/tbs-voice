import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getRelevantInstructions } from "@/utils/embeddings";

export async function GET() {
  try {
    console.log('🔍 [VECTOR DIAGNOSIS] Starting comprehensive vector search diagnosis...');
    
    const supabase = await createClient();
    const results: any = {
      timestamp: new Date().toISOString(),
      issues: [],
      recommendations: [],
      status: 'unknown'
    };

    // 1. Check if chatbot_instructions table exists and has data
    console.log('📋 [CHECK 1] Examining chatbot_instructions table...');
    try {
      const { data: instructions, error: instructionsError } = await supabase
        .from('chatbot_instructions')
        .select('id, title, content, is_active, embedding, created_at')
        .limit(5);

      if (instructionsError) {
        results.issues.push(`Table access error: ${instructionsError.message}`);
        results.recommendations.push('Check database permissions and table existence');
      } else {
        results.totalInstructions = instructions?.length || 0;
        results.sampleInstructions = instructions?.map(i => ({
          id: i.id,
          title: i.title,
          hasEmbedding: !!i.embedding,
          isActive: i.is_active,
          contentLength: i.content?.length || 0
        }));

        if (!instructions || instructions.length === 0) {
          results.issues.push('No instructions found in chatbot_instructions table');
          results.recommendations.push('Add instructions via /admin/instructions or populate the table');
        }

        const activeInstructions = instructions?.filter(i => i.is_active) || [];
        const withEmbeddings = instructions?.filter(i => i.embedding) || [];
        
        results.activeInstructions = activeInstructions.length;
        results.instructionsWithEmbeddings = withEmbeddings.length;

        if (activeInstructions.length === 0) {
          results.issues.push('No active instructions found');
          results.recommendations.push('Set is_active = true for relevant instructions');
        }

        if (withEmbeddings.length === 0) {
          results.issues.push('No embeddings found - this is likely the main issue');
          results.recommendations.push('Generate embeddings via /admin/rag or /api/embeddings/init');
        }
      }
    } catch (error) {
      results.issues.push(`Table query failed: ${error}`);
    }

    // 2. Check if match_chatbot_instructions function exists
    console.log('🔧 [CHECK 2] Testing match_chatbot_instructions function...');
    try {
      // Test with a dummy embedding (zeros)
      const dummyEmbedding = new Array(1536).fill(0);
      
      const { data: functionTest, error: functionError } = await supabase.rpc(
        'match_chatbot_instructions',
        {
          query_embedding: dummyEmbedding,
          match_threshold: 0.5,
          match_count: 1
        }
      );

      if (functionError) {
        results.issues.push(`Function error: ${functionError.message}`);
        results.recommendations.push('Create or fix match_chatbot_instructions function in Supabase');
      } else {
        results.functionExists = true;
        results.functionTestResult = functionTest?.length || 0;
      }
    } catch (error) {
      results.issues.push(`Function test failed: ${error}`);
      results.recommendations.push('Ensure match_chatbot_instructions function exists in database');
    }

    // 3. Test vector search with real query
    console.log('🎯 [CHECK 3] Testing semantic search...');
    try {
      const testQuery = "help me with business strategy";
      const searchResults = await getRelevantInstructions(supabase, testQuery, 5, 0.5);
      
      results.semanticSearchResults = searchResults.length;
      results.searchSample = searchResults.slice(0, 3).map(r => ({
        title: r.title,
        similarity: (r as any).similarity,
        hasContent: !!r.content
      }));

      if (searchResults.length === 0) {
        results.issues.push('Semantic search returns 0 results even with low threshold');
        results.recommendations.push('Check embeddings generation and vector search setup');
      }
    } catch (error) {
      results.issues.push(`Semantic search failed: ${error}`);
      results.recommendations.push('Fix getRelevantInstructions function or OpenAI API key');
    }

    // 4. Check OpenAI API key
    console.log('🔑 [CHECK 4] Checking OpenAI API configuration...');
    const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      results.issues.push('No OpenAI API key found');
      results.recommendations.push('Set NEXT_PUBLIC_OPENAI_API_KEY or OPENAI_API_KEY in environment');
    } else {
      results.hasOpenAIKey = true;
      results.openaiKeyLength = openaiKey.length;
    }

    // 5. Determine overall status
    if (results.issues.length === 0) {
      results.status = 'healthy';
    } else if (results.instructionsWithEmbeddings > 0) {
      results.status = 'partial';
    } else {
      results.status = 'broken';
    }

    console.log('✅ [VECTOR DIAGNOSIS] Diagnosis complete');
    console.log(`📊 [SUMMARY] Status: ${results.status}, Issues: ${results.issues.length}`);

    return NextResponse.json(results, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ [VECTOR DIAGNOSIS] Diagnosis failed:', error);
    
    return NextResponse.json({
      error: 'Diagnosis failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}