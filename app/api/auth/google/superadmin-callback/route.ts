import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/admin/users?error=no_code`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${requestUrl.origin}/api/auth/google/superadmin-callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokens = await tokenResponse.json();

    // Get user info to verify superadmin status
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(`${requestUrl.origin}/admin/users?error=unauthorized`);
    }

    // Verify user is superadmin
    const { data: profile } = await supabase
      .from('business_info')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      return NextResponse.redirect(`${requestUrl.origin}/admin/users?error=not_superadmin`);
    }

    // Store tokens in superadmin_google_analytics_tokens table
    const { error: tokenError } = await supabase
      .from('superadmin_google_analytics_tokens')
      .upsert({
        superadmin_user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type || 'Bearer',
        expires_at: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString(),
        scope: tokens.scope,
      });

    if (tokenError) {
      console.error('Error storing tokens:', tokenError);
      return NextResponse.redirect(`${requestUrl.origin}/admin/users?error=token_storage_failed`);
    }

    // Redirect back to users page with success
    return NextResponse.redirect(`${requestUrl.origin}/admin/users?analytics_connected=true`);

  } catch (error) {
    console.error('Error in superadmin OAuth callback:', error);
    return NextResponse.redirect(`${requestUrl.origin}/admin/users?error=oauth_failed`);
  }
} 