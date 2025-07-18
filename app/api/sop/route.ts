import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getTeamId } from '@/utils/supabase/teams';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = await getTeamId(supabase, user.id);

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const sopId = searchParams.get('sopId');

    switch (action) {
      case 'current':
        // Get current SOP for the team
        const { data: currentSop, error: currentError } = await supabase
          .from('sop_data')
          .select('*')
          .eq('user_id', teamId)
          .eq('is_current', true)
          .single();

        if (currentError && currentError.code !== 'PGRST116') {
          return NextResponse.json({ error: "Failed to fetch current SOP" }, { status: 500 });
        }

        return NextResponse.json({ sop: currentSop || null });

      case 'history':
        // Get SOP history for the team
        const { data: history, error: historyError } = await supabase
          .from('sop_data')
          .select('id, title, version, created_at, is_current, metadata')
          .eq('user_id', teamId)
          .order('created_at', { ascending: false });

        if (historyError) {
          return NextResponse.json({ error: "Failed to fetch SOP history" }, { status: 500 });
        }

        return NextResponse.json({ history });

      case 'get':
        // Get specific SOP by ID for the team
        if (!sopId) {
          return NextResponse.json({ error: "SOP ID is required" }, { status: 400 });
        }

        const { data: specificSop, error: specificError } = await supabase
          .from('sop_data')
          .select('*')
          .eq('id', sopId)
          .eq('user_id', teamId)
          .single();

        if (specificError) {
          return NextResponse.json({ error: "SOP not found" }, { status: 404 });
        }

        return NextResponse.json({ sop: specificSop });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (error: any) {
    console.error("SOP API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to process request" 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = await getTeamId(supabase, user.id);
    const { action, sopId } = await req.json();

    if (action === 'restore') {
      if (!sopId) {
        return NextResponse.json({ error: "SOP ID is required" }, { status: 400 });
      }

      // Get the SOP to restore for the team
      const { data: sopToRestore, error: fetchError } = await supabase
        .from('sop_data')
        .select('*')
        .eq('id', sopId)
        .eq('user_id', teamId)
        .single();

      if (fetchError || !sopToRestore) {
        return NextResponse.json({ error: "SOP not found" }, { status: 404 });
      }

      // Mark all current SOPs as not current for the team
      await supabase
        .from('sop_data')
        .update({ is_current: false })
        .eq('user_id', teamId)
        .eq('is_current', true);

      // Create new version based on the restored SOP for the team
      const { data: restoredSop, error: restoreError } = await supabase
        .from('sop_data')
        .insert({
          user_id: teamId,
          title: sopToRestore.title,
          content: sopToRestore.content,
          version: sopToRestore.version + 1000, // Use high version number to indicate restoration
          is_current: true,
          parent_sop_id: sopToRestore.parent_sop_id || sopToRestore.id,
          metadata: {
            ...sopToRestore.metadata,
            restored_from: sopId,
            restored_date: new Date().toISOString(),
            original_version: sopToRestore.version
          }
        })
        .select()
        .single();

      if (restoreError) {
        console.error("Error restoring SOP:", restoreError);
        return NextResponse.json({ error: "Failed to restore SOP" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        sop: restoredSop
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("SOP API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to process request" 
    }, { status: 500 });
  }
} 