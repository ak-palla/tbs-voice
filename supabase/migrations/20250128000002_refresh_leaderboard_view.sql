-- Refresh leaderboard view to fix schema cache issues
-- Drop and recreate the view to ensure proper schema recognition

-- Drop the existing view
DROP VIEW IF EXISTS public.leaderboard_view;

-- Recreate the leaderboard view with explicit schema references
CREATE VIEW public.leaderboard_view AS
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

-- Grant SELECT permissions on the view to authenticated users
GRANT SELECT ON public.leaderboard_view TO authenticated;

-- Refresh schema cache by updating table comments (this forces PostgREST to reload)
COMMENT ON TABLE public.user_points IS 'User gamification points and levels - updated';
COMMENT ON TABLE public.business_info IS 'Business information and profiles - updated';
COMMENT ON VIEW public.leaderboard_view IS 'Leaderboard rankings view - refreshed'; 