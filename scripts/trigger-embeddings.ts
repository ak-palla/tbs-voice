/**
 * This script manually processes the embedding queue
 * Run with: npx tsx scripts/trigger-embeddings.ts
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { OpenAI } from 'openai'

// Load environment variables
dotenv.config()

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
})

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Function to generate embedding
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log(`Generating embedding for text: ${text.substring(0, 50)}...`)
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536,
    })
    
    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

// Process the embedding queue - direct approach without RPC
async function processEmbeddingQueueDirect(batchSize = 10) {
  console.log(`\n[DIRECT] Processing embedding queue, batch size: ${batchSize}`)
  
  try {
    // Get pending embeddings directly from the queue
    const { data: pendingItems, error: fetchError } = await supabase
      .from('embedding_queue')
      .select('*, chatbot_instructions!inner(id, title, content)')
      .is('processed_at', null)
      .order('created_at', { ascending: true })
      .limit(batchSize)
    
    if (fetchError) {
      throw new Error(`Error fetching pending embeddings: ${fetchError.message}`)
    }
    
    if (!pendingItems || pendingItems.length === 0) {
      console.log('No pending embeddings found')
      return { processed: 0 }
    }
    
    console.log(`Found ${pendingItems.length} items to process`)
    
    // Process each item
    for (const item of pendingItems) {
      try {
        console.log(`\nProcessing queue item ${item.id} for instruction ${item.instruction_id}`)
        
        // Get the latest instruction data
        const { data: instruction, error: instructionError } = await supabase
          .from('chatbot_instructions')
          .select('id, title, content')
          .eq('id', item.instruction_id)
          .single()
        
        if (instructionError) {
          throw new Error(`Error fetching instruction: ${instructionError.message}`)
        }
        
        if (!instruction) {
          throw new Error(`Instruction ${item.instruction_id} not found`)
        }
        
        // Combine title and content for better embeddings
        const textToEmbed = `${instruction.title}\n\n${instruction.content}`
        
        // Generate the embedding
        const embedding = await generateEmbedding(textToEmbed)
        console.log(`Generated embedding with ${embedding.length} dimensions`)
        
        // Update the embedding in the instruction table
        const { error: updateError } = await supabase
          .from('chatbot_instructions')
          .update({
            embedding: embedding,
            embedding_updated_at: new Date().toISOString()
          })
          .eq('id', instruction.id)
        
        if (updateError) {
          throw new Error(`Error updating embedding: ${updateError.message}`)
        }
        
        // Mark the queue item as processed
        const { error: queueUpdateError } = await supabase
          .from('embedding_queue')
          .update({
            processed_at: new Date().toISOString()
          })
          .eq('id', item.id)
        
        if (queueUpdateError) {
          throw new Error(`Error updating queue: ${queueUpdateError.message}`)
        }
        
        console.log(`Successfully processed instruction ${instruction.id}`)
      } catch (error: any) {
        console.error(`Error processing item:`, error)
        
        // Mark the item as errored in the queue
        await supabase
          .from('embedding_queue')
          .update({
            error_message: error.message || 'Unknown error',
            processing_attempts: (item.processing_attempts || 0) + 1
          })
          .eq('id', item.id)
      }
    }
    
    return { processed: pendingItems.length }
  } catch (error: any) {
    console.error('Error in processing queue:', error.message)
    return { processed: 0, error: error.message }
  }
}

// Process the embedding queue using RPC function (as a fallback)
async function processEmbeddingQueueRPC() {
  console.log('\n[RPC] Attempting to process queue using RPC function')
  try {
    // Try calling the RPC function first
    const { data, error } = await supabase.rpc('process_pending_embeddings')
    
    if (error) {
      console.error('Error calling process_pending_embeddings RPC:', error.message)
      return { processed: 0, error: error.message }
    }
    
    console.log('RPC result:', data)
    return { processed: Array.isArray(data) ? data.length : 0 }
  } catch (error: any) {
    console.error('Error in RPC call:', error.message)
    return { processed: 0, error: error.message }
  }
}

// Main function
async function main() {
  console.log('=== EMBEDDINGS PROCESSING TOOL ===')
  console.log('Started at:', new Date().toISOString())
  
  try {
    // Try the RPC approach first (if it's set up)
    const rpcResult = await processEmbeddingQueueRPC()
    
    // If RPC method didn't process any items or had an error, try direct method
    if (rpcResult.error || rpcResult.processed === 0) {
      console.log('RPC method unsuccessful, trying direct method...')
      const directResult = await processEmbeddingQueueDirect()
      console.log(`Direct processing completed: ${directResult.processed} items processed`)
    } else {
      console.log(`RPC processing completed: ${rpcResult.processed} items processed`)
    }
    
    console.log('Embedding processing completed successfully')
  } catch (error) {
    console.error('Fatal error in embedding processing:', error)
    process.exit(1)
  }
}

// Run the main function
main()
  .then(() => {
    console.log('Completed at:', new Date().toISOString())
    process.exit(0)
  })
  .catch(error => {
    console.error('Unhandled error:', error)
    process.exit(1)
  }) 