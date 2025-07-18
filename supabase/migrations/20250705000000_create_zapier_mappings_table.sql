-- Create the zapier_mappings table
CREATE TABLE zapier_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    zapier_field_name TEXT NOT NULL,
    internal_field_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add RLS to the zapier_mappings table
ALTER TABLE zapier_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to user's own mappings" ON zapier_mappings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow insert access for authenticated users" ON zapier_mappings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow update access for user's own mappings" ON zapier_mappings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow delete access for user's own mappings" ON zapier_mappings FOR DELETE USING (auth.uid() = user_id);

-- Optional: Add a unique constraint to prevent duplicate mappings for a user
ALTER TABLE zapier_mappings ADD CONSTRAINT unique_user_zapier_field UNIQUE (user_id, zapier_field_name); 