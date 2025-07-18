-- Ensure pgvector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Make sure embedding column exists and has the right type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'chatbot_instructions'
    AND column_name = 'embedding'
  ) THEN
    ALTER TABLE chatbot_instructions ADD COLUMN embedding vector(1536);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'chatbot_instructions'
    AND column_name = 'embedding_updated_at'
  ) THEN
    ALTER TABLE chatbot_instructions ADD COLUMN embedding_updated_at timestamptz;
  END IF;
END
$$;

-- Drop existing functions to make sure we can recreate them with the right signatures
DROP FUNCTION IF EXISTS mark_instruction_for_embedding_update() CASCADE;
DROP FUNCTION IF EXISTS notify_embedding_needed() CASCADE;
DROP FUNCTION IF EXISTS update_instruction_embedding(uuid, vector, timestamptz) CASCADE;
DROP FUNCTION IF EXISTS get_pending_embeddings(int) CASCADE;
DROP FUNCTION IF EXISTS process_pending_embeddings() CASCADE;

-- Create a queue table if it doesn't exist
CREATE TABLE IF NOT EXISTS embedding_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  instruction_id uuid NOT NULL REFERENCES chatbot_instructions(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz NULL,
  processing_attempts int NOT NULL DEFAULT 0,
  error_message text NULL
);

-- Create or recreate index
DROP INDEX IF EXISTS embedding_queue_unprocessed_idx;
CREATE INDEX embedding_queue_unprocessed_idx 
ON embedding_queue (processed_at) 
WHERE processed_at IS NULL;

-- Function to update embedding
CREATE OR REPLACE FUNCTION update_instruction_embedding(
  instruction_id uuid,
  embedding_vector vector(1536),
  updated_at timestamptz DEFAULT now()
)
RETURNS void AS $$
BEGIN
  UPDATE chatbot_instructions
  SET 
    embedding = embedding_vector,
    embedding_updated_at = updated_at
  WHERE id = instruction_id;
  
  -- Also mark as processed in the queue
  UPDATE embedding_queue
  SET 
    processed_at = updated_at
  WHERE instruction_id = update_instruction_embedding.instruction_id
  AND processed_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending embeddings
CREATE OR REPLACE FUNCTION get_pending_embeddings(limit_count int DEFAULT 10)
RETURNS TABLE (
  id uuid,
  instruction_id uuid,
  title text,
  content text,
  created_at timestamptz,
  processing_attempts int
) AS $$
BEGIN
  RETURN QUERY
  UPDATE embedding_queue
  SET processing_attempts = processing_attempts + 1
  WHERE id IN (
    SELECT id FROM embedding_queue
    WHERE processed_at IS NULL
    ORDER BY processing_attempts ASC, created_at ASC
    LIMIT limit_count
    FOR UPDATE SKIP LOCKED
  )
  RETURNING 
    embedding_queue.id,
    embedding_queue.instruction_id,
    embedding_queue.title,
    embedding_queue.content,
    embedding_queue.created_at,
    embedding_queue.processing_attempts;
END;
$$ LANGUAGE plpgsql;

-- Function for RPC compatibility with old scripts
CREATE OR REPLACE FUNCTION process_pending_embeddings()
RETURNS TABLE (
  id uuid,
  instruction_id uuid,
  title text,
  content text,
  created_at timestamptz,
  processing_attempts int
) AS $$
BEGIN
  -- Just delegate to get_pending_embeddings for now
  RETURN QUERY SELECT * FROM get_pending_embeddings(10);
END;
$$ LANGUAGE plpgsql;

-- Create trigger function
CREATE OR REPLACE FUNCTION notify_embedding_needed()
RETURNS TRIGGER AS $$
BEGIN
  -- Always trigger embedding generation for new records
  IF (TG_OP = 'INSERT') THEN
    NEW.embedding = NULL;
    NEW.embedding_updated_at = NULL;
    
    -- Add to queue after insert (in AFTER trigger)
    INSERT INTO embedding_queue (instruction_id, title, content, created_at)
    VALUES (NEW.id, NEW.title, NEW.content, now());
    
    -- Call the Edge Function to process the queue immediately
    PERFORM
      net.http_post(
        url := current_setting('app.settings.edge_function_url') || '/process-embeddings',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := jsonb_build_object('manual', true)
      );
    
    RETURN NEW;
  END IF;
  
  -- For updates, only trigger if relevant content changed
  IF (OLD.title <> NEW.title OR OLD.content <> NEW.content) THEN
    NEW.embedding = NULL;
    NEW.embedding_updated_at = NULL;
    
    -- Add to queue after update (in AFTER trigger)
    INSERT INTO embedding_queue (instruction_id, title, content, created_at)
    VALUES (NEW.id, NEW.title, NEW.content, now());
    
    -- Call the Edge Function to process the queue immediately
    PERFORM
      net.http_post(
        url := current_setting('app.settings.edge_function_url') || '/process-embeddings',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := jsonb_build_object('manual', true)
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers
DROP TRIGGER IF EXISTS notify_embedding_needed_trigger ON chatbot_instructions;

-- Create triggers
CREATE TRIGGER notify_embedding_needed_trigger
AFTER INSERT OR UPDATE ON chatbot_instructions
FOR EACH ROW
EXECUTE FUNCTION notify_embedding_needed();

-- Fix any instructions without embeddings
INSERT INTO embedding_queue (instruction_id, title, content)
SELECT id, title, content
FROM chatbot_instructions
WHERE embedding IS NULL
AND id NOT IN (
  SELECT instruction_id FROM embedding_queue WHERE processed_at IS NULL
); 