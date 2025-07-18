-- Fix the unique constraint issue that prevents multiple inactive assignments
-- The table-level UNIQUE constraint is too restrictive

-- Drop the problematic table-level unique constraint
ALTER TABLE superadmin_analytics_assignments 
DROP CONSTRAINT IF EXISTS superadmin_analytics_assignments_assigned_user_id_is_active_key;

-- The partial unique index (idx_unique_active_assignment) that only applies 
-- when is_active = true is sufficient and already exists from the previous migration 