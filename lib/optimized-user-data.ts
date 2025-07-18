/**
 * Optimized User Data Fetching
 * Replaces N+1 queries with efficient batch operations and caching
 */

import { createClient } from "@/utils/supabase/server";
import { performanceCache, CacheKeys } from './performance-cache';

export interface OptimizedUserData {
  businessInfo: any;
  additionalData: Record<string, any[]>;
  fetchTime: number;
  cacheHit: boolean;
}

// Single optimized query to fetch all user data
export async function getOptimizedUserData(userId: string): Promise<OptimizedUserData | null> {
  if (!userId) {
    console.log('⚠️ [Optimized] No userId provided');
    return null;
  }

  const startTime = performance.now();
  const cacheKey = CacheKeys.userData(userId);
  
  // Check cache first
  const cached = performanceCache.get<OptimizedUserData>(cacheKey);
  if (cached) {
    console.log(`✅ [Optimized] Cache hit for user data: ${userId}`);
    return { ...cached, cacheHit: true };
  }

  console.log(`🔄 [Optimized] Fetching fresh data for user: ${userId}`);

  try {
    const supabase = await createClient();
    
    // Batch all queries in parallel for maximum efficiency
    const [
      businessInfoResult,
      battlePlanResult,
      chainOfCommandResult,
      companyOnboardingResult,
      hwgtPlanResult,
      machinesResult,
      meetingRhythmResult,
      playbooksResult,
      quarterlySprintResult,
      triagePlannerResult,
      timelineClaimsResult,
      timelineResult
    ] = await Promise.all([
      // Business info
      supabase
        .from('business_info')
        .select('*')
        .eq('user_id', userId)
        .single(),

      // All user-specific tables in parallel
      supabase
        .from('battle_plan')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      supabase
        .from('chain_of_command')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      supabase
        .from('company_onboarding')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      supabase
        .from('hwgt_plan')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      supabase
        .from('machines')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      supabase
        .from('meeting_rhythm_planner')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      supabase
        .from('playbooks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      supabase
        .from('quarterly_sprint_canvas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      supabase
        .from('triage_planner')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      supabase
        .from('user_timeline_claims')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      // Timeline data (no user_id filter)
      supabase
        .from('chq_timeline')
        .select('*')
        .order('week_number', { ascending: true })
    ]);

    // Process results efficiently
    const userData: OptimizedUserData = {
      businessInfo: businessInfoResult.error ? null : businessInfoResult.data,
      additionalData: {},
      fetchTime: 0,
      cacheHit: false
    };

    // Map results to userData structure
    const tableResults = [
      { table: 'battle_plan', result: battlePlanResult },
      { table: 'chain_of_command', result: chainOfCommandResult },
      { table: 'company_onboarding', result: companyOnboardingResult },
      { table: 'hwgt_plan', result: hwgtPlanResult },
      { table: 'machines', result: machinesResult },
      { table: 'meeting_rhythm_planner', result: meetingRhythmResult },
      { table: 'playbooks', result: playbooksResult },
      { table: 'quarterly_sprint_canvas', result: quarterlySprintResult },
      { table: 'triage_planner', result: triagePlannerResult },
      { table: 'user_timeline_claims', result: timelineClaimsResult },
      { table: 'chq_timeline', result: timelineResult }
    ];

    // Process each table result
    tableResults.forEach(({ table, result }) => {
      if (!result.error && result.data && result.data.length > 0) {
        userData.additionalData[table] = result.data;
        console.log(`✅ [Optimized] Added ${result.data.length} records from ${table}`);
      } else if (result.error) {
        console.error(`❌ [Optimized] Error fetching ${table}:`, result.error);
      }
    });

    const fetchTime = performance.now() - startTime;
    userData.fetchTime = fetchTime;

    console.log(`✅ [Optimized] All user data fetched in ${fetchTime.toFixed(2)}ms`);
    
    // Cache the result for 5 minutes
    performanceCache.set(cacheKey, userData, 5 * 60 * 1000);
    
    return userData;

  } catch (error) {
    console.error('❌ [Optimized] Error fetching user data:', error);
    return null;
  }
}

// Optimized context preparation with minimal string operations
export function prepareOptimizedUserContext(userData: OptimizedUserData): string {
  if (!userData) return '';
  
  const cacheKey = CacheKeys.userContext(JSON.stringify(userData.businessInfo?.id || 'unknown'));
  const cached = performanceCache.get<string>(cacheKey);
  if (cached) {
    return cached;
  }

  // Use array for efficient string building
  const parts: string[] = ['📊 USER DATA CONTEXT 📊\n'];
  
  // Format business info efficiently
  if (userData.businessInfo) {
    const info = userData.businessInfo;
    parts.push(
      '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '## 👤 USER INFORMATION',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      '📝 Personal Details:',
      `- Full Name: ${info.full_name || 'Unknown'}`,
      `- Business Name: ${info.business_name || 'Unknown'}`,
      `- Email: ${info.email || 'Unknown'}`,
      `- Phone: ${info.phone_number || 'Unknown'}`,
      `- Role: ${info.role || 'user'}`,
      '',
      '💰 Payment Information:',
      `- Payment Option: ${info.payment_option || 'Unknown'}`,
      `- Payment Remaining: ${info.payment_remaining || '0'}`,
      '',
      '🔍 Onboarding Status:',
      `- Command HQ: ${info.command_hq_created ? 'Created ✅' : 'Not Created ❌'}`,
      `- Google Drive Folder: ${info.gd_folder_created ? 'Created ✅' : 'Not Created ❌'}`,
      `- Meeting Scheduled: ${info.meeting_scheduled ? 'Yes ✅' : 'No ❌'}`
    );
  }
  
  // Process additional data tables efficiently
  const relevantTables = [
    'battle_plan', 'chain_of_command', 'company_onboarding', 'hwgt_plan',
    'machines', 'meeting_rhythm_planner', 'playbooks', 'quarterly_sprint_canvas',
    'triage_planner', 'chq_timeline', 'user_timeline_claims'
  ];
  
  if (userData.additionalData) {
    relevantTables.forEach(table => {
      const data = userData.additionalData[table];
      if (Array.isArray(data) && data.length > 0) {
        const formattedTableName = table
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
            
        parts.push(
          '',
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          `## 📋 ${formattedTableName.toUpperCase()}`,
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
        );
        
        // Summarize data instead of showing all details
        if (data.length > 3) {
          parts.push(`📊 ${data.length} records available in ${formattedTableName}`);
          // Show just key fields from first 2 records
          data.slice(0, 2).forEach((record: any, index: number) => {
            parts.push(`\n🔢 Record #${index + 1} (Sample):`);
            const keyFields = Object.keys(record).filter(key => 
              !['id', 'user_id', 'created_at', 'updated_at'].includes(key)
            ).slice(0, 3);
            keyFields.forEach(key => {
              if (record[key] && typeof record[key] === 'string' && record[key].length < 100) {
                parts.push(`- ${key}: ${record[key]}`);
              }
            });
          });
        } else {
          // Show all records if 3 or fewer
          data.forEach((record: any, index: number) => {
            parts.push(`\n🔢 Record #${index + 1}:`);
            const keyFields = Object.keys(record).filter(key => 
              !['id', 'user_id', 'created_at', 'updated_at'].includes(key)
            ).slice(0, 5);
            keyFields.forEach(key => {
              if (record[key] && typeof record[key] === 'string' && record[key].length < 200) {
                parts.push(`- ${key}: ${record[key]}`);
              }
            });
          });
        }
      }
    });
  }
  
  const result = parts.join('\n');
  
  // Cache for 10 minutes
  performanceCache.set(cacheKey, result, 10 * 60 * 1000);
  
  return result;
}