-- Add display_name column to zapier_mappings table
ALTER TABLE public.zapier_mappings
ADD COLUMN display_name TEXT;
 
-- Optional: Add a default value or make it NOT NULL if desired
-- ALTER TABLE public.zapier_mappings ALTER COLUMN display_name SET NOT NULL; 
-- ALTER TABLE public.zapier_mappings ALTER COLUMN display_name SET DEFAULT ''; 