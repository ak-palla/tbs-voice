create table public.battle_plan (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  businessplanlink text null default ''::text,
  missionstatement text null default ''::text,
  visionstatement text null default ''::text,
  purposewhy jsonb[] null default '{}'::jsonb[],
  strategicanchors jsonb[] null default '{}'::jsonb[],
  corevalues jsonb[] null default '{}'::jsonb[],
  threeyeartarget jsonb[] null default '{}'::jsonb[],
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint battle_plan_pkey primary key (id),
  constraint battle_plan_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_battle_plan_updated_at BEFORE
update on battle_plan for EACH row
execute FUNCTION update_updated_at_column ();




create table public.business_info (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  full_name text not null,
  business_name text not null,
  email text not null,
  phone_number text not null,
  payment_option text not null,
  payment_remaining numeric(10, 2) null default 0,
  command_hq_link text null,
  command_hq_created boolean null default false,
  gd_folder_created boolean null default false,
  meeting_scheduled boolean null default false,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  profile_picture_url text null,
  role text not null default 'user'::text,
  constraint business_info_pkey primary key (id),
  constraint business_info_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint business_info_role_check check (
    (
      role = any (
        array['super_admin'::text, 'admin'::text, 'user'::text]
      )
    )
  )
) TABLESPACE pg_default;

create trigger update_business_info_updated_at BEFORE
update on business_info for EACH row
execute FUNCTION update_updated_at_column ();



create table public.chain_of_command (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  name text null default ''::text,
  manager text null default ''::text,
  jobtitle text null default ''::text,
  criticalaccountabilities jsonb[] null default '{}'::jsonb[],
  playbooksowned jsonb[] null default '{}'::jsonb[],
  department text null default ''::text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint chain_of_command_pkey primary key (id),
  constraint chain_of_command_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_chain_of_command_updated_at BEFORE
update on chain_of_command for EACH row
execute FUNCTION update_updated_at_column ();




create table public.chq_benefits (
  id uuid not null default extensions.uuid_generate_v4 (),
  benefit_name text not null,
  notes text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint chq_benefits_pkey primary key (id)
) TABLESPACE pg_default;

create trigger update_chq_benefits_updated_at BEFORE
update on chq_benefits for EACH row
execute FUNCTION update_updated_at_column ();





create table public.chq_checklist (
  id uuid not null default extensions.uuid_generate_v4 (),
  checklist_item text not null,
  notes text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint chq_checklist_pkey primary key (id)
) TABLESPACE pg_default;

create trigger update_chq_checklist_updated_at BEFORE
update on chq_checklist for EACH row
execute FUNCTION update_updated_at_column ();





create table public.chq_timeline (
  id uuid not null default extensions.uuid_generate_v4 (),
  week_number integer not null,
  event_name text not null,
  scheduled_date date not null,
  duration_minutes integer null,
  description text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint chq_timeline_pkey primary key (id)
) TABLESPACE pg_default;

create trigger update_chq_timeline_updated_at BEFORE
update on chq_timeline for EACH row
execute FUNCTION update_updated_at_column ();





create table public.company_scorecards (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  name text not null,
  department text not null,
  week1 text null,
  week2 text null,
  week3 text null,
  week4 text null,
  remainder text null,
  monthlyactual text null,
  monthlytarget text null,
  status text not null,
  metricowner text null,
  metricsource text null,
  notes text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint company_scorecards_pkey primary key (id),
  constraint company_scorecards_user_id_fkey foreign KEY (user_id) references auth.users (id),
  constraint company_scorecards_status_check check (
    (
      status = any (
        array[
          'Green'::text,
          'Light Green'::text,
          'Yellow'::text,
          'Light Red'::text,
          'Red'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;








create table public.hwgt_plan (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  howwegetthereplan jsonb not null default '{"modelBrand": {"Q0": "", "Q4": "", "Q8": "", "Q12": ""}, "customerAvatars": {"Q0": "", "Q4": "", "Q8": "", "Q12": ""}, "productsServices": {"Q0": "", "Q4": "", "Q8": "", "Q12": ""}, "teamOrganisation": {"Q0": "", "Q4": "", "Q8": "", "Q12": ""}, "customerAcquisition": {"Q0": "", "Q4": "", "Q8": "", "Q12": ""}, "fulfillmentProduction": {"Q0": "", "Q4": "", "Q8": "", "Q12": ""}}'::jsonb,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint hwgt_plan_pkey primary key (id),
  constraint hwgt_plan_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_hwgt_plan_user_id on public.hwgt_plan using btree (user_id) TABLESPACE pg_default;

create trigger update_hwgt_plan_updated_at BEFORE
update on hwgt_plan for EACH row
execute FUNCTION update_updated_at_column ();






create table public.machines (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  enginename text not null,
  enginetype text not null,
  description text null,
  triggeringevents jsonb[] null default array[]::jsonb[],
  endingevent jsonb[] null default array[]::jsonb[],
  actionsactivities jsonb[] null default array[]::jsonb[],
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  figma_link text null,
  figma_embed text null,
  constraint machines_pkey primary key (id),
  constraint machines_user_id_fkey foreign KEY (user_id) references auth.users (id),
  constraint machines_enginetype_check check (
    (
      enginetype = any (
        array[
          'GROWTH'::text,
          'FULFILLMENT'::text,
          'INNOVATION'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create trigger update_machines_updated_at BEFORE
update on machines for EACH row
execute FUNCTION update_updated_at_column ();







create table public.meeting_rhythm_planner (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  meeting_type text not null,
  meeting_date date not null,
  meeting_title text not null default ''::text,
  meeting_description text null default ''::text,
  meeting_color text null default ''::text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint meeting_rhythm_planner_pkey primary key (id),
  constraint meeting_rhythm_planner_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_meeting_rhythm_planner_user_id on public.meeting_rhythm_planner using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_meeting_rhythm_planner_date on public.meeting_rhythm_planner using btree (meeting_date) TABLESPACE pg_default;

create trigger update_meeting_rhythm_planner_updated_at BEFORE
update on meeting_rhythm_planner for EACH row
execute FUNCTION update_meeting_planner_updated_at ();








create table public.playbooks (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  playbookname text not null,
  description text null,
  enginetype text not null,
  owner text null,
  status text not null,
  link text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint playbooks_pkey primary key (id),
  constraint playbooks_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint playbooks_enginetype_check check (
    (
      enginetype = any (
        array[
          'GROWTH'::text,
          'FULFILLMENT'::text,
          'INNOVATION'::text
        ]
      )
    )
  ),
  constraint playbooks_status_check check (
    (
      status = any (
        array[
          'Backlog'::text,
          'In Progress'::text,
          'Behind'::text,
          'Completed'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create trigger update_playbooks_updated_at BEFORE
update on playbooks for EACH row
execute FUNCTION update_updated_at_column ();








create table public.quarterly_sprint_canvas (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  revenuegoals jsonb not null default '{"best": "", "good": "", "better": ""}'::jsonb,
  unitgoals jsonb[] not null default '{}'::jsonb[],
  revenuebymonth jsonb[] not null default '{}'::jsonb[],
  theme text null,
  strategicpillars text[] not null default '{"","",""}'::text[],
  northstarmetrics jsonb[] not null default '{}'::jsonb[],
  keyinitiatives jsonb[] not null default '{}'::jsonb[],
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint quarterly_sprint_canvas_pkey primary key (id),
  constraint quarterly_sprint_canvas_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_quarterly_sprint_canvas_updated_at BEFORE
update on quarterly_sprint_canvas for EACH row
execute FUNCTION update_modified_column ();








create table public.triage_planner (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  company_info jsonb null default '{}'::jsonb,
  internal_tasks jsonb[] null default '{}'::jsonb[],
  what_you_do text null default ''::text,
  who_you_serve text null default ''::text,
  what_is_right jsonb[] null default '{}'::jsonb[],
  what_is_wrong jsonb[] null default '{}'::jsonb[],
  what_is_missing jsonb[] null default '{}'::jsonb[],
  what_is_confusing jsonb[] null default '{}'::jsonb[],
  notes text null default ''::text,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint triage_planner_pkey primary key (id),
  constraint triage_planner_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_triage_planner_updated_at BEFORE
update on triage_planner for EACH row
execute FUNCTION update_updated_at_column ();







create table public.user_benefit_claims (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  benefit_id uuid not null,
  is_claimed boolean not null default false,
  claimed_date timestamp with time zone null,
  notes text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint user_benefit_claims_pkey primary key (id),
  constraint user_benefit_claims_user_benefit_unique unique (user_id, benefit_id),
  constraint user_benefit_claims_benefit_id_fkey foreign KEY (benefit_id) references chq_benefits (id) on delete CASCADE,
  constraint user_benefit_claims_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_user_benefit_claims_user_id on public.user_benefit_claims using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_user_benefit_claims_benefit_id on public.user_benefit_claims using btree (benefit_id) TABLESPACE pg_default;

create trigger update_user_benefit_claims_updated_at BEFORE
update on user_benefit_claims for EACH row
execute FUNCTION update_updated_at_column ();







create table public.user_checklist_claims (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  checklist_id uuid not null,
  is_completed boolean not null default false,
  completion_date timestamp with time zone null,
  notes text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint user_checklist_claims_pkey primary key (id),
  constraint user_checklist_claims_user_checklist_unique unique (user_id, checklist_id),
  constraint user_checklist_claims_checklist_id_fkey foreign KEY (checklist_id) references chq_checklist (id) on delete CASCADE,
  constraint user_checklist_claims_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_user_checklist_claims_user_id on public.user_checklist_claims using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_user_checklist_claims_checklist_id on public.user_checklist_claims using btree (checklist_id) TABLESPACE pg_default;

create trigger update_user_checklist_claims_updated_at BEFORE
update on user_checklist_claims for EACH row
execute FUNCTION update_updated_at_column ();








create table public.user_timeline_claims (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  timeline_id uuid not null,
  is_completed boolean not null default false,
  completion_date timestamp with time zone null,
  notes text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint user_timeline_claims_pkey primary key (id),
  constraint user_timeline_claims_user_timeline_unique unique (user_id, timeline_id),
  constraint user_timeline_claims_timeline_id_fkey foreign KEY (timeline_id) references chq_timeline (id) on delete CASCADE,
  constraint user_timeline_claims_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_user_timeline_claims_user_id on public.user_timeline_claims using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_user_timeline_claims_timeline_id on public.user_timeline_claims using btree (timeline_id) TABLESPACE pg_default;

create trigger update_user_timeline_claims_updated_at BEFORE
update on user_timeline_claims for EACH row
execute FUNCTION update_updated_at_column ();