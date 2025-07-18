-- Create gamification system for TBS platform
-- This enables leaderboards, points, and achievement tracking

-- =====================================================
-- USER POINTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    weekly_points INTEGER DEFAULT 0,
    monthly_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per user
    UNIQUE(user_id)
);

-- =====================================================
-- POINT ACTIVITIES TABLE 
-- =====================================================
CREATE TABLE IF NOT EXISTS public.point_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'timeline_completion', 'scorecard_green', 'battle_plan_section', etc.
    activity_id TEXT NOT NULL, -- Reference to the specific item that earned points
    points_earned INTEGER NOT NULL,
    description TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate point awards for same activity
    UNIQUE(user_id, activity_type, activity_id)
);

-- =====================================================
-- LEADERBOARD VIEW
-- =====================================================
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
    up.user_id,
    bi.full_name,
    bi.business_name,
    bi.profile_picture_url,
    up.total_points,
    up.level,
    up.weekly_points,
    up.monthly_points,
    up.current_streak,
    up.longest_streak,
    ROW_NUMBER() OVER (ORDER BY up.total_points DESC) as rank,
    up.last_activity_date
FROM public.user_points up
LEFT JOIN public.business_info bi ON up.user_id = bi.user_id
WHERE up.total_points > 0
ORDER BY up.total_points DESC;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to calculate user level based on points
CREATE OR REPLACE FUNCTION calculate_user_level(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Level system: 1000 points per level
    RETURN GREATEST(1, (points / 1000) + 1);
END;
$$ LANGUAGE plpgsql;

-- Function to add points to user
CREATE OR REPLACE FUNCTION add_user_points(
    p_user_id UUID,
    p_activity_type TEXT,
    p_activity_id TEXT,
    p_points INTEGER,
    p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    existing_activity_count INTEGER;
    current_date DATE := CURRENT_DATE;
BEGIN
    -- Check if this activity has already been awarded points
    SELECT COUNT(*)
    INTO existing_activity_count
    FROM public.point_activities
    WHERE user_id = p_user_id 
    AND activity_type = p_activity_type 
    AND activity_id = p_activity_id;
    
    -- If activity already exists, don't award points again
    IF existing_activity_count > 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Insert the activity record
    INSERT INTO public.point_activities (
        user_id, activity_type, activity_id, points_earned, description
    ) VALUES (
        p_user_id, p_activity_type, p_activity_id, p_points, p_description
    );
    
    -- Update or insert user points record
    INSERT INTO public.user_points (
        user_id, 
        total_points, 
        level,
        weekly_points, 
        monthly_points,
        current_streak,
        longest_streak,
        last_activity_date
    ) VALUES (
        p_user_id, 
        p_points, 
        calculate_user_level(p_points),
        p_points,
        p_points,
        1,
        1,
        current_date
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_points = user_points.total_points + p_points,
        level = calculate_user_level(user_points.total_points + p_points),
        weekly_points = CASE 
            WHEN EXTRACT(week FROM user_points.last_activity_date) = EXTRACT(week FROM current_date)
            THEN user_points.weekly_points + p_points
            ELSE p_points
        END,
        monthly_points = CASE 
            WHEN EXTRACT(month FROM user_points.last_activity_date) = EXTRACT(month FROM current_date)
            THEN user_points.monthly_points + p_points
            ELSE p_points
        END,
        current_streak = CASE
            WHEN user_points.last_activity_date = current_date - INTERVAL '1 day'
            THEN user_points.current_streak + 1
            WHEN user_points.last_activity_date = current_date
            THEN user_points.current_streak
            ELSE 1
        END,
        longest_streak = GREATEST(
            user_points.longest_streak,
            CASE
                WHEN user_points.last_activity_date = current_date - INTERVAL '1 day'
                THEN user_points.current_streak + 1
                WHEN user_points.last_activity_date = current_date
                THEN user_points.current_streak
                ELSE 1
            END
        ),
        last_activity_date = current_date,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS & INDEXES
-- =====================================================

-- Index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON public.user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_weekly ON public.user_points(weekly_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_point_activities_user_id ON public.point_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_point_activities_type_id ON public.point_activities(activity_type, activity_id);

-- Update trigger for user_points
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_points_updated_at
    BEFORE UPDATE ON public.user_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_activities ENABLE ROW LEVEL SECURITY;

-- User points policies
CREATE POLICY "Users can view their own points" ON public.user_points
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points" ON public.user_points
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own points" ON public.user_points
    FOR UPDATE USING (auth.uid() = user_id);

-- Point activities policies  
CREATE POLICY "Users can view their own activities" ON public.point_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON public.point_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leaderboard view is publicly readable (for all authenticated users)
CREATE POLICY "Anyone can view leaderboard" ON public.user_points
    FOR SELECT USING (true); 