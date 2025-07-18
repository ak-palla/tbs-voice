-- Add metric_type field and update company_scorecards table structure
-- This migration aligns the database with the updated frontend implementation

-- First, add the new metric_type column
ALTER TABLE public.company_scorecards 
ADD COLUMN IF NOT EXISTS metric_type text DEFAULT 'Numeric Count';

-- Add foreign key columns if they don't exist
ALTER TABLE public.company_scorecards 
ADD COLUMN IF NOT EXISTS department_id uuid,
ADD COLUMN IF NOT EXISTS metricowner_id uuid,
ADD COLUMN IF NOT EXISTS department_old text,
ADD COLUMN IF NOT EXISTS metricowner_old text;

-- Convert week and monthly fields to numeric types (if they're currently text)
-- We'll do this safely by adding new columns, copying data, then swapping

-- Add temporary numeric columns
ALTER TABLE public.company_scorecards 
ADD COLUMN IF NOT EXISTS week1_new numeric,
ADD COLUMN IF NOT EXISTS week2_new numeric,
ADD COLUMN IF NOT EXISTS week3_new numeric,
ADD COLUMN IF NOT EXISTS week4_new numeric,
ADD COLUMN IF NOT EXISTS remainder_new numeric,
ADD COLUMN IF NOT EXISTS monthlyactual_new numeric,
ADD COLUMN IF NOT EXISTS monthlytarget_new numeric;

-- Copy numeric data from text fields where possible
UPDATE public.company_scorecards 
SET 
    week1_new = CASE 
        WHEN week1 ~ '^[0-9]+\.?[0-9]*$' THEN week1::numeric 
        ELSE NULL 
    END,
    week2_new = CASE 
        WHEN week2 ~ '^[0-9]+\.?[0-9]*$' THEN week2::numeric 
        ELSE NULL 
    END,
    week3_new = CASE 
        WHEN week3 ~ '^[0-9]+\.?[0-9]*$' THEN week3::numeric 
        ELSE NULL 
    END,
    week4_new = CASE 
        WHEN week4 ~ '^[0-9]+\.?[0-9]*$' THEN week4::numeric 
        ELSE NULL 
    END,
    remainder_new = CASE 
        WHEN remainder ~ '^[0-9]+\.?[0-9]*$' THEN remainder::numeric 
        ELSE NULL 
    END,
    monthlyactual_new = CASE 
        WHEN monthlyactual ~ '^[0-9]+\.?[0-9]*$' THEN monthlyactual::numeric 
        ELSE NULL 
    END,
    monthlytarget_new = CASE 
        WHEN monthlytarget ~ '^[0-9]+\.?[0-9]*$' THEN monthlytarget::numeric 
        ELSE NULL 
    END;

-- Drop old text columns and rename new ones
ALTER TABLE public.company_scorecards 
DROP COLUMN IF EXISTS week1,
DROP COLUMN IF EXISTS week2,
DROP COLUMN IF EXISTS week3,
DROP COLUMN IF EXISTS week4,
DROP COLUMN IF EXISTS remainder,
DROP COLUMN IF EXISTS monthlyactual,
DROP COLUMN IF EXISTS monthlytarget;

ALTER TABLE public.company_scorecards 
RENAME COLUMN week1_new TO week1;
ALTER TABLE public.company_scorecards 
RENAME COLUMN week2_new TO week2;
ALTER TABLE public.company_scorecards 
RENAME COLUMN week3_new TO week3;
ALTER TABLE public.company_scorecards 
RENAME COLUMN week4_new TO week4;
ALTER TABLE public.company_scorecards 
RENAME COLUMN remainder_new TO remainder;
ALTER TABLE public.company_scorecards 
RENAME COLUMN monthlyactual_new TO monthlyactual;
ALTER TABLE public.company_scorecards 
RENAME COLUMN monthlytarget_new TO monthlytarget;

-- Add foreign key constraints if the referenced tables exist
DO $$
BEGIN
    -- Add department foreign key if departments table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'departments' AND table_schema = 'public') THEN
        ALTER TABLE public.company_scorecards 
        ADD CONSTRAINT company_scorecards_department_id_fkey 
        FOREIGN KEY (department_id) REFERENCES public.departments(id);
    END IF;
    
    -- Add team member foreign key if team_directory table exists  
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_directory' AND table_schema = 'public') THEN
        ALTER TABLE public.company_scorecards 
        ADD CONSTRAINT company_scorecards_metricowner_id_fkey 
        FOREIGN KEY (metricowner_id) REFERENCES public.team_directory(id);
    END IF;
END $$;

-- Add constraint for metric_type values
ALTER TABLE public.company_scorecards 
ADD CONSTRAINT company_scorecards_metric_type_check 
CHECK (metric_type IN ('Numeric Count', 'Currency / Revenue', 'Percentages', 'Time-Based Metrics', 'Yes/No or Binary'));

-- Update RLS policies if they exist
DO $$
BEGIN
    -- Enable RLS if not already enabled
    ALTER TABLE public.company_scorecards ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist and recreate them
    DROP POLICY IF EXISTS "Users can view their own company scorecards" ON public.company_scorecards;
    DROP POLICY IF EXISTS "Users can create their own company scorecards" ON public.company_scorecards;
    DROP POLICY IF EXISTS "Users can update their own company scorecards" ON public.company_scorecards;
    DROP POLICY IF EXISTS "Users can delete their own company scorecards" ON public.company_scorecards;
    
    -- Create RLS policies
    CREATE POLICY "Users can view their own company scorecards" 
    ON public.company_scorecards FOR SELECT 
    USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can create their own company scorecards" 
    ON public.company_scorecards FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own company scorecards" 
    ON public.company_scorecards FOR UPDATE 
    USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own company scorecards" 
    ON public.company_scorecards FOR DELETE 
    USING (auth.uid() = user_id);
END $$; 