-- Create the chatbot_instructions table for storing both global and user-specific instructions
create table public.chatbot_instructions (
  id uuid not null default extensions.uuid_generate_v4(),
  user_id uuid null, -- null for global instructions, specific user ID for user-specific instructions
  content text not null,
  is_global boolean not null default false,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint chatbot_instructions_pkey primary key (id),
  constraint chatbot_instructions_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade
) tablespace pg_default;

-- Create indexes for faster queries
create index if not exists idx_chatbot_instructions_user_id on public.chatbot_instructions using btree (user_id) tablespace pg_default;
create index if not exists idx_chatbot_instructions_is_global on public.chatbot_instructions using btree (is_global) tablespace pg_default;

-- Create a trigger to update the updated_at timestamp automatically
create trigger update_chatbot_instructions_updated_at before
update on chatbot_instructions for each row
execute function update_updated_at_column(); 