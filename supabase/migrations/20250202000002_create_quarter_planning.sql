-- Create quarter_planning table for 12q-planner feature
CREATE TABLE quarter_planning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  
  -- Starting point (Y1)
  y1_sales NUMERIC(15, 2),
  y1_profit NUMERIC(15, 2),
  
  -- 3-year target
  target_sales NUMERIC(15, 2),
  target_profit NUMERIC(15, 2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  
  CONSTRAINT quarter_planning_team_unique UNIQUE (team_id)
);

-- Create quarter_actual_data table for storing actual values per quarter
CREATE TABLE quarter_actual_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quarter_planning_id UUID REFERENCES quarter_planning(id) ON DELETE CASCADE,
  quarter VARCHAR(10) NOT NULL, -- Format: Q1, Q2, etc.
  actual_sales NUMERIC(15, 2),
  actual_profit NUMERIC(15, 2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  
  CONSTRAINT quarter_actual_unique UNIQUE (quarter_planning_id, quarter)
);



-- Create updated_at trigger function if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $trigger$
    BEGIN
      NEW.updated_at = timezone('utc', now());
      RETURN NEW;
    END;
    $trigger$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Create triggers for updated_at
CREATE TRIGGER set_quarter_planning_updated_at
  BEFORE UPDATE ON quarter_planning
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_quarter_actual_data_updated_at
  BEFORE UPDATE ON quarter_actual_data
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at(); 