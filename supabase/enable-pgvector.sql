-- This script can be run directly in the Supabase SQL editor
-- You need admin/superuser permissions to run it

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Check if pgvector is installed
SELECT extname, extversion 
FROM pg_extension 
WHERE extname = 'vector';

-- Enable RLS (Row Level Security) for the tables we'll modify (if not already enabled)
ALTER TABLE chatbot_instructions ENABLE ROW LEVEL SECURITY;

-- Check if embedding column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'chatbot_instructions' 
        AND column_name = 'embedding'
    ) THEN
        ALTER TABLE chatbot_instructions ADD COLUMN embedding vector(1536);
        RAISE NOTICE 'Added embedding column to chatbot_instructions';
    ELSE
        RAISE NOTICE 'embedding column already exists in chatbot_instructions';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'chatbot_instructions' 
        AND column_name = 'embedding_updated_at'
    ) THEN
        ALTER TABLE chatbot_instructions ADD COLUMN embedding_updated_at TIMESTAMPTZ;
        RAISE NOTICE 'Added embedding_updated_at column to chatbot_instructions';
    ELSE
        RAISE NOTICE 'embedding_updated_at column already exists in chatbot_instructions';
    END IF;
END $$;

-- Create the vector similarity search function
CREATE OR REPLACE FUNCTION match_chatbot_instructions(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  content_type TEXT,
  url TEXT,
  updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  extraction_metadata JSONB,
  title TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ci.id,
    ci.content,
    ci.content_type,
    ci.url,
    ci.updated_at,
    ci.created_at,
    ci.extraction_metadata,
    ci.title,
    1 - (ci.embedding <=> query_embedding) AS similarity
  FROM
    chatbot_instructions ci
  WHERE
    ci.is_active = true
    AND ci.embedding IS NOT NULL
    AND 1 - (ci.embedding <=> query_embedding) > match_threshold
  ORDER BY
    ci.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create helper functions for API usage
CREATE OR REPLACE FUNCTION enable_pgvector()
RETURNS void AS $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helper function to execute custom SQL (for initialization from API)
CREATE OR REPLACE FUNCTION sql_query(query text)
RETURNS void AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create an index for vector similarity search
-- Note: This might take some time on large tables
DO $$
BEGIN
    -- Check if the index already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'chatbot_instructions_embedding_idx'
    ) THEN
        CREATE INDEX chatbot_instructions_embedding_idx 
        ON chatbot_instructions 
        USING ivfflat (embedding vector_cosine_ops) 
        WITH (lists = 100);
        RAISE NOTICE 'Created vector similarity index';
    ELSE
        RAISE NOTICE 'Vector similarity index already exists';
    END IF;
END $$;

-- Output status of the setup
SELECT 'pgvector setup complete!' as status; 