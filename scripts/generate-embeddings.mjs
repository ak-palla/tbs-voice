// Script to generate embeddings for all chatbot instructions
// Run with: node scripts/generate-embeddings.mjs

import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load .env manually if needed
try {
  const envPath = join(dirname(__dirname), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = dotenv.parse(envContent);
    Object.entries(envVars).forEach(([key, value]) => {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  }
} catch (err) {
  console.warn('Could not load .env file:', err.message);
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  console.error('Missing NEXT_PUBLIC_OPENAI_API_KEY environment variable');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to generate embedding for text
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      dimensions: 1536,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Main function to update embeddings
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
  
  console.log(`Found ${instructions?.length || 0} instructions that need embeddings.`);
  
  // Check if we have instructions to process
  if (!instructions || instructions.length === 0) {
    console.log('No instructions need embedding updates.');
    return;
  }
  
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