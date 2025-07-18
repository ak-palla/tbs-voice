-- Improved remove points function that:
-- 1. Properly updates weekly/monthly points
-- 2. Keeps a record of point removals (negative points) for audit trail

DROP FUNCTION IF EXISTS remove_user_points;

CREATE OR REPLACE FUNCTION remove_user_points(
    p_user_id UUID,
    p_activity_type TEXT,
    p_activity_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    points_to_remove INTEGER;
    original_earned_at TIMESTAMP WITH TIME ZONE;
    current_date DATE := CURRENT_DATE;
BEGIN
    -- Get the points that were awarded for this activity and when
    SELECT points_earned, earned_at 
    INTO points_to_remove, original_earned_at
    FROM public.point_activities
    WHERE user_id = p_user_id 
    AND activity_type = p_activity_type 
    AND activity_id = p_activity_id
    AND points_earned > 0; -- Only look for positive point records
    
    -- If activity doesn't exist, nothing to remove
    IF points_to_remove IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Insert a NEGATIVE point record for audit trail
    -- This keeps history of both additions and removals
    INSERT INTO public.point_activities (
        user_id, 
        activity_type, 
        activity_id, 
        points_earned, 
        description,
        earned_at
    ) VALUES (
        p_user_id, 
        p_activity_type, 
        p_activity_id || '_removal_' || extract(epoch from now())::text, -- Make unique ID for removal
        -points_to_remove, -- NEGATIVE points
        'Points removed for undoing: ' || p_activity_type,
        NOW()
    );
    
    -- Update user points - subtract the points
    UPDATE public.user_points
    SET 
        total_points = GREATEST(0, total_points - points_to_remove),
        level = calculate_user_level(GREATEST(0, total_points - points_to_remove)),
        -- Update weekly points only if the original activity was this week
        weekly_points = CASE 
            WHEN EXTRACT(week FROM original_earned_at) = EXTRACT(week FROM current_date)
                 AND EXTRACT(year FROM original_earned_at) = EXTRACT(year FROM current_date)
            THEN GREATEST(0, weekly_points - points_to_remove)
            ELSE weekly_points
        END,
        -- Update monthly points only if the original activity was this month
        monthly_points = CASE 
            WHEN EXTRACT(month FROM original_earned_at) = EXTRACT(month FROM current_date)
                 AND EXTRACT(year FROM original_earned_at) = EXTRACT(year FROM current_date)
            THEN GREATEST(0, monthly_points - points_to_remove)
            ELSE monthly_points
        END,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create a view to see net points per activity (useful for debugging)
CREATE OR REPLACE VIEW public.user_activity_net_points AS
SELECT 
    user_id,
    activity_type,
    REPLACE(activity_id, '_removal_' || regexp_replace(activity_id, '.*_removal_', ''), '') as base_activity_id,
    SUM(points_earned) as net_points,
    COUNT(CASE WHEN points_earned > 0 THEN 1 END) as times_earned,
    COUNT(CASE WHEN points_earned < 0 THEN 1 END) as times_removed,
    MAX(earned_at) as last_activity_date
FROM public.point_activities
GROUP BY user_id, activity_type, base_activity_id
ORDER BY user_id, activity_type, base_activity_id;

-- Grant permissions
GRANT SELECT ON public.user_activity_net_points TO authenticated;

-- Function to recalculate weekly/monthly points (useful for fixing data)
CREATE OR REPLACE FUNCTION recalculate_user_periodic_points(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    week_total INTEGER;
    month_total INTEGER;
BEGIN
    -- Calculate this week's points
    SELECT COALESCE(SUM(points_earned), 0) 
    INTO week_total
    FROM public.point_activities
    WHERE user_id = p_user_id
    AND EXTRACT(week FROM earned_at) = EXTRACT(week FROM current_date)
    AND EXTRACT(year FROM earned_at) = EXTRACT(year FROM current_date);
    
    -- Calculate this month's points
    SELECT COALESCE(SUM(points_earned), 0) 
    INTO month_total
    FROM public.point_activities
    WHERE user_id = p_user_id
    AND EXTRACT(month FROM earned_at) = EXTRACT(month FROM current_date)
    AND EXTRACT(year FROM earned_at) = EXTRACT(year FROM current_date);
    
    -- Update user points
    UPDATE public.user_points
    SET 
        weekly_points = week_total,
        monthly_points = month_total,
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION recalculate_user_periodic_points TO authenticated; 