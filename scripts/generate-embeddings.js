// Script to generate embeddings for all chatbot instructions
// Run with: node scripts/generate-embeddings.js

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    dimensions: 1536,
  });
  
  return response.data[0].embedding;
}

async function updateEmbeddings() {
  console.log('Fetching instructions that need embeddings...');
  
  // Get records that have no embedding or are marked for update
  const { data: instructions, error } = await supabase
    .from('chatbot_instructions')
    .select('id, title, content')
    .is('embedding', null);
  
  if (error) {
    console.error('Error fetching instructions:', error);
    return;
  }
  
  console.log(`Found ${instructions.length} instructions that need embeddings.`);
  
  // Process each instruction
  for (const instruction of instructions) {
    try {
      // Combine title and content for embedding
      const textToEmbed = `${instruction.title}\n\n${instruction.content}`;
      console.log(`Generating embedding for instruction: ${instruction.id} "${instruction.title}"`);
      
      // Generate embedding
      const embedding = await generateEmbedding(textToEmbed);
      
      // Update the record
      const { error: updateError } = await supabase
        .from('chatbot_instructions')
        .update({ 
          embedding: embedding,
          embedding_updated_at: new Date().toISOString()
        })
        .eq('id', instruction.id);
      
      if (updateError) {
        console.error(`Error updating embedding for instruction ${instruction.id}:`, updateError);
      } else {
        console.log(`Successfully updated embedding for instruction ${instruction.id}`);
      }
    } catch (err) {
      console.error(`Error processing instruction ${instruction.id}:`, err);
    }
  }
  
  console.log('Embedding generation complete.');
}

// Run the update function
updateEmbeddings()
  .then(() => {
    console.log('Finished updating embeddings.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  }); 