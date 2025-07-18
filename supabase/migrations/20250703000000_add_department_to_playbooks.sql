-- Add department_id to playbooks table

ALTER TABLE public.playbooks
ADD COLUMN IF NOT EXISTS department_id uuid,
ADD CONSTRAINT playbooks_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.playbooks.department_id IS 'Foreign key to the departments table, allowing playbooks to be associated with a department.'; 