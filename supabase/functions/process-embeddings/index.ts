// Supabase Edge Function to process the embedding queue
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'

// Configure OpenAI
const openAiKey = Deno.env.get('OPENAI_API_KEY')
if (!openAiKey) {
  console.error('Missing OPENAI_API_KEY environment variable')
}
const openaiConfig = new Configuration({ apiKey: openAiKey })
const openai = new OpenAIApi(openaiConfig)

// Configure Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: text,
    })
    
    return response.data.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

async function processEmbeddingQueue(batchSize = 5) {
  console.log(`Processing embedding queue, batch size: ${batchSize}`)
  
  // Get pending embeddings
  const { data: pendingItems, error: fetchError } = await supabase.rpc(
    'get_pending_embeddings',
    { limit_count: batchSize }
  )
  
  if (fetchError) {
    throw new Error(`Error fetching pending embeddings: ${fetchError.message}`)
  }
  
  if (!pendingItems || pendingItems.length === 0) {
    console.log('No pending embeddings found')
    return { processed: 0 }
  }
  
  console.log(`Found ${pendingItems.length} items to process`)
  
  // Process each item
  const results = await Promise.allSettled(
    pendingItems.map(async (item) => {
      try {
        console.log(`Processing item ${item.id} for instruction ${item.instruction_id}`)
        
        // Combine title and content for better embeddings
        const textToEmbed = `${item.title}\n\n${item.content}`
        
        // Generate the embedding
        const embedding = await generateEmbedding(textToEmbed)
        
        // Update the embedding in the database
        const { error: updateError } = await supabase.rpc(
          'update_instruction_embedding',
          {
            instruction_id: item.instruction_id,
            embedding_vector: embedding,
            updated_at: new Date().toISOString()
          }
        )
        
        if (updateError) {
          throw new Error(`Error updating embedding: ${updateError.message}`)
        }
        
        return { success: true, id: item.id, instruction_id: item.instruction_id }
      } catch (error) {
        console.error(`Error processing item ${item.id}:`, error)
        
        // Mark the item as errored in the queue
        await supabase
          .from('embedding_queue')
          .update({
            error_message: error.message || 'Unknown error',
          })
          .eq('id', item.id)
        
        return { success: false, id: item.id, error: error.message || 'Unknown error' }
      }
    })
  )
  
  // Count successful and failed operations
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
  const failed = results.length - successful
  
  console.log(`Processed ${results.length} items. Success: ${successful}, Failed: ${failed}`)
  
  return { processed: results.length, successful, failed }
}

// HTTP handler for the Edge Function
serve(async (req) => {
  try {
    // Check if this is a scheduled invocation or manual
    const isManualRun = new URL(req.url).searchParams.get('manual') === 'true'
    
    // Process the queue
    const result = await processEmbeddingQueue(isManualRun ? 10 : 5)
    
    return new Response(
      JSON.stringify({ success: true, ...result }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error in edge function:', error)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Unknown error' }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
}) 