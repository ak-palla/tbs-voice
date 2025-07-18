-- First drop the existing function
DROP FUNCTION IF EXISTS process_pending_embeddings();

-- Create the function with proper return type
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
  RETURN QUERY
  UPDATE embedding_queue
  SET processing_attempts = processing_attempts + 1
  WHERE id IN (
    SELECT id FROM embedding_queue
    WHERE processed_at IS NULL
    ORDER BY processing_attempts ASC, created_at ASC
    LIMIT 10
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