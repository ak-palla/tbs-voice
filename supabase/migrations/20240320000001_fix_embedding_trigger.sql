-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS notify_embedding_needed_trigger ON chatbot_instructions;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION notify_embedding_needed()
RETURNS TRIGGER AS $$
BEGIN
  -- Always insert into queue for new records or when content/title changes
  IF (TG_OP = 'INSERT' OR OLD.content <> NEW.content OR OLD.title <> NEW.title) THEN
    -- Set embedding to NULL to force regeneration
    NEW.embedding = NULL;
    NEW.embedding_updated_at = NULL;
    
    -- Insert into queue
    INSERT INTO embedding_queue (instruction_id, title, content, created_at)
    VALUES (NEW.id, NEW.title, NEW.content, now());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER notify_embedding_needed_trigger
BEFORE INSERT OR UPDATE ON chatbot_instructions
FOR EACH ROW
EXECUTE FUNCTION notify_embedding_needed(); 