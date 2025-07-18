-- Add team_id to business_info to scope users to a team.
ALTER TABLE public.business_info ADD COLUMN team_id uuid;

-- Add permissions column to business_info to store user-specific permissions.
ALTER TABLE public.business_info ADD COLUMN permissions jsonb;
 
-- Update existing admins to be on their own team.
-- This makes their user_id the team_id for their team.
UPDATE public.business_info
SET team_id = user_id
WHERE role = 'admin' AND team_id IS NULL; 