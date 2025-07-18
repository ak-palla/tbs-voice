import OpenAI from "openai";
import { SupabaseClient } from "@supabase/supabase-js";
<<<<<<< HEAD
import { getCachedEmbedding, embeddingCache } from "./embedding-cache";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  timeout: 5000, // 5 second timeout to prevent hanging
});

// Original embedding generation function (now private)
async function _generateEmbedding(query: string): Promise<number[]> {
=======

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

// Generate embeddings for a query
export async function generateQueryEmbedding(query: string): Promise<number[]> {
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
      dimensions: 1536,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating query embedding:", error);
    throw error;
  }
}

<<<<<<< HEAD
// Enhanced embedding generation with caching and fast fallback
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  // Detailed logging for debugging
  console.error(`🔍 [EMBEDDING DEBUG] generateQueryEmbedding called with:`, {
    type: typeof query,
    value: query,
    isString: typeof query === 'string',
    isNull: query === null,
    isUndefined: query === undefined
  });
  
  // Safety check for query parameter
  if (!query || typeof query !== 'string') {
    console.error(`⚠️ [EMBEDDING] Invalid query parameter: ${typeof query}, value: ${query}`);
    query = 'Hello'; // Fallback to prevent errors
  }
  
  console.error(`🔄 [EMBEDDING] Starting generateQueryEmbedding for: "${query.substring(0, 30)}..."`);
  
  try {
    const result = await Promise.race([
      getCachedEmbedding(query, _generateEmbedding),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Embedding timeout after 3s')), 3000)
      )
    ]);
    console.error(`✅ [EMBEDDING] Completed generateQueryEmbedding (length: ${result.length})`);
    return result;
  } catch (error) {
    console.error(`⚠️ [EMBEDDING] Failed, using fallback for voice speed: ${error}`);
    // Return a dummy embedding vector for voice speed (1536 dimensions)
    return new Array(1536).fill(0);
  }
}

=======
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
interface ChatbotInstruction {
  content: string;
  content_type: string;
  url: string | null;
  updated_at: string;
  created_at: string;
  extraction_metadata: any;
  title?: string;
}

// Retrieve relevant instructions based on vector similarity
export async function getRelevantInstructions(
  supabase: SupabaseClient<any, "public", any>,
  query: string,
  limit: number = 10,
  similarityThreshold: number = 0.6
): Promise<ChatbotInstruction[]> {
  try {
<<<<<<< HEAD
    // Detailed logging for debugging
    console.error(`🔍 [RAG DEBUG] getRelevantInstructions called with:`, {
      type: typeof query,
      value: query,
      isString: typeof query === 'string',
      isNull: query === null,
      isUndefined: query === undefined
    });
    
    // Safety check for query parameter
    if (!query || typeof query !== 'string') {
      console.error(`⚠️ [RAG] Invalid query parameter: ${typeof query}, value: ${query}`);
      query = 'Hello'; // Fallback to prevent errors
    }
    
    console.error(`🔍 [RAG] Starting instruction search for: "${query.substring(0, 30)}..."`);
    
    // Generate embedding for the query with timeout
    const queryEmbedding = await generateQueryEmbedding(query);
    
    // If we got a dummy embedding (all zeros), skip vector search and return general instructions
    if (queryEmbedding.every(val => val === 0)) {
      console.error(`⚠️ [RAG] Using fallback: fetching general instructions instead of vector search`);
      const { data: generalInstructions, error } = await supabase
        .from('chatbot_instructions')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(Math.min(limit, 3)); // Limit to 3 for speed
      
      if (error) {
        console.error("Error fetching general instructions:", error);
        return [];
      }
      
      console.error(`✅ [RAG] Retrieved ${generalInstructions?.length || 0} general instructions`);
      return generalInstructions || [];
    }
    
=======
    // Generate embedding for the query
    const queryEmbedding = await generateQueryEmbedding(query);
    
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    // Perform vector similarity search
    const { data: instructions, error } = await supabase.rpc(
      'match_chatbot_instructions',
      {
        query_embedding: queryEmbedding,
        match_threshold: similarityThreshold,
        match_count: limit
      }
    );
    
    if (error) {
      console.error(
        "CRITICAL: Vector search RPC 'match_chatbot_instructions' failed. Proceeding with no retrieved instructions.", 
        error
      );
      return []; // Return empty on RPC failure, do not fall back to fetching all instructions here
    }
    
<<<<<<< HEAD
    console.error(`✅ [RAG] Retrieved ${instructions?.length || 0} vector-matched instructions`);
=======
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    return instructions || []; // instructions from RPC can be null if no matches, or an array
  } catch (error) {
    console.error("Error in getRelevantInstructions during embedding generation or RPC call:", error);
    // Catch any other error (e.g., from generateQueryEmbedding) and return empty
    return [];
  }
}

// SQL function to add to your database (to be run in the Supabase SQL editor):
/*
-- Function to find similar instructions based on embedding similarity
CREATE OR REPLACE FUNCTION match_chatbot_instructions(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  content_type TEXT,
  url TEXT,
  updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  extraction_metadata JSONB,
  title TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ci.id,
    ci.content,
    ci.content_type,
    ci.url,
    ci.updated_at,
    ci.created_at,
    ci.extraction_metadata,
    ci.title,
    1 - (ci.embedding <=> query_embedding) AS similarity
  FROM
    chatbot_instructions ci
  WHERE
    ci.is_active = true
    AND ci.embedding IS NOT NULL
    AND 1 - (ci.embedding <=> query_embedding) > match_threshold
  ORDER BY
    ci.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
*/ 