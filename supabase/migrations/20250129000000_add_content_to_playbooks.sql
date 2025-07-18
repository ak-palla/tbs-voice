-- Add content field to playbooks table for rich text content
ALTER TABLE playbooks 
ADD COLUMN content TEXT DEFAULT '';

-- Add an index for better performance when searching content
CREATE INDEX idx_playbooks_content ON playbooks USING gin(to_tsvector('english', content));

-- Update the RLS policies to allow content access
-- This assumes the existing RLS policies already cover the table properly 