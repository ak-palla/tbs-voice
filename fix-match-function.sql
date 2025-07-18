-- Fixed match_chatbot_instructions function with correct schema
-- This should replace the existing function

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
  priority INTEGER,
  category TEXT,
  is_active BOOLEAN,
  embedding_updated_at TIMESTAMPTZ,
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
    ci.priority,
    ci.category,
    ci.is_active,
    ci.embedding_updated_at,
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