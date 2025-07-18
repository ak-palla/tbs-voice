-- Debug script to diagnose vector search issues
-- Run this in Supabase SQL Editor

-- 1. Check if pgvector extension is enabled
SELECT name, default_version, installed_version 
FROM pg_available_extensions 
WHERE name = 'vector';

-- 2. Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chatbot_instructions' 
ORDER BY ordinal_position;

-- 3. Check if records exist and their status
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_records,
  COUNT(CASE WHEN embedding IS NOT NULL THEN 1 END) as records_with_embeddings,
  COUNT(CASE WHEN is_active = true AND embedding IS NOT NULL THEN 1 END) as searchable_records
FROM chatbot_instructions;

-- 4. Show sample of actual data
SELECT 
  id,
  title,
  CASE WHEN embedding IS NOT NULL THEN 'HAS_EMBEDDING' ELSE 'NO_EMBEDDING' END as embedding_status,
  is_active,
  priority,
  category,
  LENGTH(content) as content_length,
  embedding_updated_at
FROM chatbot_instructions 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Check if the match function exists and its definition
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'match_chatbot_instructions';

-- 6. Test the vector search function with a simple query
-- (This will only work if embeddings exist)
SELECT 
  'Testing vector function...' as test_status,
  COUNT(*) as result_count
FROM (
  SELECT * FROM match_chatbot_instructions(
    ARRAY[0.1,0.2,0.3]::vector(1536),  -- dummy embedding
    0.0,  -- very low threshold to catch any results
    10
  )
) as test_results;

-- 7. Check embedding dimensions if any exist
SELECT 
  id,
  title,
  array_length(embedding, 1) as embedding_dimension
FROM chatbot_instructions 
WHERE embedding IS NOT NULL 
LIMIT 5;