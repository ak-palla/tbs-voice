import { NextResponse } from "next/server";
import { generateQueryEmbedding } from "@/utils/embeddings";
import { embeddingCache } from "@/utils/embedding-cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'test business strategy';
    
    console.error(`🧪 [CACHE TEST] Testing cache with query: "${query}"`);
    
    // Clear cache first
    embeddingCache.clear();
    console.error(`🧹 [CACHE TEST] Cache cleared`);
    
    // Test 1: First call (should be cache miss)
    console.error(`🧪 [TEST 1] First call - expecting cache miss`);
    const start1 = Date.now();
    const embedding1 = await generateQueryEmbedding(query);
    const time1 = Date.now() - start1;
    
    // Test 2: Second call (should be cache hit)
    console.error(`🧪 [TEST 2] Second call - expecting cache hit`);
    const start2 = Date.now();
    const embedding2 = await generateQueryEmbedding(query);
    const time2 = Date.now() - start2;
    
    // Get cache stats
    const stats = embeddingCache.getStats();
    const performanceReport = embeddingCache.getPerformanceReport();
    
    console.error(`📊 [CACHE TEST] Results:`);
    console.error(`   First call: ${time1}ms`);
    console.error(`   Second call: ${time2}ms`);
    console.error(`   Speed improvement: ${time1 > 0 ? Math.round(((time1 - time2) / time1) * 100) : 0}%`);
    console.error(performanceReport);
    
    return NextResponse.json({
      success: true,
      query,
      test1: {
        time: time1,
        embeddingLength: embedding1.length,
        description: 'First call (cache miss expected)'
      },
      test2: {
        time: time2,
        embeddingLength: embedding2.length,
        description: 'Second call (cache hit expected)'
      },
      speedImprovement: time1 > 0 ? Math.round(((time1 - time2) / time1) * 100) : 0,
      cacheStats: stats,
      performanceReport,
      embeddingsMatch: JSON.stringify(embedding1) === JSON.stringify(embedding2)
    });
    
  } catch (error) {
    console.error('❌ [CACHE TEST] Test failed:', error);
    return NextResponse.json({
      error: 'Cache test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}