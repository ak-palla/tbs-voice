import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Helper function to get user ID from request
async function getUserId(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id; 
  } catch (error) {
    console.error("Error getting user session:", error);
    return null;
  }
}

// GET - Fetch training data for ML purposes
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const archiveReason = searchParams.get('archiveReason');
    const userId = searchParams.get('userId'); // For admin access
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // For now, require authentication but could be modified for admin access
    const requestUserId = await getUserId(req);
    if (!requestUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    if (action === 'export_all') {
      // Export all training data (admin function)
      console.log('🔄 [Training API] Exporting all training data');
      
      let query = supabase
        .from('innovation_chat_training_data')
        .select('*')
        .order('archived_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (archiveReason) {
        query = query.eq('archive_reason', archiveReason);
      }
      
      if (startDate) {
        query = query.gte('archived_at', startDate);
      }
      
      if (endDate) {
        query = query.lte('archived_at', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [Training API] Error fetching training data:', error);
        return NextResponse.json({ error: "Failed to fetch training data" }, { status: 500 });
      }

      return NextResponse.json({
        type: 'training_data_export',
        data: data || [],
        count: data?.length || 0,
        offset,
        limit
      });
    }

    if (action === 'stats') {
      // Get training data statistics
      console.log('🔄 [Training API] Fetching training data statistics');
      
      const { data: stats, error } = await supabase
        .from('innovation_chat_training_data')
        .select('archive_reason, archived_at, session_metadata')
        .order('archived_at', { ascending: false });

      if (error) {
        console.error('❌ [Training API] Error fetching training stats:', error);
        return NextResponse.json({ error: "Failed to fetch training statistics" }, { status: 500 });
      }

      // Calculate statistics
      const totalSessions = stats?.length || 0;
      const reasonBreakdown = stats?.reduce((acc: any, item: any) => {
        acc[item.archive_reason] = (acc[item.archive_reason] || 0) + 1;
        return acc;
      }, {});

      const totalMessages = stats?.reduce((acc: number, item: any) => {
        return acc + (item.session_metadata?.message_count || 0);
      }, 0) || 0;

      return NextResponse.json({
        type: 'training_stats',
        totalSessions,
        totalMessages,
        reasonBreakdown,
        dateRange: {
          earliest: stats?.[stats.length - 1]?.archived_at,
          latest: stats?.[0]?.archived_at
        }
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error('❌ [Training API] GET error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Manually archive specific conversation for training
export async function POST(req: Request) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { instanceId, reason = 'manual' } = await req.json();
    if (!instanceId) {
      return NextResponse.json({ error: "Instance ID required" }, { status: 400 });
    }

    // This would need the archiveForTraining function to be exported or accessible
    // For now, return a placeholder response
    return NextResponse.json({ 
      message: "Manual archiving endpoint - implement as needed",
      instanceId,
      reason 
    });
  } catch (error) {
    console.error('❌ [Training API] POST error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 