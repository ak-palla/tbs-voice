-- Enable the pgvector extension if it's not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to chatbot_instructions table
ALTER TABLE chatbot_instructions ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create a function to update embeddings automatically
CREATE OR REPLACE FUNCTION update_chatbot_instruction_embedding()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't update the embedding when it's modified directly or if content hasn't changed
  IF (TG_OP = 'UPDATE' AND (NEW.embedding IS NOT NULL OR OLD.content = NEW.content)) THEN
    RETURN NEW;
  END IF;
  
  -- Placeholder for the actual embedding update logic (this will be handled by your application)
  -- In a real implementation, the embedding would be calculated by your app and inserted manually
  -- This trigger will only ensure the row is marked as needing an embedding update
  
  NEW.embedding = NULL; -- Mark as needing an embedding
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function on insert or update
DROP TRIGGER IF EXISTS update_chatbot_instruction_embedding_trigger ON chatbot_instructions;
CREATE TRIGGER update_chatbot_instruction_embedding_trigger
BEFORE INSERT OR UPDATE ON chatbot_instructions
FOR EACH ROW
EXECUTE FUNCTION update_chatbot_instruction_embedding();

-- Create an index for vector similarity search
CREATE INDEX IF NOT EXISTS chatbot_instructions_embedding_idx ON chatbot_instructions USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Add a column to track when embeddings were last updated
ALTER TABLE chatbot_instructions ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ; 