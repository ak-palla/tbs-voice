import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountName = searchParams.get('account');
    
    if (!accountName) {
      return NextResponse.json(
        { error: 'Account name is required' },
        { status: 400 }
      );
    }

    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get user's Google Analytics tokens
    const { data: tokenData, error } = await supabase
      .from('google_analytics_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error || !tokenData) {
      return NextResponse.json(
        { error: 'No Google Analytics connection found' },
        { status: 404 }
      );
    }

    let { access_token, refresh_token, expires_at } = tokenData;

    // Check if access token is expired and refresh if needed
    const now = new Date();
    const expiresAt = expires_at ? new Date(expires_at) : null;
    
    if (expiresAt && now >= expiresAt && refresh_token) {
      try {
        console.log('Access token expired, refreshing...');
        const refreshedTokens = await refreshAccessToken(refresh_token);
        
        // Update the access token
        access_token = refreshedTokens.access_token;
        
        // Calculate new expiration time
        const newExpiresAt = refreshedTokens.expires_in 
          ? new Date(Date.now() + refreshedTokens.expires_in * 1000).toISOString()
          : null;
        
        // Update tokens in database
        const { error: updateError } = await supabase
          .from('google_analytics_tokens')
          .update({
            access_token: access_token,
            expires_at: newExpiresAt,
            // Update refresh token if a new one was provided
            ...(refreshedTokens.refresh_token && { refresh_token: refreshedTokens.refresh_token })
          })
          .eq('user_id', user.id);
        
        if (updateError) {
          console.error('Failed to update refreshed tokens:', updateError);
        } else {
          console.log('Tokens refreshed successfully');
        }
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return NextResponse.json(
          { error: 'Authentication expired. Please reconnect your Google Analytics account.' },
          { status: 401 }
        );
      }
    }

    // Extract account ID from account name (e.g., "accounts/123456789" -> "123456789")
    const accountId = accountName.split('/').pop();
    
    // Fetch properties for the specified account using the correct endpoint
    const propertiesResponse = await fetch(`https://analyticsadmin.googleapis.com/v1beta/properties?filter=parent:accounts/${accountId}`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!propertiesResponse.ok) {
      const errorText = await propertiesResponse.text();
      console.error('Properties API Error:', {
        status: propertiesResponse.status,
        statusText: propertiesResponse.statusText,
        accountName,
        accountId,
        url: `https://analyticsadmin.googleapis.com/v1beta/properties?filter=parent:accounts/${accountId}`,
        errorText
      });
      
      return NextResponse.json({
        error: `Failed to fetch properties: ${propertiesResponse.status} ${propertiesResponse.statusText}`,
        details: errorText,
        accountName,
        accountId,
        endpoint: `https://analyticsadmin.googleapis.com/v1beta/properties?filter=parent:accounts/${accountId}`,
        properties: []
      });
    }
    
    const propertiesData = await propertiesResponse.json();
    
    return NextResponse.json({
      account: accountName,
      properties: propertiesData.properties || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Properties API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties data' },
      { status: 500 }
    );
  }
} 