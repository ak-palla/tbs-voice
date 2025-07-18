-- Create chat_history table for storing user chat sessions
-- Migration: 20250101000000_create_chat_history.sql

CREATE TABLE IF NOT EXISTS public.chat_history (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'New Chat',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chat_history_pkey PRIMARY KEY (id),
  CONSTRAINT chat_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id_updated_at 
ON public.chat_history (user_id, updated_at DESC) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_chat_history_user_id 
ON public.chat_history (user_id) TABLESPACE pg_default;

-- Create trigger to update the updated_at timestamp automatically
CREATE TRIGGER update_chat_history_updated_at 
BEFORE UPDATE ON chat_history 
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat history
CREATE POLICY "Users can view their own chat history" ON public.chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat history" ON public.chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat history" ON public.chat_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat history" ON public.chat_history
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.chat_history TO authenticated;
GRANT SELECT ON public.chat_history TO anon;

-- Add helpful comment
COMMENT ON TABLE public.chat_history IS 'Stores user chat conversation history with multiple instances support';
COMMENT ON COLUMN public.chat_history.messages IS 'JSONB array of chat messages with role, content, and timestamp';
COMMENT ON COLUMN public.chat_history.title IS 'User-friendly title for the chat instance'; 