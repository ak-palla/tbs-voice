-- Team Directory Enhancement Migration

-- Step 1: Create the departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    team_id uuid NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT departments_pkey PRIMARY KEY (id),
    CONSTRAINT departments_team_id_fkey FOREIGN KEY (team_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT departments_team_id_name_unique UNIQUE (team_id, name)
);
COMMENT ON TABLE public.departments IS 'Stores unique department names for each team.';

-- Step 2: Create the playbook_assignments junction table
CREATE TABLE IF NOT EXISTS public.playbook_assignments (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL,
    playbook_id uuid NOT NULL,
    assignment_type text NOT NULL, -- e.g., 'Owner', 'Related'
    created_at timestamptz DEFAULT now(),
    CONSTRAINT playbook_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT playbook_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.business_info(id) ON DELETE CASCADE,
    CONSTRAINT playbook_assignments_playbook_id_fkey FOREIGN KEY (playbook_id) REFERENCES public.playbooks(id) ON DELETE CASCADE,
    CONSTRAINT playbook_assignments_user_playbook_unique UNIQUE (user_id, playbook_id, assignment_type)
);
COMMENT ON TABLE public.playbook_assignments IS 'Links users to playbooks with a specific assignment type.';

-- Step 3: Add new relational columns to business_info table
ALTER TABLE public.business_info
ADD COLUMN IF NOT EXISTS manager_id uuid,
ADD COLUMN IF NOT EXISTS department_id uuid;

-- Step 4: Add foreign key constraints to the new columns
-- Adding manager_id constraint separately to avoid issues if table already has data
ALTER TABLE public.business_info
ADD CONSTRAINT business_info_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.business_info(id) ON DELETE SET NULL;

-- Adding department_id constraint
ALTER TABLE public.business_info
ADD CONSTRAINT business_info_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.business_info.manager_id IS 'Self-referencing foreign key to link to the user''s manager.';
COMMENT ON COLUMN public.business_info.department_id IS 'Foreign key to the departments table.';

-- Step 5: Data Migration (Run this manually or as a separate script after creating the UI to manage departments/managers)
-- This section is commented out because it requires careful execution.
-- It's best to first build the UI to populate the new tables, then run the migration.

/*
-- 5.1: Populate departments table from existing distinct departments for each team
INSERT INTO public.departments (name, team_id)
SELECT DISTINCT department, team_id
FROM public.business_info
WHERE department IS NOT NULL AND department <> '' AND team_id IS NOT NULL
ON CONFLICT (team_id, name) DO NOTHING;

-- 5.2: Update business_info.department_id with the new foreign keys
UPDATE public.business_info bi
SET department_id = d.id
FROM public.departments d
WHERE bi.department = d.name AND bi.team_id = d.team_id;

-- 5.3: Update business_info.manager_id from the old text field
-- This is dependent on names being unique. It's a best-effort migration.
UPDATE public.business_info bi
SET manager_id = manager_info.id
FROM public.business_info manager_info
WHERE bi.manager = manager_info.full_name AND bi.team_id = manager_info.team_id;

-- 5.4: Migrate playbooks_owned from the JSONB array to the assignments table
-- This is complex and best handled by a script. The structure assumes the JSONB array contains objects like {"value": "Playbook Name"}
-- A script would need to loop through users, parse this JSON, find the corresponding playbook by name, and insert into playbook_assignments.
*/

-- Step 6: (Optional) Clean up by removing old columns after successful migration.
-- We will keep these for now to avoid breaking the existing application.
/*
ALTER TABLE public.business_info
DROP COLUMN IF EXISTS manager,
DROP COLUMN IF EXISTS department,
DROP COLUMN IF EXISTS playbooks_owned,
DROP COLUMN IF EXISTS critical_accountabilities; -- CABs are also user-specific, not team-wide, so can stay in business_info
*/ 