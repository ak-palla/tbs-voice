/**
 * This script helps debug embedding generation issues
 * Run with: npx tsx scripts/debug-embeddings.ts
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

// Debug OpenAI connectivity
async function debugOpenAI() {
  console.log('\n=== TESTING OPENAI CONNECTION ===')
  try {
    console.log('Testing OpenAI API with a simple embedding request...')
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'Test embedding generation',
      dimensions: 1536,
    })
    
    console.log('✅ OpenAI API connection successful')
    console.log(`Embedding dimension: ${response.data[0].embedding.length}`)
    return true
  } catch (error: any) {
    console.error('❌ OpenAI API error:', error.message)
    console.log('Check your OpenAI API key configuration')
    return false
  }
}

// Debug embedding queue
async function debugEmbeddingQueue() {
  console.log('\n=== CHECKING EMBEDDING QUEUE ===')
  try {
    // Count total items in queue
    const { data: queueItems, error: queueError } = await supabase
      .from('embedding_queue')
      .select('*')
    
    if (queueError) {
      console.error('❌ Error accessing embedding_queue table:', queueError.message)
      return false
    }
    
    const pendingItems = queueItems?.filter(item => !item.processed_at) || []
    
    console.log(`Queue status: ${queueItems?.length || 0} total items, ${pendingItems.length} pending`)
    
    if (pendingItems.length > 0) {
      console.log('Latest pending item:')
      console.log(pendingItems[0])
    } else if (queueItems && queueItems.length > 0) {
      console.log('No pending items. Latest processed item:')
      console.log(queueItems[0])
    } else {
      console.log('Queue is empty. The trigger may not be working.')
    }
    
    return true
  } catch (error: any) {
    console.error('❌ Error checking embedding queue:', error.message)
    return false
  }
}

// Debug trigger functionality
async function debugTrigger() {
  console.log('\n=== TESTING DATABASE TRIGGER ===')
  try {
    // Create a test instruction to see if the trigger fires
    const testTitle = `Test Instruction ${new Date().toISOString()}`
    const testContent = `This is a test instruction created at ${new Date().toISOString()}`
    
    console.log('Creating test instruction to check if trigger fires...')
    
    const { data: instruction, error: insertError } = await supabase
      .from('chatbot_instructions')
      .insert({
        title: testTitle,
        content: testContent,
        content_type: 'text',
        is_active: false,  // Set to false so it doesn't interfere with actual system
        priority: 0,
        embedding: null,   // Explicitly set to null to trigger the process
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Error creating test instruction:', insertError.message)
      return false
    }
    
    console.log('✅ Test instruction created successfully')
    
    // Check if the item was added to the queue
    const { data: queueItems, error: queueError } = await supabase
      .from('embedding_queue')
      .select('*')
      .eq('instruction_id', instruction.id)
    
    if (queueError) {
      console.error('❌ Error checking queue for test instruction:', queueError.message)
      return false
    }
    
    if (queueItems && queueItems.length > 0) {
      console.log('✅ Trigger is working! Test instruction was added to the queue')
      return true
    } else {
      console.error('❌ Trigger is not working. Test instruction was not added to the queue')
      return false
    }
  } catch (error: any) {
    console.error('❌ Error testing trigger:', error.message)
    return false
  }
}

// Debug the RPC function
async function debugRPC() {
  console.log('\n=== TESTING RPC FUNCTION ===')
  try {
    console.log('Calling process_pending_embeddings RPC function...')
    
    const { data, error } = await supabase.rpc('process_pending_embeddings')
    
    if (error) {
      console.error('❌ Error calling RPC function:', error.message)
      
      // Check if function exists
      const { data: functions, error: functionsError } = await supabase
        .from('pg_proc')
        .select('*')
        .ilike('proname', '%embedding%')
      
      if (functionsError) {
        console.error('Cannot check for function existence:', functionsError.message)
      } else {
        console.log('Available embedding-related functions:')
        console.log(functions)
      }
      return false
    }
    
    console.log('✅ RPC function called successfully')
    console.log('Result:', data)
    return true
  } catch (error: any) {
    console.error('❌ Error calling RPC function:', error.message)
    return false
  }
}

// Debug the embedding process manually
async function debugManualEmbedding() {
  console.log('\n=== TESTING MANUAL EMBEDDING PROCESS ===')
  try {
    // Get a test instruction
    const { data: pendingItems, error: fetchError } = await supabase
      .from('embedding_queue')
      .select('*, chatbot_instructions!inner(*)')
      .is('processed_at', null)
      .limit(1)
    
    if (fetchError) {
      console.error('❌ Error fetching pending item:', fetchError.message)
      return false
    }
    
    if (!pendingItems || pendingItems.length === 0) {
      console.log('No pending items to process')
      return true
    }
    
    const item = pendingItems[0]
    console.log('Processing item:', item.id)
    
    // Generate embedding
    const textToEmbed = `${item.title}\n\n${item.content}`
    console.log('Generating embedding for:', textToEmbed.substring(0, 50) + '...')
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: textToEmbed,
      dimensions: 1536,
    })
    
    const embedding = response.data[0].embedding
    console.log(`✅ Generated embedding (${embedding.length} dimensions)`)
    
    // Update the embedding directly
    const { error: updateError } = await supabase
      .from('chatbot_instructions')
      .update({
        embedding,
        embedding_updated_at: new Date().toISOString()
      })
      .eq('id', item.instruction_id)
    
    if (updateError) {
      console.error('❌ Error updating embedding:', updateError.message)
      return false
    }
    
    console.log('✅ Embedding updated successfully')
    
    // Mark as processed in queue
    const { error: queueError } = await supabase
      .from('embedding_queue')
      .update({
        processed_at: new Date().toISOString()
      })
      .eq('id', item.id)
    
    if (queueError) {
      console.error('❌ Error marking item as processed:', queueError.message)
      return false
    }
    
    console.log('✅ Queue item marked as processed')
    return true
  } catch (error: any) {
    console.error('❌ Error in manual embedding process:', error.message)
    return false
  }
}

async function runDiagnostics() {
  console.log('=== EMBEDDING SYSTEM DIAGNOSTICS ===')
  console.log('Running at:', new Date().toISOString())
  
  const openaiOk = await debugOpenAI()
  const queueOk = await debugEmbeddingQueue()
  const triggerOk = await debugTrigger()
  const rpcOk = await debugRPC()
  const manualOk = await debugManualEmbedding()
  
  console.log('\n=== DIAGNOSTICS SUMMARY ===')
  console.log(`OpenAI Connection: ${openaiOk ? '✅ OK' : '❌ FAILED'}`)
  console.log(`Embedding Queue: ${queueOk ? '✅ OK' : '❌ FAILED'}`)
  console.log(`Database Trigger: ${triggerOk ? '✅ OK' : '❌ FAILED'}`)
  console.log(`RPC Function: ${rpcOk ? '✅ OK' : '❌ FAILED'}`)
  console.log(`Manual Embedding: ${manualOk ? '✅ OK' : '❌ FAILED'}`)
  
  if (!openaiOk || !queueOk || !triggerOk || !rpcOk || !manualOk) {
    console.log('\nIssues detected. Check the error messages above for details.')
  } else {
    console.log('\nAll systems appear to be working correctly!')
  }
}

// Run the diagnostics
runDiagnostics()
  .then(() => {
    console.log('Diagnostics completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('Fatal error running diagnostics:', error)
    process.exit(1)
  }) 