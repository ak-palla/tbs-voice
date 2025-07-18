-- Add google_review_link column to business_info table
ALTER TABLE business_info 
ADD COLUMN IF NOT EXISTS google_review_link TEXT; 