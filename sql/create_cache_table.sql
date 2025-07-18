-- Create app_cache table for persistent caching
CREATE TABLE IF NOT EXISTS app_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cache_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_cache_key ON app_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_app_cache_user_type ON app_cache(user_id, cache_type);
CREATE INDEX IF NOT EXISTS idx_app_cache_expires ON app_cache(expires_at);

-- Enable RLS (Row Level Security)
ALTER TABLE app_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can access their own cache" 
ON app_cache 
FOR ALL 
USING (user_id = auth.uid() OR user_id IS NULL);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_app_cache_updated_at
  BEFORE UPDATE ON app_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_cache_updated_at();

-- Create function to cleanup expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM app_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a periodic cleanup job (if you have pg_cron extension)
-- SELECT cron.schedule('cleanup-cache', '0 */6 * * *', 'SELECT cleanup_expired_cache();'); 