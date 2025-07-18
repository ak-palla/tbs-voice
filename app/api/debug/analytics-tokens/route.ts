import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is superadmin
    const { data: profile } = await supabase
      .from('business_info')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all google_analytics_tokens entries
    const { data: tokens, error: tokensError } = await supabase
      .from('google_analytics_tokens')
      .select(`
        id,
        user_id,
        property_id,
        account_name,
        connection_type,
        created_at,
        updated_at,
        expires_at
      `)
      .order('created_at', { ascending: false });

    if (tokensError) {
      console.error('Error fetching tokens:', tokensError);
      return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
    }

    // Get all assignments for comparison
    const { data: assignments, error: assignmentsError } = await supabase
      .from('superadmin_analytics_assignments')
      .select(`
        id,
        assigned_user_id,
        property_id,
        property_name,
        account_name,
        is_active,
        assigned_at
      `)
      .eq('is_active', true)
      .order('assigned_at', { ascending: false });

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
    }

    // Get user info for better debugging
    const userIds = Array.from(new Set([
      ...tokens.map(t => t.user_id),
      ...assignments.map(a => a.assigned_user_id)
    ]));

    const { data: users, error: usersError } = await supabase
      .from('business_info')
      .select('user_id, full_name, business_name, email')
      .in('user_id', userIds);

    const userMap = (users || []).reduce((acc, user) => {
      acc[user.user_id] = user;
      return acc;
    }, {} as Record<string, any>);

    // Enrich data with user info
    const enrichedTokens = tokens.map(token => ({
      ...token,
      user_info: userMap[token.user_id] || { full_name: 'Unknown User', email: 'N/A' }
    }));

    const enrichedAssignments = assignments.map(assignment => ({
      ...assignment,
      user_info: userMap[assignment.assigned_user_id] || { full_name: 'Unknown User', email: 'N/A' },
      has_token: tokens.some(token => token.user_id === assignment.assigned_user_id)
    }));

    return NextResponse.json({
      summary: {
        total_tokens: tokens.length,
        total_assignments: assignments.length,
        shared_tokens: tokens.filter(t => t.connection_type === 'shared').length,
        own_tokens: tokens.filter(t => t.connection_type === 'own').length,
        assignments_without_tokens: assignments.filter(a => 
          !tokens.some(t => t.user_id === a.assigned_user_id)
        ).length
      },
      tokens: enrichedTokens,
      assignments: enrichedAssignments,
      orphaned_assignments: assignments.filter(a => 
        !tokens.some(t => t.user_id === a.assigned_user_id)
      ),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 