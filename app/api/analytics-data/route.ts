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
    const startDate = searchParams.get('startDate') || '30daysAgo';
    const endDate = searchParams.get('endDate') || 'today';
    
    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // First priority: Check if user has their own Google Analytics connection
    const { data: userTokens } = await supabase
      .from('google_analytics_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let tokenData = null;
    let dataSource = 'user';
    let assignmentDetails = null;

    if (userTokens) {
      // User has their own connection - use it
      tokenData = userTokens;
      dataSource = 'user';
    } else {
      // No user connection - check for assignments
      let assignment = null;
      
      // First check for direct assignment to this user
      const { data: directAssignment } = await supabase
        .from('superadmin_analytics_assignments')
        .select('*')
        .eq('assigned_user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (directAssignment) {
        assignment = directAssignment;
      } else {
        // If no direct assignment, check if user is part of a team with an assigned admin
        const { data: userProfile } = await supabase
          .from('business_info')
          .select('team_id, role')
          .eq('user_id', user.id)
          .single();

        if (userProfile?.team_id) {
          // Find the admin of this team
          const { data: teamAdmin } = await supabase
            .from('business_info')
            .select('user_id')
            .eq('team_id', userProfile.team_id)
            .eq('role', 'admin')
            .maybeSingle();

          if (teamAdmin) {
            // Check if team admin has an assignment
            const { data: teamAssignment } = await supabase
              .from('superadmin_analytics_assignments')
              .select('*')
              .eq('assigned_user_id', teamAdmin.user_id)
              .eq('is_active', true)
              .maybeSingle();

                         if (teamAssignment) {
               assignment = teamAssignment;
               dataSource = 'team_admin';
               // Get the admin's business info for company name
               const { data: adminBusinessInfo } = await supabase
                 .from('business_info')
                 .select('business_name')
                 .eq('user_id', teamAdmin.user_id)
                 .single();
               
               assignmentDetails = {
                 property_name: teamAssignment.property_name,
                 account_name: teamAssignment.account_name,
                 company_name: adminBusinessInfo?.business_name || ''
               };
             }
          }
        }
      }

      if (assignment) {
        // Get superadmin's tokens
        const { data: superadminTokens } = await supabase
          .from('superadmin_google_analytics_tokens')
          .select('*')
          .eq('superadmin_user_id', assignment.superadmin_user_id)
          .single();

        if (superadminTokens) {
          tokenData = {
            ...superadminTokens,
            property_id: assignment.property_id.includes('/') 
              ? assignment.property_id.split('/').pop() 
              : assignment.property_id
          };
          if (dataSource !== 'team_admin') {
            dataSource = 'superadmin';
          }
          assignmentDetails = {
            property_name: assignment.property_name,
            account_name: assignment.account_name
          };
        }
      }
    }

    if (!tokenData) {
      return NextResponse.json(
        { error: 'No Google Analytics connection found' },
        { status: 404 }
      );
    }

    let { access_token, refresh_token, expires_at, property_id } = tokenData;
    
    if (!property_id) {
      return NextResponse.json(
        { error: 'No property ID configured' },
        { status: 400 }
      );
    }

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
        
        // Update tokens in the appropriate database table
        if (dataSource === 'user') {
          // Update user's own tokens
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
            console.error('Failed to update user tokens:', updateError);
          } else {
            console.log('User tokens refreshed successfully');
          }
        } else {
          // Update superadmin tokens (this will affect all assigned users)
          const { data: assignment } = await supabase
            .from('superadmin_analytics_assignments')
            .select('superadmin_user_id')
            .eq('assigned_user_id', user.id)
            .eq('is_active', true)
            .single();

          if (assignment) {
            const { error: updateError } = await supabase
              .from('superadmin_google_analytics_tokens')
              .update({
                access_token: access_token,
                expires_at: newExpiresAt,
                // Update refresh token if a new one was provided
                ...(refreshedTokens.refresh_token && { refresh_token: refreshedTokens.refresh_token })
              })
              .eq('superadmin_user_id', assignment.superadmin_user_id);
            
            if (updateError) {
              console.error('Failed to update superadmin tokens:', updateError);
            } else {
              console.log('Superadmin tokens refreshed successfully');
            }
          }
        }
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return NextResponse.json(
          { error: 'Authentication expired. Please reconnect your Google Analytics account.' },
          { status: 401 }
        );
      }
    }

    // Extract property ID number from the full property ID (e.g., "properties/123456789" -> "123456789")
    const propertyIdNumber = property_id.includes('/') ? property_id.split('/').pop() : property_id;

    // Fetch main metrics data (daily breakdown)
    const mainReportResponse = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyIdNumber}:runReport`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'newUsers' },
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'sessionsPerUser' }
        ],
        orderBys: [{ dimension: { dimensionName: 'date' } }]
      }),
    });

    if (!mainReportResponse.ok) {
      const errorText = await mainReportResponse.text();
      console.error('Main report API Error:', {
        status: mainReportResponse.status,
        statusText: mainReportResponse.statusText,
        errorText,
        propertyId: propertyIdNumber
      });
      
      return NextResponse.json({
        error: `Failed to fetch main report: ${mainReportResponse.status} ${mainReportResponse.statusText}`,
        details: errorText
      }, { status: mainReportResponse.status });
    }

    // Fetch device data
    const deviceDataResponse = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyIdNumber}:runReport`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
      }),
    });

    if (!deviceDataResponse.ok) {
      const errorText = await deviceDataResponse.text();
      console.error('Device data API Error:', {
        status: deviceDataResponse.status,
        statusText: deviceDataResponse.statusText,
        errorText
      });
    }

    const mainReportData = await mainReportResponse.json();
    const deviceData = deviceDataResponse.ok ? await deviceDataResponse.json() : { rows: [] };

    // Return the data in the format expected by the component
    return NextResponse.json({
      mainReport: mainReportData,
      deviceData: deviceData,
      metadata: {
        propertyId: propertyIdNumber,
        dateRange: { startDate, endDate },
        timestamp: new Date().toISOString(),
        dataSource, // 'user' or 'superadmin'
        ...(dataSource === 'superadmin' && assignmentDetails && {
          assignmentDetails
        })
      }
    });

  } catch (error) {
    console.error('Analytics data API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 