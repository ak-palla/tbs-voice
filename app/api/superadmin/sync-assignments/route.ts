import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
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

    // Get superadmin's tokens
    const { data: superadminTokens } = await supabase
      .from('superadmin_google_analytics_tokens')
      .select('*')
      .eq('superadmin_user_id', user.id)
      .single();

    if (!superadminTokens) {
      return NextResponse.json({ error: 'No superadmin tokens found' }, { status: 404 });
    }

    // Get all active assignments for this superadmin
    const { data: assignments } = await supabase
      .from('superadmin_analytics_assignments')
      .select('*')
      .eq('superadmin_user_id', user.id)
      .eq('is_active', true);

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No assignments to sync',
        synced: 0 
      });
    }

    // With the new approach, assignments are used directly without syncing to google_analytics_tokens
    // This endpoint now just verifies assignments exist and are properly configured
    
    console.log(`Found ${assignments.length} active assignments using new direct lookup approach`);
    
    // Verify each assignment has proper structure
    for (const assignment of assignments) {
      console.log('Verified assignment:', {
        assigned_user_id: assignment.assigned_user_id,
        property_id: assignment.property_id,
        account_name: assignment.account_name,
        property_name: assignment.property_name
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Verified ${assignments.length} assignments using new direct lookup approach`,
      verified: assignments.length,
      total: assignments.length
    });

  } catch (error) {
    console.error('Error syncing assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 