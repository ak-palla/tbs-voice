import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getRelevantInstructions } from "@/utils/embeddings";
import { generateQueryEmbedding } from "@/utils/embeddings";

interface RAGAnalysisResult {
  query: string;
  timestamp: string;
  retrievalMetrics: {
    totalRetrieved: number;
    averageSimilarity: number;
    topSimilarity: number;
    thresholdUsed: number;
    retrievalTime: number;
  };
  contentAnalysis: {
    relevantSources: Array<{
      title: string;
      similarity: number;
      contentSnippet: string;
      category: string;
    }>;
    categoryDistribution: Record<string, number>;
    priorityDistribution: Record<string, number>;
  };
  qualityMetrics: {
    retrievalPrecision: number; // How many retrieved docs were actually relevant
    coverageScore: number; // How well the query intent was covered
    diversityScore: number; // Diversity of sources retrieved
  };
  recommendations: string[];
}

export async function POST(request: Request) {
  try {
    const { query, thresholds = [0.5, 0.6, 0.7, 0.8] } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    console.log(`🔍 [RAG ANALYSIS] Analyzing query: "${query}"`);
    
    const supabase = await createClient();
    const startTime = Date.now();

    // Test multiple similarity thresholds
    const thresholdResults = await Promise.all(
      thresholds.map(async (threshold: number) => {
        const retrievalStart = Date.now();
        const results = await getRelevantInstructions(supabase, query, 10, threshold);
        const retrievalTime = Date.now() - retrievalStart;

        const similarities = results.map(r => (r as any).similarity).filter(s => s !== undefined);
        
        return {
          threshold,
          results,
          retrievalTime,
          count: results.length,
          averageSimilarity: similarities.length > 0 ? similarities.reduce((a, b) => a + b, 0) / similarities.length : 0,
          topSimilarity: similarities.length > 0 ? Math.max(...similarities) : 0
        };
      })
    );

    // Find optimal threshold (highest count with good similarity)
    const optimalThreshold = thresholdResults.reduce((best, current) => {
      if (current.count > best.count) return current;
      if (current.count === best.count && current.averageSimilarity > best.averageSimilarity) return current;
      return best;
    }, thresholdResults[0]);

    console.log(`🎯 [RAG ANALYSIS] Optimal threshold: ${optimalThreshold.threshold} (${optimalThreshold.count} results)`);

    // Detailed analysis of optimal results
    const detailedResults = optimalThreshold.results;
    
    // Category and priority analysis
    const categoryDistribution: Record<string, number> = {};
    const priorityDistribution: Record<string, number> = {};
    
    detailedResults.forEach(result => {
      const category = (result as any).category || 'uncategorized';
      const priority = (result as any).priority || 0;
      
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
      priorityDistribution[priority.toString()] = (priorityDistribution[priority.toString()] || 0) + 1;
    });

    // Calculate quality metrics
    const retrievalPrecision = detailedResults.length > 0 ? 
      detailedResults.filter(r => (r as any).similarity && (r as any).similarity > 0.6).length / detailedResults.length : 0;
    
    const coverageScore = Math.min(1.0, detailedResults.length / 5); // Ideal is 3-5 relevant results
    
    const diversityScore = Object.keys(categoryDistribution).length / Math.max(1, detailedResults.length);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (detailedResults.length === 0) {
      recommendations.push("🔴 No results retrieved - check if embeddings exist and threshold is appropriate");
      recommendations.push("🔧 Try running /api/embeddings/init to generate embeddings");
    } else if (detailedResults.length < 3) {
      recommendations.push("🟡 Low result count - consider lowering similarity threshold");
    }

    if (retrievalPrecision < 0.6) {
      recommendations.push("🟡 Low precision - many results have low similarity scores");
      recommendations.push("🔧 Consider raising similarity threshold or improving instruction quality");
    }

    if (diversityScore < 0.3) {
      recommendations.push("🟡 Low diversity - results are concentrated in few categories");
      recommendations.push("🔧 Consider adding more diverse instruction categories");
    }

    if (optimalThreshold.averageSimilarity < 0.65) {
      recommendations.push("🟡 Low average similarity - query might not match existing content well");
      recommendations.push("💡 Consider adding more instructions covering this topic area");
    }

    const analysis: RAGAnalysisResult = {
      query,
      timestamp: new Date().toISOString(),
      retrievalMetrics: {
        totalRetrieved: optimalThreshold.count,
        averageSimilarity: optimalThreshold.averageSimilarity,
        topSimilarity: optimalThreshold.topSimilarity,
        thresholdUsed: optimalThreshold.threshold,
        retrievalTime: optimalThreshold.retrievalTime
      },
      contentAnalysis: {
        relevantSources: detailedResults.slice(0, 5).map(result => ({
          title: result.title || 'Untitled',
          similarity: (result as any).similarity || 0,
          contentSnippet: result.content.substring(0, 200) + (result.content.length > 200 ? '...' : ''),
          category: (result as any).category || 'uncategorized'
        })),
        categoryDistribution,
        priorityDistribution
      },
      qualityMetrics: {
        retrievalPrecision,
        coverageScore,
        diversityScore
      },
      recommendations
    };

    // Additional analysis: Test embedding generation
    try {
      const embeddingStart = Date.now();
      await generateQueryEmbedding(query);
      const embeddingTime = Date.now() - embeddingStart;
      
      (analysis as any).embeddingMetrics = {
        generationTime: embeddingTime,
        status: 'success'
      };
    } catch (error) {
      (analysis as any).embeddingMetrics = {
        generationTime: -1,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      };
      recommendations.push("🔴 Embedding generation failed - check OpenAI API key");
    }

    // Test all thresholds summary
    (analysis as any).thresholdComparison = thresholdResults.map(tr => ({
      threshold: tr.threshold,
      resultCount: tr.count,
      averageSimilarity: tr.averageSimilarity,
      retrievalTime: tr.retrievalTime
    }));

    const totalTime = Date.now() - startTime;
    console.log(`✅ [RAG ANALYSIS] Analysis complete in ${totalTime}ms`);

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('❌ [RAG ANALYSIS] Analysis failed:', error);
    
    return NextResponse.json({
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  // Test with common business queries
  const testQueries = [
    "How can I improve my business?",
    "What are the best marketing strategies?",
    "How do I increase sales?",
    "How can I showcase my business more on social media platform?",
    "Help me with business planning",
    "What is a business battle plan?"
  ];

  const results = [];
  
  for (const query of testQueries) {
    try {
      const response = await POST(new Request('http://localhost:3000/api/debug/rag-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      }));
      
      const analysis = await response.json();
      results.push(analysis);
    } catch (error) {
      results.push({
        query,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return NextResponse.json({
    testResults: results,
    summary: {
      totalQueries: testQueries.length,
      successfulAnalyses: results.filter(r => !r.error).length,
      averageRetrievalCount: results
        .filter(r => !r.error && r.retrievalMetrics)
        .reduce((sum, r) => sum + r.retrievalMetrics.totalRetrieved, 0) / 
        Math.max(1, results.filter(r => !r.error && r.retrievalMetrics).length)
    }
  });
} 