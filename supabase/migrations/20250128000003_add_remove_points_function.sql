-- Add function to remove points when actions are undone
-- This ensures points are properly deducted when users uncomplete activities

CREATE OR REPLACE FUNCTION remove_user_points(
    p_user_id UUID,
    p_activity_type TEXT,
    p_activity_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    points_to_remove INTEGER;
    current_date DATE := CURRENT_DATE;
BEGIN
    -- Get the points that were awarded for this activity
    SELECT points_earned INTO points_to_remove
    FROM public.point_activities
    WHERE user_id = p_user_id 
    AND activity_type = p_activity_type 
    AND activity_id = p_activity_id;
    
    -- If activity doesn't exist, nothing to remove
    IF points_to_remove IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Delete the activity record
    DELETE FROM public.point_activities
    WHERE user_id = p_user_id 
    AND activity_type = p_activity_type 
    AND activity_id = p_activity_id;
    
    -- Update user points - subtract the points
    UPDATE public.user_points
    SET 
        total_points = GREATEST(0, total_points - points_to_remove),
        level = calculate_user_level(GREATEST(0, total_points - points_to_remove)),
        weekly_points = CASE 
            WHEN EXTRACT(week FROM last_activity_date) = EXTRACT(week FROM current_date)
            THEN GREATEST(0, weekly_points - points_to_remove)
            ELSE weekly_points
        END,
        monthly_points = CASE 
            WHEN EXTRACT(month FROM last_activity_date) = EXTRACT(month FROM current_date)
            THEN GREATEST(0, monthly_points - points_to_remove)
            ELSE monthly_points
        END,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION remove_user_points TO authenticated; 