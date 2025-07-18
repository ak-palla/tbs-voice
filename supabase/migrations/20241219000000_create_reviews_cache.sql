-- Create reviews_cache table for storing cached Google reviews data
CREATE TABLE IF NOT EXISTS reviews_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  summary_data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_cache_business_name ON reviews_cache(business_name);
CREATE INDEX IF NOT EXISTS idx_reviews_cache_last_updated ON reviews_cache(last_updated);

-- Add RLS (Row Level Security) policies
ALTER TABLE reviews_cache ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to read/write their own reviews data
CREATE POLICY "Users can access reviews cache" ON reviews_cache
  FOR ALL USING (true);

-- Create trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reviews_cache_updated_at BEFORE UPDATE
  ON reviews_cache FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column(); 