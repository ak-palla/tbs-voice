-- Add JSON columns to existing quarter_planning table for storing quarter data
-- This approach stores all 12 quarters of data in single JSON columns

-- Add columns to existing quarter_planning table
ALTER TABLE public.quarter_planning 
ADD COLUMN IF NOT EXISTS straight_line_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS actual_data jsonb DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.quarter_planning.straight_line_data IS 'Stores calculated straight line projections for all 12 quarters as JSON: {"Q1": {"sales": 100000, "profit": 20000, "margin": 20.0}, "Q2": {...}, ...}';
COMMENT ON COLUMN public.quarter_planning.actual_data IS 'Stores actual sales and profit values for all 12 quarters as JSON: {"Q1": {"sales": 95000, "profit": 18000, "margin": 18.9}, "Q2": {...}, ...}';

-- Create indexes for better JSON query performance
CREATE INDEX IF NOT EXISTS idx_quarter_planning_straight_line_data ON public.quarter_planning USING gin (straight_line_data);
CREATE INDEX IF NOT EXISTS idx_quarter_planning_actual_data ON public.quarter_planning USING gin (actual_data); 