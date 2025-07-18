-- Create training data table for innovation chat
create table public.innovation_chat_training_data (
  id uuid not null default extensions.uuid_generate_v4 (),
  original_chat_id uuid not null, -- Reference to original chat session
  user_id uuid not null,
  title text not null,
  messages jsonb not null, -- Complete conversation history
  session_metadata jsonb default '{}'::jsonb, -- Additional context like creation date, user info, etc.
  archived_at timestamp with time zone not null default timezone ('utc'::text, now()),
  archive_reason text not null, -- 'cleared' or 'deleted' or 'manual'
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint innovation_chat_training_data_pkey primary key (id),
  constraint innovation_chat_training_data_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

-- Indexes for efficient querying
create index IF not exists idx_innovation_training_user_id on public.innovation_chat_training_data using btree (user_id) TABLESPACE pg_default;
create index IF not exists idx_innovation_training_archived_at on public.innovation_chat_training_data using btree (archived_at desc) TABLESPACE pg_default;
create index IF not exists idx_innovation_training_original_chat_id on public.innovation_chat_training_data using btree (original_chat_id) TABLESPACE pg_default;
create index IF not exists idx_innovation_training_archive_reason on public.innovation_chat_training_data using btree (archive_reason) TABLESPACE pg_default;

-- Add comment for documentation
comment on table public.innovation_chat_training_data is 'Stores archived innovation chat conversations for AI training purposes';
comment on column public.innovation_chat_training_data.messages is 'Complete conversation history preserved for training';
comment on column public.innovation_chat_training_data.session_metadata is 'Additional context about the session for training purposes';
comment on column public.innovation_chat_training_data.archive_reason is 'Reason for archiving: cleared, deleted, or manual'; 