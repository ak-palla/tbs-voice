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

// Process a single instruction
async function processInstruction(supabase: any, instructionId: string) {
  // Fetch the instruction
  const { data: instruction, error: fetchError } = await supabase
    .from("chatbot_instructions")
    .select("id, content, title")
    .eq("id", instructionId)
    .single();

  if (fetchError) {
    console.error("Error fetching instruction:", fetchError);
    return { success: false, error: fetchError.message };
  }

  try {
    // Generate rich text for embedding - combine title and content
    const textForEmbedding = `${instruction.title}: ${instruction.content}`;
    
    // Generate embedding
    const embedding = await generateEmbedding(textForEmbedding);
    
    // Update the instruction with the embedding
    const { error: updateError } = await supabase
      .from("chatbot_instructions")
      .update({
        embedding: embedding,
        embedding_updated_at: new Date().toISOString(),
      })
      .eq("id", instructionId);

    if (updateError) {
      console.error("Error updating instruction embedding:", updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true, id: instructionId };
  } catch (error) {
    console.error("Error processing instruction:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

// API route to update embeddings for all instructions or a specific one
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { instructionId } = await req.json();
    
    if (instructionId) {
      // Process a single instruction
      const result = await processInstruction(supabase, instructionId);
      return NextResponse.json(result);
    } else {
      // Process all instructions without embeddings or with outdated content
      const { data: instructions, error } = await supabase
        .from("chatbot_instructions")
        .select("id")
        .or("embedding.is.null,embedding_updated_at.is.null")
        .limit(50);

      if (error) {
        console.error("Error fetching instructions:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      const results = [];
      for (const instruction of instructions) {
        const result = await processInstruction(supabase, instruction.id);
        results.push(result);
      }

      return NextResponse.json({ success: true, processed: results.length, results });
    }
  } catch (error) {
    console.error("Error in embedding update API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update embeddings" },
      { status: 500 }
    );
  }
}

// Endpoint to trigger processing of all instructions
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    
    // Get count of instructions needing processing
    const { count, error: countError } = await supabase
      .from("chatbot_instructions")
      .select("id", { count: "exact", head: true })
      .or("embedding.is.null,embedding_updated_at.is.null");
    
    if (countError) {
      throw countError;
    }
    
    return NextResponse.json({
      success: true,
      pendingCount: count || 0,
      message: `${count} instructions need embedding updates.`
    });
  } catch (error) {
    console.error("Error checking pending embeddings:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check pending embeddings" },
      { status: 500 }
    );
  }
} 