-- Migration to support multiple chat instances per user

-- First, add a title column to the existing chat_history table
ALTER TABLE public.chat_history 
ADD COLUMN IF NOT EXISTS title text DEFAULT 'New Chat';

-- Remove the unique constraint on user_id to allow multiple instances per user
ALTER TABLE public.chat_history 
DROP CONSTRAINT IF EXISTS chat_history_user_id_key;

-- Add a new index for efficient querying by user_id
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id_created_at 
ON public.chat_history (user_id, created_at DESC);

-- Update existing records to have a proper title
UPDATE public.chat_history 
SET title = 'Chat ' || EXTRACT(EPOCH FROM created_at)::bigint
WHERE title = 'New Chat' OR title IS NULL;

-- Add a constraint to ensure title is not null
ALTER TABLE public.chat_history 
ALTER COLUMN title SET NOT NULL; 