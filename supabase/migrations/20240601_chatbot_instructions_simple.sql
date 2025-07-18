-- Create the chatbot_instructions table with a simpler structure
create table public.chatbot_instructions (
  id uuid not null default extensions.uuid_generate_v4(),
  user_id uuid null, -- null for global instructions, specific user ID for user-specific instructions
  content text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint chatbot_instructions_pkey primary key (id),
  constraint chatbot_instructions_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade
);

-- Create index for faster queries
create index if not exists idx_chatbot_instructions_user_id on public.chatbot_instructions using btree (user_id);

-- Create a trigger to update the updated_at timestamp automatically
create trigger update_chatbot_instructions_updated_at before
update on chatbot_instructions for each row
execute function update_updated_at_column(); 