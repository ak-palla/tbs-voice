-- Fix chat instances migration to work with existing table
-- Migration: 20250101000001_fix_chat_instances_migration.sql

-- Ensure title column exists (it should already from the base table creation)
ALTER TABLE public.chat_history 
ADD COLUMN IF NOT EXISTS title text DEFAULT 'New Chat';

-- Ensure title is not null and has proper default
UPDATE public.chat_history 
SET title = 'Chat ' || EXTRACT(EPOCH FROM created_at)::bigint
WHERE title IS NULL OR title = '';

-- Ensure title column is not null
ALTER TABLE public.chat_history 
ALTER COLUMN title SET NOT NULL;

-- Remove any existing unique constraint on user_id (users can have multiple chat instances)
ALTER TABLE public.chat_history 
DROP CONSTRAINT IF EXISTS chat_history_user_id_key;

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id_created_at 
ON public.chat_history (user_id, created_at DESC);

-- Add any missing constraints
ALTER TABLE public.chat_history 
ADD CONSTRAINT IF NOT EXISTS chat_history_messages_check 
CHECK (jsonb_typeof(messages) = 'array');

-- Update existing records to ensure they have proper structure
UPDATE public.chat_history 
SET messages = '[]'::jsonb 
WHERE messages IS NULL OR jsonb_typeof(messages) != 'array';

-- Add helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_history_title 
ON public.chat_history (title);

CREATE INDEX IF NOT EXISTS idx_chat_history_updated_at 
ON public.chat_history (updated_at DESC);

-- Ensure proper permissions
GRANT ALL ON public.chat_history TO authenticated;
GRANT SELECT ON public.chat_history TO anon; 