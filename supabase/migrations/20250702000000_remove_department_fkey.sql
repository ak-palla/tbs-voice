-- Remove the foreign key constraint on the departments table
-- This allows for a "global" team_id (e.g., the nil UUID) that doesn't correspond to a real user,
-- enabling shared departments across the application.

ALTER TABLE public.departments
DROP CONSTRAINT IF EXISTS departments_team_id_fkey; 