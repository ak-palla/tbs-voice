import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getRelevantInstructions } from "@/utils/embeddings";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'business growth machine';
    const threshold = parseFloat(searchParams.get('threshold') || '0.3');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log(`🧪 [TEST QUERY] Testing: "${query}" (threshold: ${threshold})`);
    
    const supabase = await createClient();
    const results = await getRelevantInstructions(supabase, query, limit, threshold);
    
    const response = {
      query,
      threshold,
      limit,
      resultsFound: results.length,
      results: results.map(r => ({
        title: r.title,
        similarity: (r as any).similarity,
        contentPreview: r.content?.substring(0, 100) + '...',
        contentLength: r.content?.length
      }))
    };
    
    console.log(`🎯 [TEST RESULTS] Found ${results.length} results for "${query}"`);
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}