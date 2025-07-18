-- Add sample_value column to zapier_mappings table
ALTER TABLE public.zapier_mappings
ADD COLUMN sample_value TEXT; 