import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  try {
    console.log('🔧 [FIX] Starting instruction activation...');
    
    const supabase = await createClient();
    
    // Get all inactive instructions with embeddings
    const { data: inactiveInstructions, error: fetchError } = await supabase
      .from('chatbot_instructions')
      .select('id, title, is_active, embedding')
      .eq('is_active', false)
      .not('embedding', 'is', null);

    if (fetchError) {
      throw new Error(`Failed to fetch instructions: ${fetchError.message}`);
    }

    console.log(`📋 [FIX] Found ${inactiveInstructions?.length || 0} inactive instructions with embeddings`);

    if (!inactiveInstructions || inactiveInstructions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No inactive instructions found to activate",
        activated: 0
      });
    }

    // Activate all instructions with embeddings
    const { data: updatedInstructions, error: updateError } = await supabase
      .from('chatbot_instructions')
      .update({ is_active: true })
      .eq('is_active', false)
      .not('embedding', 'is', null)
      .select('id, title');

    if (updateError) {
      throw new Error(`Failed to activate instructions: ${updateError.message}`);
    }

    console.log(`✅ [FIX] Activated ${updatedInstructions?.length || 0} instructions`);

    // Test semantic search after activation
    console.log('🧪 [FIX] Testing semantic search after activation...');
    const { getRelevantInstructions } = await import('@/utils/embeddings');
    
    const testQuery = "help with business strategy";
    const searchResults = await getRelevantInstructions(supabase, testQuery, 5, 0.6);
    
    console.log(`🎯 [FIX] Search test results: ${searchResults.length} instructions found`);

    return NextResponse.json({
      success: true,
      message: `Successfully activated ${updatedInstructions?.length || 0} instructions`,
      activated: updatedInstructions?.length || 0,
      activatedInstructions: updatedInstructions?.map(i => ({ id: i.id, title: i.title })) || [],
      testResults: {
        query: testQuery,
        resultsFound: searchResults.length,
        searchWorking: searchResults.length > 0
      }
    });

  } catch (error) {
    console.error('❌ [FIX] Failed to activate instructions:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current status
    const { data: statusCheck } = await supabase
      .from('chatbot_instructions')
      .select('id, title, is_active, embedding')
      .order('created_at', { ascending: false })
      .limit(10);

    const total = statusCheck?.length || 0;
    const active = statusCheck?.filter(i => i.is_active).length || 0;
    const withEmbeddings = statusCheck?.filter(i => i.embedding).length || 0;
    const activeWithEmbeddings = statusCheck?.filter(i => i.is_active && i.embedding).length || 0;

    return NextResponse.json({
      status: {
        total,
        active,
        withEmbeddings,
        activeWithEmbeddings,
        needsActivation: withEmbeddings - activeWithEmbeddings
      },
      sampleInstructions: statusCheck?.map(i => ({
        id: i.id,
        title: i.title,
        isActive: i.is_active,
        hasEmbedding: !!i.embedding
      })) || [],
      recommendation: activeWithEmbeddings === 0 ? "CRITICAL: No active instructions with embeddings. Run POST to fix." : "System looks healthy"
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 