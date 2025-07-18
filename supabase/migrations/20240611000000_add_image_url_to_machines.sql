-- Add image_url column to the machines table
ALTER TABLE public.machines
ADD COLUMN image_url text NULL;

-- Backfill existing null values
UPDATE public.machines
SET image_url = NULL
WHERE image_url IS NULL; 