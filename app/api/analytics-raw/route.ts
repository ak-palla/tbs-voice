import { NextRequest, NextResponse } from 'next/server';
import { fetchGoogleAnalyticsRawData } from '@/lib/google-analytics-simple';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const rawData = await fetchGoogleAnalyticsRawData(user.id);
    
    return NextResponse.json(rawData);
  } catch (error) {
    console.error('Raw Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 