import { NextResponse } from "next/server";
import { embeddingCache } from "@/utils/embedding-cache";

export async function GET() {
  try {
    const stats = embeddingCache.getStats();
    const performanceReport = embeddingCache.getPerformanceReport();
    
    console.log('📊 [CACHE STATS] Request for cache statistics');
    console.log(performanceReport);
    
    return NextResponse.json({
      success: true,
      stats,
      report: performanceReport,
      recommendations: generateRecommendations(stats),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [CACHE STATS] Failed to get statistics:', error);
    return NextResponse.json({
      error: 'Failed to get cache statistics',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    embeddingCache.clear();
    console.log('🧹 [CACHE] Manual cache clear requested');
    
    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [CACHE] Failed to clear cache:', error);
    return NextResponse.json({
      error: 'Failed to clear cache',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

function generateRecommendations(stats: any): string[] {
  const recommendations: string[] = [];
  
  if (stats.hitRate < 0.3) {
    recommendations.push('Low hit rate - consider increasing cache TTL or query normalization');
  }
  
  if (stats.hitRate > 0.7) {
    recommendations.push('Excellent hit rate - cache is performing optimally');
  }
  
  if (stats.memoryUsageMB > 40) {
    recommendations.push('High memory usage - consider reducing cache size or TTL');
  }
  
  if (stats.size > 800) {
    recommendations.push('Large cache size - monitor memory usage and cleanup frequency');
  }
  
  if (stats.totalRequests > 100 && stats.hitRate > 0.5) {
    const speedImprovement = Math.round(stats.hitRate * 70);
    recommendations.push(`Performance boost: ~${speedImprovement}% faster embedding retrieval`);
  }
  
  return recommendations;
}