import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Parse state parameter first to get redirect info (for error handling)
    let redirectPath = '/new-dashboard';
    if (state) {
      if (state === 'google_analytics_connection') {
        redirectPath = '/new-dashboard';
      } else if (state.startsWith('new_dashboard_redirect=')) {
        const encodedPath = state.split('new_dashboard_redirect=')[1];
        redirectPath = decodeURIComponent(encodedPath);
      }
    }

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(`${request.nextUrl.origin}${redirectPath}?error=oauth_error`);
    }



    // Check if we have an authorization code
    if (!code) {
      return NextResponse.redirect(`${request.nextUrl.origin}${redirectPath}?error=no_code`);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${request.nextUrl.origin}/api/auth/google/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(`${request.nextUrl.origin}${redirectPath}?error=token_exchange_failed`);
    }

    const tokens = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('Failed to get user info:', await userInfoResponse.text());
      return NextResponse.redirect(`${request.nextUrl.origin}${redirectPath}?error=user_info_failed`);
    }

    const userInfo = await userInfoResponse.json();

    // Get current user from Supabase
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('User not authenticated:', userError);
      return NextResponse.redirect(`${request.nextUrl.origin}/sign-in?error=not_authenticated`);
    }

    // Store tokens in database
    const expiresAt = tokens.expires_in 
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    const { error: insertError } = await supabase
      .from('google_analytics_tokens')
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        scope: tokens.scope,
        token_type: tokens.token_type || 'Bearer',
        account_name: userInfo.email,
      });

    if (insertError) {
      console.error('Failed to store tokens:', insertError);
      return NextResponse.redirect(`${request.nextUrl.origin}${redirectPath}?error=storage_failed`);
    }

    // Redirect back to dashboard with success and trigger modal
    const redirectUrl = `${request.nextUrl.origin}${redirectPath}?connected=true&success=oauth_complete`;
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('OAuth callback error:', error);
    // Fallback redirect path in case of unexpected errors
    return NextResponse.redirect(`${request.nextUrl.origin}/new-dashboard?error=unknown_error`);
  }
} 