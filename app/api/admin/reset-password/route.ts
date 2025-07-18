import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if the current user is a superadmin
    const { data: currentUserProfile, error: profileError } = await supabase
      .from('business_info')
      .select('role')
      .eq('user_id', currentUser.id)
      .single();
    
    if (profileError || !currentUserProfile || currentUserProfile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only superadmins can reset passwords' },
        { status: 403 }
      );
    }
    
    // Get the request body
    const { userId, newPassword } = await request.json();
    
    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'User ID and new password are required' },
        { status: 400 }
      );
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }
    
    // Prevent superadmins from resetting their own password
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: 'You cannot reset your own password' },
        { status: 400 }
      );
    }
    
    // Create an admin client with service role key for password reset
    const adminClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Update the user's password using the Admin API
    const { data, error } = await adminClient.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );
    
    if (error) {
      console.error('Error resetting password:', error);
      return NextResponse.json(
        { error: 'Failed to reset password: ' + error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 