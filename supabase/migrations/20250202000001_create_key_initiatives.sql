-- Create key_initiatives table
create table public.key_initiatives (
  id uuid not null default extensions.uuid_generate_v4(),
  name text not null,
  status text not null default 'Backlog' check (status in ('Backlog', 'In Progress', 'On Track', 'Behind', 'Completed')),
  owner_id uuid references public.business_info(id) on delete set null,
  stakeholders text[], -- Array of stakeholder names/emails
  due_date date,
  results text,
  associated_playbook_id uuid references public.playbooks(id) on delete set null,
  team_id uuid not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint key_initiatives_pkey primary key (id)
) tablespace pg_default;

-- Create junction table for key_initiatives and departments (teams)
create table public.key_initiative_departments (
  id uuid not null default extensions.uuid_generate_v4(),
  key_initiative_id uuid not null references public.key_initiatives(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  created_at timestamp with time zone null default now(),
  constraint key_initiative_departments_pkey primary key (id),
  constraint key_initiative_departments_unique unique (key_initiative_id, department_id)
) tablespace pg_default;

-- Enable RLS
alter table public.key_initiatives enable row level security;
alter table public.key_initiative_departments enable row level security;

-- Create RLS policies for key_initiatives
create policy "Users can view key initiatives from their team"
on public.key_initiatives for select
using (
  exists (
    select 1 from public.business_info bi
    where bi.user_id = auth.uid()
    and bi.team_id = key_initiatives.team_id
  )
);

create policy "Users can insert key initiatives for their team"
on public.key_initiatives for insert
with check (
  exists (
    select 1 from public.business_info bi
    where bi.user_id = auth.uid()
    and bi.team_id = key_initiatives.team_id
  )
);

create policy "Users can update key initiatives from their team"
on public.key_initiatives for update
using (
  exists (
    select 1 from public.business_info bi
    where bi.user_id = auth.uid()
    and bi.team_id = key_initiatives.team_id
  )
);

create policy "Users can delete key initiatives from their team"
on public.key_initiatives for delete
using (
  exists (
    select 1 from public.business_info bi
    where bi.user_id = auth.uid()
    and bi.team_id = key_initiatives.team_id
  )
);

-- Create RLS policies for key_initiative_departments
create policy "Users can view key initiative departments from their team"
on public.key_initiative_departments for select
using (
  exists (
    select 1 from public.key_initiatives ki
    join public.business_info bi on bi.team_id = ki.team_id
    where bi.user_id = auth.uid()
    and ki.id = key_initiative_departments.key_initiative_id
  )
);

create policy "Users can insert key initiative departments for their team"
on public.key_initiative_departments for insert
with check (
  exists (
    select 1 from public.key_initiatives ki
    join public.business_info bi on bi.team_id = ki.team_id
    where bi.user_id = auth.uid()
    and ki.id = key_initiative_departments.key_initiative_id
  )
);

create policy "Users can update key initiative departments from their team"
on public.key_initiative_departments for update
using (
  exists (
    select 1 from public.key_initiatives ki
    join public.business_info bi on bi.team_id = ki.team_id
    where bi.user_id = auth.uid()
    and ki.id = key_initiative_departments.key_initiative_id
  )
);

create policy "Users can delete key initiative departments from their team"
on public.key_initiative_departments for delete
using (
  exists (
    select 1 from public.key_initiatives ki
    join public.business_info bi on bi.team_id = ki.team_id
    where bi.user_id = auth.uid()
    and ki.id = key_initiative_departments.key_initiative_id
  )
);

-- Create indexes for performance
create index idx_key_initiatives_team_id on public.key_initiatives(team_id);
create index idx_key_initiatives_owner_id on public.key_initiatives(owner_id);
create index idx_key_initiatives_playbook_id on public.key_initiatives(associated_playbook_id);
create index idx_key_initiative_departments_initiative_id on public.key_initiative_departments(key_initiative_id);
create index idx_key_initiative_departments_department_id on public.key_initiative_departments(department_id); 