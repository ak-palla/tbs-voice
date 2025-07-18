-- Create app_cache table if it doesn't exist
CREATE TABLE IF NOT EXISTS app_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cache_key TEXT NOT NULL,
    cache_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_app_cache_key ON app_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_app_cache_type ON app_cache(cache_type);
CREATE INDEX IF NOT EXISTS idx_app_cache_user ON app_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_app_cache_expires ON app_cache(expires_at);

-- Add composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_app_cache_lookup ON app_cache(cache_key, cache_type, user_id);

-- Add RLS policies
ALTER TABLE app_cache ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own cache entries and global cache
CREATE POLICY "Users can read their own cache entries"
    ON app_cache FOR SELECT
    USING (
        auth.uid() = user_id 
        OR user_id IS NULL -- For global cache entries
    );

-- Allow authenticated users to insert their own cache entries
CREATE POLICY "Users can insert their own cache entries"
    ON app_cache FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        OR (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin') AND user_id IS NULL)
    );

-- Allow users to update their own cache entries
CREATE POLICY "Users can update their own cache entries"
    ON app_cache FOR UPDATE
    USING (
        auth.uid() = user_id
        OR (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin') AND user_id IS NULL)
    );

-- Allow users to delete their own cache entries
CREATE POLICY "Users can delete their own cache entries"
    ON app_cache FOR DELETE
    USING (
        auth.uid() = user_id
        OR (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin') AND user_id IS NULL)
    );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_cache_updated_at
    BEFORE UPDATE ON app_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 