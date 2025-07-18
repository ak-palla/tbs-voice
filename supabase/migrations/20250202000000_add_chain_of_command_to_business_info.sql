-- Add chain of command fields to business_info table
ALTER TABLE public.business_info 
ADD COLUMN IF NOT EXISTS job_title text DEFAULT ''::text,
ADD COLUMN IF NOT EXISTS manager text DEFAULT ''::text,
ADD COLUMN IF NOT EXISTS critical_accountabilities jsonb[] DEFAULT '{}'::jsonb[],
ADD COLUMN IF NOT EXISTS playbooks_owned jsonb[] DEFAULT '{}'::jsonb[],
ADD COLUMN IF NOT EXISTS department text DEFAULT ''::text;

-- Migrate existing data from chain_of_command to business_info
UPDATE public.business_info 
SET 
  job_title = COALESCE(coc.jobtitle, ''),
  manager = COALESCE(coc.manager, ''),
  critical_accountabilities = COALESCE(coc.criticalaccountabilities, '{}'::jsonb[]),
  playbooks_owned = COALESCE(coc.playbooksowned, '{}'::jsonb[]),
  department = COALESCE(coc.department, '')
FROM public.chain_of_command coc
WHERE business_info.user_id = coc.user_id;

-- Add comment for documentation
COMMENT ON COLUMN public.business_info.job_title IS 'Job title of the user in the organization';
COMMENT ON COLUMN public.business_info.manager IS 'Name of the user''s manager';
COMMENT ON COLUMN public.business_info.critical_accountabilities IS 'Array of critical accountabilities for this role';
COMMENT ON COLUMN public.business_info.playbooks_owned IS 'Array of playbooks owned by this user';
COMMENT ON COLUMN public.business_info.department IS 'Department the user belongs to'; 