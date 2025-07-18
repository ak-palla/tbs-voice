-- Add image_urls column to the machines table
ALTER TABLE public.machines
ADD COLUMN image_urls text[] NULL;

-- Backfill existing data: if image_url exists, put it in image_urls array
UPDATE public.machines
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND image_urls IS NULL; 