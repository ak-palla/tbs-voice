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

    // Get superadmin tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('superadmin_google_analytics_tokens')
      .select('*')
      .eq('superadmin_user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'No Google Analytics connection found' }, { status: 404 });
    }

    // Check if token is expired and refresh if needed
    let accessToken = tokenData.access_token;
    if (tokenData.expires_at && new Date(tokenData.expires_at) <= new Date()) {
      if (!tokenData.refresh_token) {
        return NextResponse.json({ error: 'Token expired and no refresh token available' }, { status: 401 });
      }

      // Refresh token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        return NextResponse.json({ error: 'Failed to refresh token' }, { status: 401 });
      }

      const newTokens = await refreshResponse.json();
      accessToken = newTokens.access_token;

      // Update stored tokens
      await supabase
        .from('superadmin_google_analytics_tokens')
        .update({
          access_token: newTokens.access_token,
          expires_at: new Date(Date.now() + (newTokens.expires_in * 1000)).toISOString(),
        })
        .eq('superadmin_user_id', user.id);

      // Also update all shared token entries for assigned users
      await supabase
        .from('google_analytics_tokens')
        .update({
          access_token: newTokens.access_token,
          expires_at: new Date(Date.now() + (newTokens.expires_in * 1000)).toISOString(),
        })
        .eq('connection_type', 'shared');
    }

    // Fetch Google Analytics accounts
    const accountsResponse = await fetch(
      'https://analyticsadmin.googleapis.com/v1beta/accounts',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!accountsResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch Google Analytics accounts' }, { status: 500 });
    }

    const accountsData = await accountsResponse.json();
    const accounts = accountsData.accounts || [];
    console.log('Fetched accounts from Google Analytics API:', accounts.length);

    // Fetch properties for each account using the working method
    const accountsWithProperties = await Promise.all(
      accounts.map(async (account: any) => {
        try {
          console.log(`Fetching properties for account: ${account.name} (${account.displayName})`);
          
          // Extract account ID from account name (e.g., "accounts/123456789" -> "123456789")
          const accountId = account.name.split('/').pop();
          
          // Use the same working approach as analytics-properties endpoint
          const propertiesResponse = await fetch(
            `https://analyticsadmin.googleapis.com/v1beta/properties?filter=parent:accounts/${accountId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (propertiesResponse.ok) {
            const propertiesData = await propertiesResponse.json();
            console.log(`Properties for ${account.name} (ID: ${accountId}):`, propertiesData.properties?.length || 0, 'properties');
            return {
              ...account,
              properties: propertiesData.properties || [],
            };
          } else {
            const errorText = await propertiesResponse.text();
            console.error(`Failed to fetch properties for ${account.name}:`, {
              status: propertiesResponse.status,
              statusText: propertiesResponse.statusText,
              accountId,
              errorText
            });
            return {
              ...account,
              properties: [],
            };
          }
        } catch (error) {
          console.error(`Error fetching properties for account ${account.name}:`, error);
          return {
            ...account,
            properties: [],
          };
        }
      })
    );

    console.log('Final accounts with properties:', accountsWithProperties.map(acc => ({ 
      name: acc.name, 
      displayName: acc.displayName, 
      propertiesCount: acc.properties?.length || 0 
    })));

    return NextResponse.json({ accounts: accountsWithProperties });

  } catch (error) {
    console.error('Error fetching analytics properties:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 