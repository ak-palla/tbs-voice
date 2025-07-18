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

    const body = await request.json();
    const { assigned_user_id, property_id, property_name, account_name } = body;

    if (!assigned_user_id || !property_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Deactivate any existing assignments for this user
    await supabase
      .from('superadmin_analytics_assignments')
      .update({ is_active: false })
      .eq('assigned_user_id', assigned_user_id)
      .eq('is_active', true);

    // Create new assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('superadmin_analytics_assignments')
      .insert({
        superadmin_user_id: user.id,
        assigned_user_id,
        property_id,
        property_name,
        account_name,
        is_active: true,
      })
      .select()
      .single();

    if (assignmentError) {
      console.error('Error creating assignment:', assignmentError);
      return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
    }

    // Verify superadmin has tokens available for assignments
    const { data: superadminTokens } = await supabase
      .from('superadmin_google_analytics_tokens')
      .select('access_token')
      .eq('superadmin_user_id', user.id)
      .single();

    if (!superadminTokens) {
      return NextResponse.json({ 
        error: 'Superadmin must connect Google Analytics first' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      assignment,
      message: 'Analytics property assigned successfully' 
    });

  } catch (error) {
    console.error('Error assigning analytics property:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const body = await request.json();
    const { assigned_user_id } = body;

    if (!assigned_user_id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // First, check if assignment exists
    const { data: existingAssignment } = await supabase
      .from('superadmin_analytics_assignments')
      .select('*')
      .eq('assigned_user_id', assigned_user_id)
      .eq('is_active', true)
      .single();

    if (!existingAssignment) {
      return NextResponse.json({ 
        error: 'Assignment not found or already removed' 
      }, { status: 404 });
    }

    // Deactivate assignment (RLS policy handles permissions)
    const { data: updatedAssignment, error: updateError } = await supabase
      .from('superadmin_analytics_assignments')
      .update({ is_active: false })
      .eq('assigned_user_id', assigned_user_id)
      .eq('is_active', true)
      .select();

    if (updateError) {
      console.error('Error removing assignment:', updateError);
      return NextResponse.json({ 
        error: `Failed to remove assignment: ${updateError.message}`,
        details: updateError
      }, { status: 500 });
    }

    if (!updatedAssignment || updatedAssignment.length === 0) {
      return NextResponse.json({ 
        error: 'No assignment was updated. Assignment may not exist or you may not have permission to remove it.' 
      }, { status: 404 });
    }

    // Note: User's own google_analytics_tokens entry (if any) remains intact

    return NextResponse.json({ 
      success: true,
      message: 'Analytics assignment removed successfully' 
    });

  } catch (error) {
    console.error('Error removing analytics assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    // Get all active assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from('superadmin_analytics_assignments')
      .select(`
        *
      `)
      .eq('superadmin_user_id', user.id)
      .eq('is_active', true);
    
    // If we have assignments, get the user details separately
    let enrichedAssignments = assignments || [];
    if (assignments && assignments.length > 0) {
      const userIds = assignments.map(a => a.assigned_user_id);
      const { data: userDetails } = await supabase
        .from('business_info')
        .select('user_id, full_name, business_name, email')
        .in('user_id', userIds);
      
      // Enrich assignments with user details
      enrichedAssignments = assignments.map(assignment => ({
        ...assignment,
        assigned_user: userDetails?.find(u => u.user_id === assignment.assigned_user_id) || null
      }));
    }

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
    }

    return NextResponse.json({ assignments: enrichedAssignments });

  } catch (error) {
    console.error('Error fetching analytics assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 