import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateChunkEmbeddings } from '@/utils/enhanced-embeddings';

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  console.log('🔄 [CHUNK EMBEDDINGS API] Starting chunk embedding generation...');
  
  try {
    const { chunkIds, forceRegenerate = false } = await request.json();
    
    // Initialize Supabase client
    const supabase = await createClient();
    
    // Verify user authentication (optional - you might want to restrict this)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.log(`📊 [CHUNK EMBEDDINGS API] Processing ${chunkIds?.length || 'all'} chunks for user ${user.id}`);
    
    // Generate embeddings
    const result = await generateChunkEmbeddings(supabase, chunkIds);
    
    const totalTime = performance.now() - startTime;
    
    console.log(`✅ [CHUNK EMBEDDINGS API] Completed in ${totalTime.toFixed(2)}ms: ${result.processed} processed, ${result.errors} errors`);
    
    return NextResponse.json({
      success: true,
      processed: result.processed,
      errors: result.errors,
      performance: {
        totalTime: totalTime.toFixed(2)
      }
    });
    
  } catch (error) {
    const totalTime = performance.now() - startTime;
    console.error('❌ [CHUNK EMBEDDINGS API] Error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate chunk embeddings',
        details: error instanceof Error ? error.message : String(error),
        performance: {
          totalTime: totalTime.toFixed(2)
        }
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const supabase = await createClient();
    
    // Get chunk embedding status
    let query = supabase
      .from('instruction_chunks')
      .select('id, instruction_id, content, chunk_type, embedding_updated_at, created_at');
    
    if (status === 'pending') {
      query = query.is('embedding', null);
    } else if (status === 'completed') {
      query = query.not('embedding', 'is', null);
    }
    
    const { data: chunks, error } = await query
      .limit(limit)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Get summary statistics
    const { data: stats } = await supabase.rpc('get_chunk_embedding_stats');
    
    return NextResponse.json({
      chunks: chunks || [],
      stats: stats || {
        total_chunks: 0,
        completed_chunks: 0,
        pending_chunks: 0
      }
    });
    
  } catch (error) {
    console.error('❌ [CHUNK EMBEDDINGS API] Status check error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to get chunk embedding status',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 