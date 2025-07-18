/**
 * Enhanced Embeddings Service with Document Chunking Support
 * Provides improved RAG precision through intelligent text chunking
 */

import OpenAI from "openai";
import { SupabaseClient } from "@supabase/supabase-js";
import { getCachedEmbedding, embeddingCache } from "./embedding-cache";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  timeout: 5000,
});

interface ChunkResult {
  chunk_id: string;
  instruction_id: string;
  content: string;
  chunk_index: number;
  chunk_type: string;
  metadata: any;
  parent_title: string;
  parent_content_type: string;
  parent_url: string | null;
  similarity: number;
}

interface EnhancedInstruction {
  content: string;
  content_type: string;
  url: string | null;
  title: string;
  similarity: number;
  chunk_info: {
    is_chunk: boolean;
    chunk_index?: number;
    chunk_type?: string;
    total_chunks?: number;
  };
}

/**
 * Enhanced embedding generation with retry and fallback
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  console.error(`🔄 [ENHANCED EMBEDDING] Processing: "${query.substring(0, 30)}..."`);
  
  if (!query || typeof query !== 'string') {
    console.error(`⚠️ [ENHANCED EMBEDDING] Invalid query, using fallback`);
    query = 'Hello';
  }
  
  try {
    const result = await Promise.race([
      getCachedEmbedding(query, _generateEmbedding),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Embedding timeout')), 3000)
      )
    ]);
    console.error(`✅ [ENHANCED EMBEDDING] Generated (${result.length}D)`);
    return result;
  } catch (error) {
    console.error(`⚠️ [ENHANCED EMBEDDING] Failed, using zero vector: ${error}`);
    return new Array(1536).fill(0);
  }
}

/**
 * Generate embedding using OpenAI
 */
async function _generateEmbedding(query: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
    dimensions: 1536,
  });
  return response.data[0].embedding;
}

/**
 * Enhanced RAG retrieval with chunking support and reranking
 */
export async function getRelevantInstructionsEnhanced(
  supabase: SupabaseClient<any, "public", any>,
  query: string,
  options: {
    limit?: number;
    useChunks?: boolean;
    enableReranking?: boolean;
    adaptiveThreshold?: boolean;
    maxSimilarityThreshold?: number;
    minSimilarityThreshold?: number;
  } = {}
): Promise<EnhancedInstruction[]> {
  const {
    limit = 10,
    useChunks = true,
    enableReranking = true,
    adaptiveThreshold = true,
    maxSimilarityThreshold = 0.8,
    minSimilarityThreshold = 0.5
  } = options;

  console.error(`🔍 [ENHANCED RAG] Starting retrieval for: "${query.substring(0, 30)}..."`);
  console.error(`🔧 [ENHANCED RAG] Config: chunks=${useChunks}, rerank=${enableReranking}, adaptive=${adaptiveThreshold}`);

  try {
    // Generate query embedding
    const queryEmbedding = await generateQueryEmbedding(query);
    
    if (queryEmbedding.every(val => val === 0)) {
      console.error(`⚠️ [ENHANCED RAG] Zero embedding, using fallback`);
      return await getFallbackInstructions(supabase, limit);
    }

    // Determine optimal similarity threshold
    const similarityThreshold = adaptiveThreshold 
      ? await getOptimalThreshold(supabase, queryEmbedding, query)
      : 0.6;

    console.error(`📊 [ENHANCED RAG] Using threshold: ${similarityThreshold}`);

    let results: EnhancedInstruction[] = [];

    if (useChunks) {
      // Try chunk-based search first
      results = await searchWithChunks(supabase, queryEmbedding, similarityThreshold, limit);
      
      // If insufficient results, fall back to full instructions
      if (results.length < Math.min(3, limit)) {
        console.error(`📊 [ENHANCED RAG] Chunk search yielded ${results.length} results, adding full instructions`);
        const fullResults = await searchFullInstructions(supabase, queryEmbedding, similarityThreshold * 0.9, limit - results.length);
        results = [...results, ...fullResults];
      }
    } else {
      results = await searchFullInstructions(supabase, queryEmbedding, similarityThreshold, limit);
    }

    // Apply reranking if enabled
    if (enableReranking && results.length > 1) {
      results = await rerankResults(results, query);
    }

    // Final deduplication and limiting
    results = deduplicateResults(results).slice(0, limit);

    console.error(`✅ [ENHANCED RAG] Retrieved ${results.length} instructions (avg similarity: ${(results.reduce((sum, r) => sum + r.similarity, 0) / results.length).toFixed(3)})`);
    
    return results;

  } catch (error) {
    console.error(`❌ [ENHANCED RAG] Error: ${error}`);
    return await getFallbackInstructions(supabase, limit);
  }
}

/**
 * Search using chunk-based approach
 */
async function searchWithChunks(
  supabase: SupabaseClient,
  queryEmbedding: number[],
  threshold: number,
  limit: number
): Promise<EnhancedInstruction[]> {
  const { data: chunks, error } = await supabase.rpc(
    'match_instruction_chunks',
    {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit * 2, // Get more chunks to allow for deduplication
      chunk_types: ['semantic', 'fixed', 'single']
    }
  );

  if (error) {
    console.error(`❌ [ENHANCED RAG] Chunk search failed: ${error}`);
    return [];
  }

  return (chunks as ChunkResult[] || []).map(chunk => ({
    content: chunk.content,
    content_type: chunk.parent_content_type,
    url: chunk.parent_url,
    title: chunk.parent_title,
    similarity: chunk.similarity,
    chunk_info: {
      is_chunk: true,
      chunk_index: chunk.chunk_index,
      chunk_type: chunk.chunk_type,
      total_chunks: chunk.metadata?.total_chunks || 1
    }
  }));
}

/**
 * Search using full instructions
 */
async function searchFullInstructions(
  supabase: SupabaseClient,
  queryEmbedding: number[],
  threshold: number,
  limit: number
): Promise<EnhancedInstruction[]> {
  const { data: instructions, error } = await supabase.rpc(
    'match_instructions_enhanced',
    {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      use_chunks: false
    }
  );

  if (error) {
    console.error(`❌ [ENHANCED RAG] Full instruction search failed: ${error}`);
    return [];
  }

  return instructions || [];
}

/**
 * Determine optimal similarity threshold based on query characteristics
 */
async function getOptimalThreshold(
  supabase: SupabaseClient,
  queryEmbedding: number[],
  query: string
): Promise<number> {
  // Analyze query characteristics
  const queryLength = query.length;
  const hasQuestionWords = /\b(what|how|why|when|where|who|which|can|could|should|would|will)\b/i.test(query);
  const hasSpecificTerms = /\b(step|process|guide|tutorial|example|specific|exact)\b/i.test(query);
  
  let baseThreshold = 0.6;
  
  // Adjust based on query characteristics
  if (hasQuestionWords) {
    baseThreshold += 0.05; // Slightly higher for questions
  }
  
  if (hasSpecificTerms) {
    baseThreshold += 0.1; // Higher for specific requests
  }
  
  if (queryLength < 20) {
    baseThreshold -= 0.05; // Lower for short queries
  } else if (queryLength > 100) {
    baseThreshold += 0.05; // Higher for long queries
  }
  
  // Quick sample to check data distribution
  try {
    const { data: sample } = await supabase.rpc(
      'match_chatbot_instructions',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: 5
      }
    );
    
    if (sample && sample.length > 0) {
      const avgSimilarity = sample.reduce((sum: number, item: any) => sum + item.similarity, 0) / sample.length;
      // If average similarity is high, we can be more selective
      if (avgSimilarity > 0.8) {
        baseThreshold += 0.1;
      } else if (avgSimilarity < 0.5) {
        baseThreshold -= 0.1;
      }
    }
  } catch (error) {
    console.error(`⚠️ [ENHANCED RAG] Threshold optimization failed: ${error}`);
  }
  
  // Ensure threshold is within reasonable bounds
  return Math.max(0.4, Math.min(0.85, baseThreshold));
}

/**
 * Rerank results using semantic similarity and relevance scoring
 */
async function rerankResults(results: EnhancedInstruction[], query: string): Promise<EnhancedInstruction[]> {
  console.error(`🔄 [RERANKING] Processing ${results.length} results`);
  
  const scoredResults = results.map(result => {
    let score = result.similarity;
    
    // Boost score based on content relevance
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentWords = result.content.toLowerCase().split(/\s+/);
    const titleWords = result.title.toLowerCase().split(/\s+/);
    
    // Keyword overlap bonus
    const contentOverlap = queryWords.filter(word => 
      word.length > 3 && contentWords.some(cWord => cWord.includes(word))
    ).length;
    const titleOverlap = queryWords.filter(word => 
      word.length > 3 && titleWords.some(tWord => tWord.includes(word))
    ).length;
    
    score += (contentOverlap * 0.02) + (titleOverlap * 0.05);
    
    // Prefer chunks from instructions with multiple chunks (indicates comprehensive content)
    if (result.chunk_info.is_chunk && (result.chunk_info.total_chunks || 0) > 1) {
      score += 0.01;
    }
    
    // Prefer certain content types
    if (result.content_type === 'process' || result.content_type === 'guide') {
      score += 0.02;
    }
    
    return { ...result, rerank_score: score };
  });
  
  // Sort by reranked score
  scoredResults.sort((a, b) => b.rerank_score - a.rerank_score);
  
  console.error(`✅ [RERANKING] Completed (top score: ${scoredResults[0]?.rerank_score?.toFixed(3)})`);
  
  return scoredResults.map(({ rerank_score, ...result }) => result);
}

/**
 * Remove duplicate results based on instruction ID and content similarity
 */
function deduplicateResults(results: EnhancedInstruction[]): EnhancedInstruction[] {
  const seen = new Set<string>();
  const deduplicated: EnhancedInstruction[] = [];
  
  for (const result of results) {
    // Create a key based on title and first 100 characters
    const key = `${result.title}-${result.content.substring(0, 100)}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(result);
    }
  }
  
  return deduplicated;
}

/**
 * Fallback instructions when vector search fails
 */
async function getFallbackInstructions(
  supabase: SupabaseClient,
  limit: number
): Promise<EnhancedInstruction[]> {
  const { data: fallback } = await supabase
    .from('chatbot_instructions')
    .select('content, content_type, url, title')
    .eq('is_active', true)
    .order('priority', { ascending: false })
    .limit(Math.min(limit, 3));
  
  return (fallback || []).map(instruction => ({
    ...instruction,
    similarity: 0.5,
    chunk_info: { is_chunk: false }
  }));
}

/**
 * Generate embeddings for instruction chunks
 */
export async function generateChunkEmbeddings(
  supabase: SupabaseClient,
  chunkIds?: string[]
): Promise<{ processed: number; errors: number }> {
  console.error(`🔄 [CHUNK EMBEDDINGS] Starting generation process`);
  
  let query = supabase
    .from('instruction_chunks')
    .select('id, content')
    .is('embedding', null);
  
  if (chunkIds && chunkIds.length > 0) {
    query = query.in('id', chunkIds);
  }
  
  const { data: chunks, error } = await query.limit(50);
  
  if (error) {
    console.error(`❌ [CHUNK EMBEDDINGS] Failed to fetch chunks: ${error}`);
    return { processed: 0, errors: 1 };
  }
  
  if (!chunks || chunks.length === 0) {
    console.error(`✅ [CHUNK EMBEDDINGS] No chunks need embeddings`);
    return { processed: 0, errors: 0 };
  }
  
  console.error(`📊 [CHUNK EMBEDDINGS] Processing ${chunks.length} chunks`);
  
  let processed = 0;
  let errors = 0;
  
  for (const chunk of chunks) {
    try {
      const embedding = await generateQueryEmbedding(chunk.content);
      
      if (!embedding.every(val => val === 0)) {
        const { error: updateError } = await supabase
          .from('instruction_chunks')
          .update({
            embedding,
            embedding_updated_at: new Date().toISOString()
          })
          .eq('id', chunk.id);
        
        if (updateError) {
          console.error(`❌ [CHUNK EMBEDDINGS] Update failed for chunk ${chunk.id}: ${updateError}`);
          errors++;
        } else {
          processed++;
        }
      } else {
        console.error(`⚠️ [CHUNK EMBEDDINGS] Zero embedding for chunk ${chunk.id}`);
        errors++;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ [CHUNK EMBEDDINGS] Error processing chunk ${chunk.id}: ${error}`);
      errors++;
    }
  }
  
  console.error(`✅ [CHUNK EMBEDDINGS] Completed: ${processed} processed, ${errors} errors`);
  return { processed, errors };
}

/**
 * Legacy compatibility function
 */
export async function getRelevantInstructions(
  supabase: SupabaseClient<any, "public", any>,
  query: string,
  limit: number = 10,
  similarityThreshold: number = 0.6
): Promise<any[]> {
  const enhanced = await getRelevantInstructionsEnhanced(supabase, query, {
    limit,
    maxSimilarityThreshold: similarityThreshold,
    useChunks: true,
    enableReranking: true,
    adaptiveThreshold: false
  });
  
  // Convert back to legacy format
  return enhanced.map(item => ({
    content: item.content,
    content_type: item.content_type,
    url: item.url,
    title: item.title,
    similarity: item.similarity
  }));
} 