import { createClient } from '@/utils/supabase/server';

export interface GoogleAnalyticsRawData {
  connected: boolean;
  accountName?: string;
  propertyId?: string;
  rawData?: any;
  error?: string;
}

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

export async function fetchGoogleAnalyticsRawData(userId: string): Promise<GoogleAnalyticsRawData> {
  try {
    const supabase = await createClient();
    
    // Get user's Google Analytics tokens
    const { data: tokenData, error } = await supabase
      .from('google_analytics_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !tokenData) {
      return {
        connected: false,
        error: 'No Google Analytics connection found'
      };
    }
    
    let { access_token, refresh_token, expires_at, account_name, property_id } = tokenData;
    
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
          .eq('user_id', userId);
        
        if (updateError) {
          console.error('Failed to update refreshed tokens:', updateError);
        } else {
          console.log('Tokens refreshed successfully');
        }
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return {
          connected: false,
          error: 'Authentication expired. Please reconnect your Google Analytics account.'
        };
      }
    }
    
    // Fetch Google Analytics accounts first
    const accountsResponse = await fetch('https://analyticsadmin.googleapis.com/v1beta/accounts', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!accountsResponse.ok) {
      return {
        connected: true,
        accountName: account_name,
        error: `Failed to fetch accounts: ${accountsResponse.status} ${accountsResponse.statusText}`,
        rawData: {
          tokenExists: true,
          accessTokenExists: !!access_token,
          responseStatus: accountsResponse.status,
          responseText: await accountsResponse.text()
        }
      };
    }
    
    const accountsData = await accountsResponse.json();
    
    // Fetch properties for the first account
    let propertiesData = null;
    if (accountsData.accounts && accountsData.accounts.length > 0) {
      const firstAccount = accountsData.accounts[0];
      const propertiesResponse = await fetch(`https://analyticsadmin.googleapis.com/v1beta/${firstAccount.name}/properties`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (propertiesResponse.ok) {
        propertiesData = await propertiesResponse.json();
      }
    }
    
    return {
      connected: true,
      accountName: account_name,
      propertyId: property_id || 'not_set',
      rawData: {
        tokenInfo: {
          hasAccessToken: !!access_token,
          accountName: account_name,
          propertyId: property_id
        },
        accounts: accountsData,
        properties: propertiesData,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('Error fetching Google Analytics data:', error);
    return {
      connected: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
} 