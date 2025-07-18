-- Document Chunking Enhancement for RAG Precision
-- Migration: 20250117000000_add_document_chunking.sql

-- Create chunks table for storing document chunks
CREATE TABLE IF NOT EXISTS public.instruction_chunks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  instruction_id uuid NOT NULL REFERENCES chatbot_instructions(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  chunk_type text NOT NULL DEFAULT 'semantic', -- 'semantic', 'fixed', 'recursive'
  chunk_size integer NOT NULL,
  overlap_size integer NOT NULL DEFAULT 50,
  metadata jsonb DEFAULT '{}'::jsonb,
  embedding vector(1536),
  embedding_updated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT instruction_chunks_pkey PRIMARY KEY (id),
  CONSTRAINT instruction_chunks_unique_chunk UNIQUE (instruction_id, chunk_index)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_instruction_chunks_instruction_id ON instruction_chunks(instruction_id);
CREATE INDEX IF NOT EXISTS idx_instruction_chunks_embedding_idx ON instruction_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_instruction_chunks_chunk_type ON instruction_chunks(chunk_type);

-- Function to intelligently chunk text content
CREATE OR REPLACE FUNCTION chunk_text(
  content text,
  max_chunk_size integer DEFAULT 500,
  overlap_size integer DEFAULT 50,
  chunk_type text DEFAULT 'semantic'
) RETURNS TABLE (
  chunk_index integer,
  chunk_content text,
  chunk_size integer
) AS $$
DECLARE
  sentences text[];
  current_chunk text := '';
  current_size integer := 0;
  chunk_count integer := 0;
  sentence text;
  sentence_length integer;
BEGIN
  -- Split content into sentences for semantic chunking
  IF chunk_type = 'semantic' THEN
    -- Split by sentence boundaries (., !, ?) followed by space or newline
    sentences := regexp_split_to_array(content, '(?<=[.!?])\s+');
    
    FOR i IN 1..array_length(sentences, 1) LOOP
      sentence := sentences[i];
      sentence_length := length(sentence);
      
      -- If adding this sentence would exceed max size, output current chunk
      IF current_size + sentence_length > max_chunk_size AND current_chunk != '' THEN
        chunk_count := chunk_count + 1;
        RETURN QUERY VALUES (chunk_count, trim(current_chunk), current_size);
        
        -- Start new chunk with overlap from previous chunk
        IF overlap_size > 0 AND chunk_count > 1 THEN
          current_chunk := substring(current_chunk from greatest(1, current_size - overlap_size));
          current_size := length(current_chunk);
        ELSE
          current_chunk := '';
          current_size := 0;
        END IF;
      END IF;
      
      -- Add sentence to current chunk
      IF current_chunk = '' THEN
        current_chunk := sentence;
      ELSE
        current_chunk := current_chunk || ' ' || sentence;
      END IF;
      current_size := length(current_chunk);
    END LOOP;
    
    -- Output final chunk if not empty
    IF current_chunk != '' THEN
      chunk_count := chunk_count + 1;
      RETURN QUERY VALUES (chunk_count, trim(current_chunk), current_size);
    END IF;
    
  ELSIF chunk_type = 'fixed' THEN
    -- Fixed-size chunking with word boundaries
    FOR i IN 1..ceiling(length(content)::float / max_chunk_size) LOOP
      DECLARE
        start_pos integer := (i - 1) * max_chunk_size + 1;
        end_pos integer := least(i * max_chunk_size, length(content));
        chunk text := substring(content from start_pos for end_pos - start_pos + 1);
        last_space integer;
      BEGIN
        -- Adjust to word boundary if not at end
        IF end_pos < length(content) THEN
          last_space := position(' ' in reverse(chunk));
          IF last_space > 0 THEN
            chunk := substring(chunk from 1 for length(chunk) - last_space + 1);
          END IF;
        END IF;
        
        chunk_count := chunk_count + 1;
        RETURN QUERY VALUES (chunk_count, trim(chunk), length(chunk));
      END;
    END LOOP;
    
  ELSE
    -- Default: return whole content as single chunk
    chunk_count := 1;
    RETURN QUERY VALUES (chunk_count, content, length(content));
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically chunk instructions
CREATE OR REPLACE FUNCTION process_instruction_chunks(instruction_id uuid)
RETURNS integer AS $$
DECLARE
  instruction_record RECORD;
  chunk_record RECORD;
  chunk_count integer := 0;
  content_length integer;
  optimal_chunk_size integer;
  optimal_chunk_type text;
BEGIN
  -- Get instruction details
  SELECT content, title INTO instruction_record
  FROM chatbot_instructions 
  WHERE id = instruction_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Instruction not found: %', instruction_id;
  END IF;
  
  content_length := length(instruction_record.content);
  
  -- Determine optimal chunking strategy based on content length
  IF content_length <= 600 THEN
    -- Short content: single chunk
    optimal_chunk_size := content_length;
    optimal_chunk_type := 'single';
  ELSIF content_length <= 2000 THEN
    -- Medium content: semantic chunking
    optimal_chunk_size := 500;
    optimal_chunk_type := 'semantic';
  ELSE
    -- Long content: smaller semantic chunks
    optimal_chunk_size := 400;
    optimal_chunk_type := 'semantic';
  END IF;
  
  -- Delete existing chunks
  DELETE FROM instruction_chunks WHERE instruction_chunks.instruction_id = process_instruction_chunks.instruction_id;
  
  -- Generate new chunks
  FOR chunk_record IN 
    SELECT * FROM chunk_text(instruction_record.content, optimal_chunk_size, 50, optimal_chunk_type)
  LOOP
    INSERT INTO instruction_chunks (
      instruction_id,
      chunk_index,
      content,
      chunk_type,
      chunk_size,
      overlap_size,
      metadata
    ) VALUES (
      process_instruction_chunks.instruction_id,
      chunk_record.chunk_index,
      chunk_record.chunk_content,
      optimal_chunk_type,
      chunk_record.chunk_size,
      50,
      jsonb_build_object(
        'original_length', content_length,
        'chunk_strategy', optimal_chunk_type,
        'parent_title', instruction_record.title
      )
    );
    
    chunk_count := chunk_count + 1;
  END LOOP;
  
  RETURN chunk_count;
END;
$$ LANGUAGE plpgsql;

-- Enhanced vector search function for chunks
CREATE OR REPLACE FUNCTION match_instruction_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 15,
  chunk_types text[] DEFAULT ARRAY['semantic', 'fixed', 'single']
)
RETURNS TABLE (
  chunk_id uuid,
  instruction_id uuid,
  content TEXT,
  chunk_index integer,
  chunk_type text,
  metadata jsonb,
  parent_title text,
  parent_content_type text,
  parent_url text,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ic.id as chunk_id,
    ic.instruction_id,
    ic.content,
    ic.chunk_index,
    ic.chunk_type,
    ic.metadata,
    ci.title as parent_title,
    ci.content_type as parent_content_type,
    ci.url as parent_url,
    1 - (ic.embedding <=> query_embedding) AS similarity
  FROM
    instruction_chunks ic
    JOIN chatbot_instructions ci ON ic.instruction_id = ci.id
  WHERE
    ci.is_active = true
    AND ic.embedding IS NOT NULL
    AND ic.chunk_type = ANY(chunk_types)
    AND 1 - (ic.embedding <=> query_embedding) > match_threshold
  ORDER BY
    ic.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Enhanced instruction search with chunk fallback
CREATE OR REPLACE FUNCTION match_instructions_enhanced(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 10,
  use_chunks boolean DEFAULT true
)
RETURNS TABLE (
  content TEXT,
  content_type TEXT,
  url TEXT,
  title TEXT,
  similarity FLOAT,
  chunk_info jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF use_chunks THEN
    -- Use chunk-based search for better precision
    RETURN QUERY
    SELECT
      ic.content,
      ci.content_type,
      ci.url,
      ci.title,
      1 - (ic.embedding <=> query_embedding) AS similarity,
      jsonb_build_object(
        'is_chunk', true,
        'chunk_index', ic.chunk_index,
        'chunk_type', ic.chunk_type,
        'total_chunks', (
          SELECT count(*)::integer 
          FROM instruction_chunks ic2 
          WHERE ic2.instruction_id = ic.instruction_id
        )
      ) as chunk_info
    FROM
      instruction_chunks ic
      JOIN chatbot_instructions ci ON ic.instruction_id = ci.id
    WHERE
      ci.is_active = true
      AND ic.embedding IS NOT NULL
      AND 1 - (ic.embedding <=> query_embedding) > match_threshold
    ORDER BY
      ic.embedding <=> query_embedding
    LIMIT match_count;
  ELSE
    -- Fall back to original instruction-based search
    RETURN QUERY
    SELECT
      ci.content,
      ci.content_type,
      ci.url,
      ci.title,
      1 - (ci.embedding <=> query_embedding) AS similarity,
      jsonb_build_object('is_chunk', false) as chunk_info
    FROM
      chatbot_instructions ci
    WHERE
      ci.is_active = true
      AND ci.embedding IS NOT NULL
      AND 1 - (ci.embedding <=> query_embedding) > match_threshold
    ORDER BY
      ci.embedding <=> query_embedding
    LIMIT match_count;
  END IF;
END;
$$;

-- Trigger to automatically chunk instructions when they change
CREATE OR REPLACE FUNCTION auto_chunk_instruction()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process chunking for substantial content
  IF length(NEW.content) > 100 THEN
    PERFORM process_instruction_chunks(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic chunking
DROP TRIGGER IF EXISTS auto_chunk_instruction_trigger ON chatbot_instructions;
CREATE TRIGGER auto_chunk_instruction_trigger
AFTER INSERT OR UPDATE OF content ON chatbot_instructions
FOR EACH ROW
EXECUTE FUNCTION auto_chunk_instruction();

-- Process existing instructions for chunking
-- This will run once to chunk existing content
DO $$
DECLARE
  instruction_record RECORD;
BEGIN
  FOR instruction_record IN 
    SELECT id FROM chatbot_instructions 
    WHERE is_active = true AND length(content) > 100
  LOOP
    PERFORM process_instruction_chunks(instruction_record.id);
  END LOOP;
END $$; 