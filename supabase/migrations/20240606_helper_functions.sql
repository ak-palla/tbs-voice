-- Add helper function to enable pgvector extension
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