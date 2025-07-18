# RAG (Retrieval-Augmented Generation) System Documentation

## Overview

The RAG system enhances the chatbot's ability to provide relevant responses by dynamically retrieving and selecting the most pertinent context information based on the user's query. Instead of sending all available instructions to the model, RAG uses semantic search to find only the most relevant instructions.

## Components

1. **pgvector Database Extension**
   - Enables vector storage and similarity search in Supabase
   - Stores embedding vectors (1536 dimensions) for each instruction

2. **Embedding Generation**
   - Uses OpenAI's text-embedding-3-small model
   - Converts instruction text to numerical vectors that capture semantic meaning
   - Automatically updates embeddings when content changes

3. **Vector Similarity Search**
   - Finds the most semantically similar instructions to a user's query
   - Ranks results by cosine similarity
   - Optimized with an IVFFlat index for performance

4. **Admin Interface**
   - Initialize the RAG system
   - Update embeddings for all instructions
   - Monitor and test vector search performance

## Setup Process

1. **Database Configuration**
   - The SQL migrations in `supabase/migrations/` set up:
     - pgvector extension
     - Vector column in the chatbot_instructions table
     - Similarity search function
     - Indexing for performance

2. **API Endpoints**
   - `/api/embeddings/init`: Initializes the pgvector setup and updates all embeddings
   - `/api/embeddings/update`: Updates embeddings for new or changed instructions
   - `/api/chat`: Modified to use vector search with the userQuery parameter

## Usage

### Admin Interface

1. Navigate to `/admin/rag`
2. Click "Initialize RAG System" to set up pgvector and create initial embeddings
3. Use "Update Embeddings" to refresh embeddings after adding/editing instructions
4. Test the system with sample queries

### Integration

The chat component has been modified to:
1. Pass the user's message as context for RAG search
2. Create a new optimized session for each message
3. Fall back to default behavior if no relevant instructions are found

## Technical Details

### Vector Search Function

```sql
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
```

## Troubleshooting

- **Missing Embeddings**: Use the admin interface to check for instructions without embeddings
- **Search Quality Issues**: Adjust the similarity threshold (default 0.6) or the number of results retrieved
- **Performance Concerns**: Monitor query times, consider adjusting the IVFFlat index parameters

## Future Improvements

- Implement chunking for long instructions to improve retrieval precision
- Add hybrid search (keyword + semantic) for better results
- Implement user feedback loop to improve search quality over time
- Consider using different embedding models for different types of content 