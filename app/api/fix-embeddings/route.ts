import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  try {
    console.error('🔧 [FIX EMBEDDINGS] Starting embedding format conversion...');
    
    const supabase = await createClient();
    
    // Get all instructions with embeddings
    const { data: instructions, error: fetchError } = await supabase
      .from('chatbot_instructions')
      .select('id, title, embedding')
      .not('embedding', 'is', null);
      
    if (fetchError) {
      console.error('❌ [FIX] Error fetching instructions:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
    console.error(`🔧 [FIX] Found ${instructions.length} instructions with embeddings to convert`);
    
    let fixed = 0;
    let failed = 0;
    
    for (const instruction of instructions) {
      try {
        console.error(`🔧 [FIX] Processing: "${instruction.title}"`);
        
        // Parse the JSON string embedding to array
        let embeddingArray;
        if (typeof instruction.embedding === 'string') {
          embeddingArray = JSON.parse(instruction.embedding);
        } else if (Array.isArray(instruction.embedding)) {
          embeddingArray = instruction.embedding;
        } else {
          console.error(`⚠️ [FIX] Skipping ${instruction.title} - unknown embedding format`);
          failed++;
          continue;
        }
        
        // Validate embedding
        if (!Array.isArray(embeddingArray) || embeddingArray.length !== 1536) {
          console.error(`⚠️ [FIX] Skipping ${instruction.title} - invalid embedding (length: ${embeddingArray?.length})`);
          failed++;
          continue;
        }
        
        // Update with proper vector format
        const { error: updateError } = await supabase
          .from('chatbot_instructions')
          .update({ 
            embedding: embeddingArray, // Supabase will convert array to vector type
            embedding_updated_at: new Date().toISOString()
          })
          .eq('id', instruction.id);
          
        if (updateError) {
          console.error(`❌ [FIX] Failed to update ${instruction.title}:`, updateError);
          failed++;
        } else {
          console.error(`✅ [FIX] Fixed embedding for: "${instruction.title}"`);
          fixed++;
        }
        
      } catch (processError) {
        console.error(`❌ [FIX] Error processing ${instruction.title}:`, processError);
        failed++;
      }
    }
    
    console.error(`🎉 [FIX COMPLETE] Fixed: ${fixed}, Failed: ${failed}`);
    
    return NextResponse.json({
      success: true,
      message: 'Embedding format conversion completed',
      fixed,
      failed,
      total: instructions.length
    });
    
  } catch (error) {
    console.error('❌ [FIX] Conversion failed:', error);
    return NextResponse.json({
      error: 'Embedding conversion failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to fix embeddings',
    instructions: 'Send POST request to convert embeddings from JSON strings to proper vector format'
  });
}