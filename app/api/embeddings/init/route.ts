import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

// Function to generate embeddings using OpenAI embeddings API
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      dimensions: 1536, // dimensions for the embedding vector
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

// Main function to initialize pgvector
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Enable pgvector extension
    const { error: extError } = await supabase.rpc('enable_pgvector');
    if (extError) {
      console.warn("Error enabling pgvector (might already be enabled):", extError);
      // Try SQL directly in this case
      try {
        await supabase.rpc('sql_query', { query: 'CREATE EXTENSION IF NOT EXISTS vector;' });
        console.log("Enabled pgvector extension directly via SQL");
      } catch (sqlError) {
        console.error("Error trying direct SQL to enable pgvector:", sqlError);
      }
    } else {
      console.log("Successfully enabled pgvector extension");
    }
    
    // Add embedding column if it doesn't exist
    try {
      const { error: alterError } = await supabase.rpc('sql_query', { 
        query: `
          ALTER TABLE chatbot_instructions 
          ADD COLUMN IF NOT EXISTS embedding vector(1536);
          
          ALTER TABLE chatbot_instructions 
          ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;
        `
      });
      
      if (alterError) {
        console.error("Error adding vector column:", alterError);
        throw alterError;
      }
      console.log("Added vector column successfully");
    } catch (e) {
      console.warn("Error altering table (may already have the column):", e);
    }
    
    // Create the vector similarity function if it doesn't exist
    try {
      const { error: funcError } = await supabase.rpc('sql_query', { 
        query: `
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
        `
      });
      
      if (funcError) {
        console.error("Error creating vector similarity function:", funcError);
        throw funcError;
      }
      console.log("Created vector similarity function successfully");
    } catch (e) {
      console.warn("Error creating function (might already exist):", e);
    }
    
    // Create index for vector similarity search
    try {
      const { error: indexError } = await supabase.rpc('sql_query', { 
        query: `
          CREATE INDEX IF NOT EXISTS chatbot_instructions_embedding_idx 
          ON chatbot_instructions 
          USING ivfflat (embedding vector_cosine_ops) 
          WITH (lists = 100);
        `
      });
      
      if (indexError) {
        console.error("Error creating vector index:", indexError);
        throw indexError;
      }
      console.log("Created vector index successfully");
    } catch (e) {
      console.warn("Error creating index (might already exist):", e);
    }
    
    // Now update all instructions that need embeddings
    const { data: instructions, error: instrError } = await supabase
      .from("chatbot_instructions")
      .select("id, content, title")
      .or("embedding.is.null,embedding_updated_at.is.null")
      .limit(50);
    
    if (instrError) {
      console.error("Error fetching instructions:", instrError);
      throw instrError;
    }
    
    console.log(`Found ${instructions?.length || 0} instructions needing embeddings`);
    
    // Process each instruction
    const results = [];
    for (const instruction of instructions || []) {
      try {
        // Generate rich text for embedding
        const textForEmbedding = `${instruction.title || ''}: ${instruction.content}`;
        
        // Generate embedding
        const embedding = await generateEmbedding(textForEmbedding);
        
        // Update the instruction with the embedding
        const { error: updateError } = await supabase
          .from("chatbot_instructions")
          .update({
            embedding: embedding,
            embedding_updated_at: new Date().toISOString(),
          })
          .eq("id", instruction.id);
        
        if (updateError) {
          console.error(`Error updating embedding for instruction ${instruction.id}:`, updateError);
          results.push({ id: instruction.id, success: false, error: updateError.message });
        } else {
          console.log(`Updated embedding for instruction ${instruction.id}`);
          results.push({ id: instruction.id, success: true });
        }
      } catch (error) {
        console.error(`Error processing instruction ${instruction.id}:`, error);
        results.push({ 
          id: instruction.id, 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Vector setup complete",
      processed: results.length,
      results
    });
  } catch (error) {
    console.error("Error in pgvector initialization:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to initialize pgvector", 
        success: false 
      },
      { status: 500 }
    );
  }
} 