-- Create innovation_chat_history table for specialized innovation chat sessions
create table public.innovation_chat_history (
  id uuid not null default extensions.uuid_generate_v4(),
  user_id uuid not null,
  title text not null default 'New Innovation',
  messages jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint innovation_chat_history_pkey primary key (id),
  constraint innovation_chat_history_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade
) tablespace pg_default;

-- Create indexes for efficient querying
create index if not exists idx_innovation_chat_history_user_id_updated_at 
on public.innovation_chat_history (user_id, updated_at desc) tablespace pg_default;

create index if not exists idx_innovation_chat_history_user_id_active 
on public.innovation_chat_history (user_id, is_active) tablespace pg_default;

-- Create trigger to update the updated_at timestamp automatically
create trigger update_innovation_chat_history_updated_at 
before update on innovation_chat_history 
for each row
execute function update_updated_at_column();

-- Grant permissions (RLS will be handled by app-level auth)
alter table public.innovation_chat_history enable row level security;

-- Create RLS policies for innovation chat history
create policy "Users can view their own innovation chat history" on public.innovation_chat_history
  for select using (auth.uid() = user_id);

create policy "Users can insert their own innovation chat history" on public.innovation_chat_history
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own innovation chat history" on public.innovation_chat_history
  for update using (auth.uid() = user_id);

create policy "Users can delete their own innovation chat history" on public.innovation_chat_history
  for delete using (auth.uid() = user_id); 