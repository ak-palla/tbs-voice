-- Function to mark an instruction as needing embedding updates
CREATE OR REPLACE FUNCTION mark_instruction_for_embedding_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only mark for update if the content or title has changed
  IF (TG_OP = 'INSERT' OR OLD.content <> NEW.content OR OLD.title <> NEW.title) THEN
    NEW.embedding = NULL;
    NEW.embedding_updated_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to send notification for embedding generation
-- This will be captured by the Edge Function or webhook
CREATE OR REPLACE FUNCTION notify_embedding_needed()
RETURNS TRIGGER AS $$
BEGIN
  -- Only send notification if embedding is NULL
  IF NEW.embedding IS NULL THEN
    -- Insert a record into a special queue table for processing
    INSERT INTO embedding_queue (instruction_id, title, content, created_at)
    VALUES (NEW.id, NEW.title, NEW.content, now());
    
    -- Also send a PostgreSQL notification that can be listened for
    PERFORM pg_notify('embedding_needed', json_build_object(
      'instruction_id', NEW.id,
      'table', TG_TABLE_NAME,
      'created_at', now()
    )::text);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a queue table to track instructions needing embeddings
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

-- Index for finding unprocessed queue items
CREATE INDEX IF NOT EXISTS embedding_queue_unprocessed_idx 
ON embedding_queue (processed_at) 
WHERE processed_at IS NULL;

-- Trigger to notify when instructions need embeddings
DROP TRIGGER IF EXISTS notify_embedding_needed_trigger ON chatbot_instructions;
CREATE TRIGGER notify_embedding_needed_trigger
AFTER INSERT OR UPDATE ON chatbot_instructions
FOR EACH ROW
WHEN (NEW.embedding IS NULL)
EXECUTE FUNCTION notify_embedding_needed();

-- Function to update an instruction's embedding
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

-- Function to get pending embeddings (for the Edge Function to process)
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