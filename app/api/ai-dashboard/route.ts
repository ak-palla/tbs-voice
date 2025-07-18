import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import serverCache from "@/utils/cache";
<<<<<<< HEAD
import { responseQualityOptimizer } from "@/lib/response-quality-optimizer";

const MODEL_NAME = "gemini-2.0-flash-lite-001";
=======

const MODEL_NAME = "gemini-2.5-flash-lite-preview-06-17";
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

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

<<<<<<< HEAD
// Helper function to get global instructions for AI dashboard
async function getGlobalInstructions(categories?: string[]) {
  try {
    console.log('🔄 [Supabase] Fetching global instructions for AI dashboard');
=======
// Helper function to get global instructions
async function getGlobalInstructions(categories?: string[]) {
  try {
    console.log('🔄 [Supabase] Fetching global instructions');
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    const supabase = await createClient();
    let query = supabase
      .from('chatbot_instructions')
      .select('title, content, content_type, url, updated_at, created_at, extraction_metadata, priority, category')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (categories && categories.length > 0) {
      query = query.in('category', categories);
      console.log(`✅ [Supabase] Filtering instructions by categories: ${categories.join(', ')}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [Supabase] Error fetching global instructions:', error);
      throw error;
    }

    console.log(`✅ [Supabase] Fetched ${data?.length || 0} global instructions`);
    return data || [];
  } catch (error) {
    console.error("❌ [Supabase] Error fetching global instructions:", error);
    return [];
  }
}

<<<<<<< HEAD
// Helper function to get user data
=======
// Helper function to get user data (reused from gemini route)
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
async function getUserData(userId: string) {
  if (!userId) {
    console.log('⚠️ [Supabase] No userId provided for getUserData');
    return null;
  }

  console.log(`🔄 [Supabase] Fetching data for user: ${userId}`);

  try {
    const supabase = await createClient();
    
    // Fetch business info
    console.log('🔄 [Supabase] Fetching business info');
    const { data: businessInfo, error: businessError } = await supabase
      .from('business_info')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (businessError) {
      console.error("❌ [Supabase] Error fetching business info:", businessError);
      if (businessError.code !== "PGRST116") { // Not found is ok
        throw businessError;
      }
    } else {
      console.log('✅ [Supabase] Business info fetched successfully');
    }
    
<<<<<<< HEAD
    // Fetch data from other tables
    const regularTables = [
      'battle_plan',
      'chain_of_command',
      'company_onboarding',
      'hwgt_plan',
=======
    // Get user's team_id first for team-based tables
    const userTeamId = businessInfo?.team_id;
    
    // Fetch all team members' business info for context
    console.log('🔄 [Supabase] Fetching team members business info');
    const { data: teamMembersData, error: teamMembersError } = await supabase
      .from('business_info')
      .select('*')
      .eq('team_id', userTeamId)
      .order('full_name', { ascending: true });

    if (teamMembersError) {
      console.error('❌ [Supabase] Error fetching team members:', teamMembersError);
    } else {
      console.log(`✅ [Supabase] Fetched ${teamMembersData?.length || 0} team members`);
    }
    
    // Fetch data from user-scoped tables (directly filtered by user_id)
    const directUserScopedTables = [
      'battle_plan',
      'company_onboarding',
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      'machines',
      'meeting_rhythm_planner',
      'playbooks',
      'quarterly_sprint_canvas',
      'triage_planner',
      'user_timeline_claims'
    ];
    
<<<<<<< HEAD
    console.log('🔄 [Supabase] Fetching data from regular tables');
    const regularTablePromises = regularTables.map(table => {
=======
    console.log('🔄 [Supabase] Fetching data from direct user-scoped tables');
    const directUserScopedPromises = directUserScopedTables.map(table => {
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      console.log(`🔄 [Supabase] Fetching ${table}`);
      return supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error(`❌ [Supabase] Error fetching ${table}:`, error);
            return { table, data: [] };
          }
          console.log(`✅ [Supabase] Fetched ${data?.length || 0} records from ${table}`);
          return { table, data: data || [] };
        });
    });
<<<<<<< HEAD
=======

    // Handle playbook_assignments separately (user_id references business_info.id)
    console.log('🔄 [Supabase] Fetching playbook_assignments');
    const playbookAssignmentsPromise = supabase
      .from('playbook_assignments')
      .select(`
        *,
        business_info!inner(user_id)
      `)
      .eq('business_info.user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error(`❌ [Supabase] Error fetching playbook_assignments:`, error);
          return { table: 'playbook_assignments', data: [] };
        }
        console.log(`✅ [Supabase] Fetched ${data?.length || 0} records from playbook_assignments`);
        return { table: 'playbook_assignments', data: data || [] };
      });

    // Fetch data from team-scoped tables (only if we have a team_id)
    const teamScopedPromises = [];
    if (userTeamId) {
      // Key initiatives - filtered by team_id
      console.log('🔄 [Supabase] Fetching key_initiatives');
      teamScopedPromises.push(
        supabase
          .from('key_initiatives')
          .select('*')
          .eq('team_id', userTeamId)
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (error) {
              console.error(`❌ [Supabase] Error fetching key_initiatives:`, error);
              return { table: 'key_initiatives', data: [] };
            }
            console.log(`✅ [Supabase] Fetched ${data?.length || 0} records from key_initiatives`);
            return { table: 'key_initiatives', data: data || [] };
          })
      );

      // Departments - filtered by team_id
      console.log('🔄 [Supabase] Fetching departments');
      teamScopedPromises.push(
        supabase
          .from('departments')
          .select('*')
          .eq('team_id', userTeamId)
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (error) {
              console.error(`❌ [Supabase] Error fetching departments:`, error);
              return { table: 'departments', data: [] };
            }
            console.log(`✅ [Supabase] Fetched ${data?.length || 0} records from departments`);
            return { table: 'departments', data: data || [] };
          })
      );

      // Key initiative departments - get all for the user's team initiatives
      console.log('🔄 [Supabase] Fetching key_initiative_departments');
      teamScopedPromises.push(
        supabase
          .from('key_initiative_departments')
          .select(`
            *,
            key_initiatives!inner(team_id)
          `)
          .eq('key_initiatives.team_id', userTeamId)
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (error) {
              console.error(`❌ [Supabase] Error fetching key_initiative_departments:`, error);
              return { table: 'key_initiative_departments', data: [] };
            }
            console.log(`✅ [Supabase] Fetched ${data?.length || 0} records from key_initiative_departments`);
            return { table: 'key_initiative_departments', data: data || [] };
          })
      );
    } else {
      console.log('⚠️ [Supabase] No team_id found, skipping team-scoped tables');
    }
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    
    // Fetch timeline data (chq_timeline doesn't have user_id)
    console.log('🔄 [Supabase] Fetching timeline data');
    const timelinePromise = supabase
      .from('chq_timeline')
      .select('*')
      .order('week_number', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error(`❌ [Supabase] Error fetching chq_timeline:`, error);
          return { table: 'chq_timeline', data: [] };
        }
        console.log(`✅ [Supabase] Fetched ${data?.length || 0} records from chq_timeline`);
        return { table: 'chq_timeline', data: data || [] };
      });
    
<<<<<<< HEAD
    const allPromises = [...regularTablePromises, timelinePromise];
=======
    const allPromises = [...directUserScopedPromises, playbookAssignmentsPromise, ...teamScopedPromises, timelinePromise];
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    const tableResults = await Promise.all(allPromises);
    
    // Format the response
    const userData = {
      businessInfo: businessInfo || null,
<<<<<<< HEAD
=======
      teamMembers: teamMembersData || [],
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      additionalData: {} as Record<string, any[]>
    };
    
    // Add other table data
<<<<<<< HEAD
    tableResults.forEach(({ table, data }) => {
=======
    tableResults.forEach(({ table, data }: { table: string; data: any[] }) => {
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      if (data && data.length > 0) {
        console.log(`✅ [Supabase] Adding ${data.length} records from ${table} to response`);
        userData.additionalData[table] = data;
      } else {
        console.log(`⚠️ [Supabase] No records found in ${table} for user ${userId}`);
      }
    });
    
    console.log('✅ [Supabase] All user data fetched successfully');
    return userData;
  } catch (error) {
    console.error('❌ [Supabase] Error fetching user data:', error);
    return null;
  }
}

<<<<<<< HEAD
// Helper function to format table data for dashboard insights
function formatTableDataForDashboard(table: string, data: any) {
=======
// Helper function to format table data (from gemini route)
function formatTableData(table: string, data: any) {
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  if (!data) return '';
  
  const parts: string[] = [];
  
  // Helper function to try parsing JSON strings
  const tryParseJSON = (value: any): any => {
    if (typeof value !== 'string') return value;
    
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    } catch (e) {
      // Not JSON, return the original value
    }
    
    return value;
  };
  
<<<<<<< HEAD
  // Helper function to format a value
  const formatValue = (value: any): string => {
=======
  // Helper function to format a value with proper handling of nested objects
  const formatValue = (value: any, depth: number = 0): string => {
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    value = tryParseJSON(value);
    
    if (value === null || value === undefined) return 'None';
    
<<<<<<< HEAD
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        return value.map(item => formatValue(item)).join(', ');
=======
    const indent = '  '.repeat(depth);
    
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        
        if (value.every(item => typeof item !== 'object' || item === null)) {
          return value.map(item => formatValue(item, depth)).join(', ');
        }
        
        const itemsFormatted = value.map(item => `${indent}  - ${formatValue(item, depth + 1)}`).join('\n');
        return `\n${itemsFormatted}`;
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      }
      
      if (value instanceof Date) {
        return value.toLocaleString();
      }
      
      if (Object.keys(value).length === 0) return '{}';
      
<<<<<<< HEAD
      return Object.entries(value).map(([key, val]) => {
        return `${key}: ${formatValue(val)}`;
      }).join('; ');
=======
      const formattedProps = Object.entries(value).map(([key, val]) => {
        const propName = key
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        return `${indent}  ${propName}: ${formatValue(val, depth + 1)}`;
      }).join('\n');
      
      return `\n${formattedProps}`;
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      try {
        const date = new Date(value);
        return date.toLocaleString();
      } catch (e) {
        return String(value);
      }
    }
    
    return String(value);
  };

<<<<<<< HEAD
  // Format based on table type - simplified for dashboard
=======
  // Helper function to format a field name
  const formatFieldName = (field: string): string => {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Add all fields except system fields for most tables
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  Object.entries(data)
    .filter(([key]) => !['id', 'user_id', 'created_at', 'updated_at'].includes(key))
    .forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
<<<<<<< HEAD
        const fieldName = key
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        parts.push(`${fieldName}: ${formatValue(value)}`);
=======
        parts.push(`- ${formatFieldName(key)}: ${formatValue(value)}`);
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      }
    });

  return parts.join('\n');
}

<<<<<<< HEAD
// Helper function to prepare user context for dashboard
function prepareUserContextForDashboard(userData: any) {
  if (!userData) return '';
  
  const parts: string[] = ['=== USER BUSINESS DATA ===\n'];
=======
// Helper function to prepare user context (from gemini route)
function prepareUserContext(userData: any) {
  if (!userData) return '';
  
  const parts: string[] = ['📊 USER DATA CONTEXT 📊\n'];
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  
  // Format business info
  if (userData.businessInfo) {
    const info = userData.businessInfo;
<<<<<<< HEAD
    parts.push(`BUSINESS INFORMATION:
- Business Name: ${info.business_name || 'Unknown'}
- Owner: ${info.full_name || 'Unknown'}
- Role: ${info.role || 'user'}
- Email: ${info.email || 'Unknown'}
- Phone: ${info.phone_number || 'Unknown'}
- Payment Status: ${info.payment_option || 'Unknown'}
- Command HQ Created: ${info.command_hq_created ? 'Yes' : 'No'}
- Google Drive Setup: ${info.gd_folder_created ? 'Yes' : 'No'}
- Meeting Scheduled: ${info.meeting_scheduled ? 'Yes' : 'No'}
`);
  }
  
  // Process all relevant tables
  const relevantTables = [
    'battle_plan',
    'chain_of_command', 
    'company_onboarding',
    'hwgt_plan',
=======
    parts.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 👤 USER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Personal Details:
- Full Name: ${info.full_name || 'Unknown'}
- Business Name: ${info.business_name || 'Unknown'}
- Email: ${info.email || 'Unknown'}
- Phone: ${info.phone_number || 'Unknown'}
- Role: ${info.role || 'user'}`);
  }

  // Format team members information
  if (userData.teamMembers && userData.teamMembers.length > 0) {
    parts.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 👥 TEAM MEMBERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    userData.teamMembers.forEach((member: any, index: number) => {
      parts.push(`
👤 Team Member #${index + 1}:
- Full Name: ${member.full_name}
- Role: ${member.role}
- Department: ${member.department || 'Not specified'}`);
    });
  }
  
  // Process all other relevant tables
  const relevantTables = [
    'battle_plan',
    'company_onboarding', 
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    'machines',
    'meeting_rhythm_planner',
    'playbooks',
    'quarterly_sprint_canvas',
    'triage_planner',
<<<<<<< HEAD
    'chq_timeline',
    'user_timeline_claims'
=======
    'key_initiatives',
    'departments'
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  ];
  
  if (userData.additionalData) {
    Object.entries(userData.additionalData)
      .filter(([table]) => relevantTables.includes(table))
      .forEach(([table, data]) => {
        if (Array.isArray(data) && data.length > 0) {
<<<<<<< HEAD
          const tableName = table
=======
          const formattedTableName = table
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
<<<<<<< HEAD
          parts.push(`\n${tableName.toUpperCase()}:`);
          
          data.forEach((record: any, index: number) => {
            parts.push(`\nRecord ${index + 1}:`);
            parts.push(formatTableDataForDashboard(table, record));
          });
        }
      });
=======
          parts.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📋 ${formattedTableName.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          
          data.forEach((record: any, index: number) => {
            parts.push(`
🔢 Record #${index + 1}:
${formatTableData(table, record)}`);
          });
        }
    });
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  }
  
  return parts.join('\n');
}

<<<<<<< HEAD
// Main dashboard analysis prompt
const DASHBOARD_SYSTEM_PROMPT = `You are an AI-powered business analyst and virtual COO. Your role is to analyze the user's business data and provide clear, actionable insights for their dashboard. always use the names of person if available.

ANALYSIS FRAMEWORK:
You must analyze ALL the provided business data and respond with a structured JSON object containing exactly these sections:

1. BUSINESS_HEALTH: Analyze what's working, what's lagging, and what needs fixing
2. TASKS_AND_PRIORITIES: Identify key tasks for today/this week based on the data
3. PROGRESS_METRICS: Calculate overall business progress and specific metrics

RESPONSE FORMAT:
Return ONLY a valid JSON object with this exact structure:

{
  "business_health": {
    "working_well": [
      "Brief point about what's working well (max 3 points, keep each point concise - 2 sentence)"
    ],
    "lagging_areas": [
      {
        "issue": "Brief point about what's lagging (2 sentence max)",
        "quick_fix": "Specific actionable guidance on where to go and what to do (2 sentence max)"
      }
    ],
    "critical_fixes": [
      {
        "issue": "Brief point about critical issues (2 sentence max)",
        "quick_fix": "Specific actionable guidance on where to go and what to do (2 sentence max)"
      }
    ]
  },
  "tasks_and_priorities": {
    "high_priority": [
      {
        "task": "Concise actionable task (2 sentence max)",
        "reason": "Brief reason (2 sentence max)",
        "deadline": "Today/This Week/This Month",
        "guidance": "Specific guidance on where to go to complete this task (2 sentence max)"
      }
    ],
    "medium_priority": [
      {
        "task": "Concise actionable task (2 sentence max)", 
        "reason": "Brief reason (2 sentence max)",
        "deadline": "This Week/This Month",
        "guidance": "Specific guidance on where to go to complete this task (2 sentence max)"
      }
    ]
  },
  "progress_metrics": {
    "overall_progress": ##,
    "completion_rate": ##,
    "setup_progress": ##,
    "strategic_progress": ##,
    "operational_progress": ##,
    "insights": [
      "Brief key insight (max 2 points, keep each insight concise - 2 sentence)"
    ]
  }
}

CONTENT REQUIREMENTS:
- MAXIMUM 3 points for each business_health section (working_well, lagging_areas, critical_fixes)
- MAXIMUM 3 tasks for high_priority and 2 tasks for medium_priority 
- MAXIMUM 3 insights in progress_metrics
- Keep ALL text concise - each point should be 2 sentence maximum
- Be specific but brief - focus on the most important items only
- Base ALL insights on the actual data provided - do not make generic statements
- For quick_fix and guidance fields, provide SPECIFIC actionable directions with clickable links using this format: "Go to [Page Name](/page-url) to complete this action. This will help you achieve XYZ."

AVAILABLE TBS PLATFORM LINKS FOR QUICK FIXES AND GUIDANCE:
- Battle Plan: /battle-plan
- Chain of Command: /chain-of-command  
- Playbooks/SOP: /sop
- Meeting Rhythm Planner: /meeting-rhythm-planner
- Triage Planner: /triage-planner
- HWGT Plans: /hwgt-plan
- Quarterly Sprint Canvas: /quarterly-sprint-canvas
- Machines: /machines
- Business Info: /business-info
- Company Onboarding: /company-onboarding
- Dashboard: /dashboard
- AI Dashboard: /ai-dashboard

LINK FORMAT EXAMPLES:
- "Navigate to [Battle Plan](/battle-plan) to create your strategic roadmap. This will help align your team on key objectives."
- "Go to [Chain of Command](/chain-of-command) to define team roles and responsibilities. This will improve accountability and communication."
- "Visit [Meeting Rhythm Planner](/meeting-rhythm-planner) to schedule regular team check-ins. This will ensure consistent communication."
- "Access [Triage Planner](/triage-planner) to prioritize urgent tasks effectively. This will help you focus on what matters most."

ANALYSIS GUIDELINES:
- Base ALL insights on the actual data provided - do not make generic statements
- Be specific and reference actual data points, completed items, missing elements
- Calculate realistic progress percentages based on data completeness and quality
- Identify real gaps, incomplete sections, or missing critical business elements
- Provide actionable recommendations tied to specific data deficiencies
- If there's limited data, focus on what needs to be completed or improved
- Use business terminology appropriate for a COO-level analysis
- Consider the user's business stage and current setup progress
- Make quick_fix and guidance suggestions specific to the TBS platform sections and tools

Remember: This dashboard helps business owners cut through data overwhelm by providing clear, actionable insights. Be precise, data-driven, and practical.`;

// Helper function to format instructions for dashboard
function formatInstructionsForDashboard(instructionsData: any[], userContext: string) {
  const parts: string[] = ['AI DASHBOARD INSTRUCTIONS\n'];
  
  if (instructionsData && instructionsData.length > 0) {
    // Group instructions by priority
    const priorityGroups = instructionsData.reduce((groups: any, inst: any) => {
      const priority = inst.priority || 0;
      if (!groups[priority]) {
        groups[priority] = [];
      }
      groups[priority].push(inst);
      return groups;
    }, {});

    // Process instructions in priority order (highest first)
    const priorities = Object.keys(priorityGroups).sort((a, b) => Number(b) - Number(a));
    
    for (const priority of priorities) {
      const instructions = priorityGroups[priority];
      const priorityLevel = Number(priority);
      
      // Add priority header with appropriate formatting
      if (priorityLevel > 0) {
        parts.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## HIGH PRIORITY INSTRUCTIONS (Priority ${priority})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      } else {
        parts.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STANDARD INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      }
      
      // Format individual instructions with clear separation
      const formattedInstructions = instructions
        .map((inst: any, index: number) => {
          const instructionParts = [];
          
          instructionParts.push(`INSTRUCTION ${index + 1}:`);
          instructionParts.push(`${inst.content}`);
          
          // Add metadata with better formatting
          const metadataParts = [];

          if (inst.title) {
            metadataParts.push(`Title: ${inst.title}`);
          }
          
          if (inst.content_type) {
            metadataParts.push(`Type: ${inst.content_type}`);
          }
          
          if (inst.url) {
            metadataParts.push(`Reference: ${inst.url}`);
          }
          
          if (inst.extraction_metadata) {
            metadataParts.push(`Metadata: ${JSON.stringify(inst.extraction_metadata)}`);
          }
          
          if (inst.updated_at) {
            metadataParts.push(`Last Updated: ${new Date(inst.updated_at).toLocaleString()}`);
          }
          
          if (inst.created_at) {
            metadataParts.push(`Created: ${new Date(inst.created_at).toLocaleString()}`);
          }
          
          if (metadataParts.length > 0) {
            instructionParts.push(`\nInstruction Metadata:\n${metadataParts.map(p => `- ${p}`).join('\n')}`);
          }
          
          return instructionParts.join('\n');
        })
        .join('\n\n────────────────────────────────────────────────────────\n\n');
      
      parts.push(formattedInstructions);
    }
  }

  // Add user context with clear separation
  if (userContext) {
    parts.push(`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                 USER CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${userContext}`);
  }

  // Enhanced response guidelines with specific formatting requirements
  parts.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ENHANCED RESPONSE FORMATTING GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### CRITICAL FORMATTING REQUIREMENTS:

**0. Content Policy:**
- Under no circumstances should you use any emojis in your response.

**1. Structure & Organization:**
- Start with a clear, compelling opening statement
- Use proper markdown headings (## for main sections, ### for subsections)
- Break content into digestible sections with clear headings
- Use numbered lists for sequential steps (1. 2. 3.)
- Use bullet points for related items or benefits (- or *)
- Add white space between sections for readability

**2. Content Presentation:**
- **Bold** key concepts, important points, and section headers
- Use *italic* for emphasis on specific terms
- Create clear, scannable content with proper paragraph breaks
- Keep paragraphs to 2-3 sentences maximum
- Use transition words between sections

**3. Actionable Elements:**
- Always include numbered action steps when providing guidance
- Use clear call-to-action statements
- Provide specific, measurable recommendations
- Include timelines or deadlines when relevant

**4. Visual Enhancement:**
- Create visual hierarchy with proper markdown formatting
- Use code blocks for specific instructions or examples
- Include relevant examples or case studies when helpful

### RESPONSE STRUCTURE TEMPLATE:

For most responses, follow this proven structure:

## Quick Summary
*Brief 1-2 sentence overview of what you're about to explain*

## Key Points
*Main concepts organized as bullet points*

## Step-by-Step Implementation
*Numbered action steps with clear instructions*

1. **First Action:** Specific description with context
2. **Second Action:** Clear next step with details
3. **Third Action:** Continue the logical sequence

## Additional Considerations
*Important factors, tips, or warnings*

## Next Steps
*Clear call-to-action or follow-up recommendations*

### FORMATTING RULES TO FOLLOW:

- **Never** write wall-of-text responses without breaks
- **Never** use "First, Second, Third, Finally" in running sentences
- **Always** use proper markdown headings and formatting
- **Always** break up content into scannable sections
- **Always** provide numbered steps for processes (use 1. 2. 3. format)
- **Always** use bullet points for lists of related items (use - or * format)
- **Always** bold important concepts and key terms
- **Always** end with clear next steps or call-to-action
- **Always** add line breaks between different points
- **Never** combine multiple sequential points in one paragraph

### AVOID THIS BAD FORMAT:
"Let's get this done. First, do this task and make sure it's complete. Second, move on to the next item and ensure quality. Third, review everything carefully. Finally, implement the changes."

### USE THIS GOOD FORMAT:
"Let's get this done effectively:

1. **Do This Task**
   Make sure it's complete and meets quality standards

2. **Move to Next Item** 
   Focus on ensuring quality throughout the process

3. **Review Everything**
   Carefully check all work before proceeding

4. **Implement Changes**
   Execute the final implementation with confidence"

### STYLE PREFERENCES:

- Professional but approachable tone
- UK English spelling and terminology
- Active voice over passive voice
- Present tense when giving instructions
- Second person (you/your) for direct engagement
- Specific examples over general statements

### QUALITY CHECKLIST:

Before sending your response, ensure:
- Content is broken into clear, scannable sections
- Uses proper markdown formatting throughout
- Includes numbered steps for any processes
- Has clear headings that describe each section
- Provides actionable, specific recommendations
- Ends with clear next steps
- Is visually appealing and easy to read
- Maintains consistent formatting throughout

Remember: The user should be able to quickly scan your response and immediately understand the key points and action items. Make every response a masterpiece of clear, organised communication.`);

  return parts.join('\n');
}

export async function POST(req: Request) {
  try {
    // 1. Verify user authentication
    const userId = await getUserId(req);
    if (!userId) {
      console.error('❌ [AI Dashboard] Unauthorized access attempt');
      return NextResponse.json({ 
        type: 'error', 
        error: 'Unauthorized - Please sign in to access the dashboard' 
      }, { status: 401 });
    }

    // 2. Verify the app_cache table exists
    const supabase = await createClient();
    const { error: tableCheckError } = await supabase
      .from('app_cache')
      .select('id')
      .limit(1);

    if (tableCheckError) {
      console.error('❌ [AI Dashboard] Cache table error:', tableCheckError);
      return NextResponse.json({ 
        type: 'error', 
        error: 'Dashboard cache system is not properly initialized. Please contact support.' 
      }, { status: 500 });
    }
    // Read request body only once to prevent "Response body object should not be disturbed or locked" error
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (bodyError) {
      console.error('❌ [AI Dashboard] Error reading request body:', bodyError);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { type = "dashboard_analysis", force_refresh = false } = requestBody;

    if (type === "dashboard_analysis") {
      console.log(`🔄 [AI Dashboard API] Processing dashboard analysis request ${force_refresh ? '(FORCE REFRESH)' : ''}`);
      
      // If not force refreshing, check cache first without generating fresh data
      if (!force_refresh) {
        const cachedResult = await serverCache.checkAiDashboardCache(userId);
        if (cachedResult) {
          console.log('✅ [AI Dashboard API] Returning cached dashboard data');
          return NextResponse.json(cachedResult);
        } else {
          console.log('ℹ️ [AI Dashboard API] No cached data available - manual refresh required');
          return NextResponse.json({ 
            type: 'no_cache', 
            message: 'No cached data available. Please click refresh to generate analysis.'
          });
        }
      }
      
      // Force refresh - generate fresh data and cache it
      const cachedResult = await serverCache.getAiDashboardData(userId, async (userId) => {
        console.log('🔄 [AI Dashboard API] Generating fresh dashboard analysis');
        
        // Debug: Check current cache status
        await serverCache.debugCacheStatus(userId);
        
        const dashboardCategories = [
          'course_videos',
          'main_chat_instructions', 
          'global_instructions',
          'product_features',
          'faq_content',
          'internal_knowledge_base',
          'ai_dashboard_instructions',
          'uncategorized'
        ];

        // Get user context and instructions using cache
        const [userData, globalInstructions] = await Promise.all([
          serverCache.getUserData(userId, getUserData, true),
          serverCache.getGlobalInstructions(async () => getGlobalInstructions(dashboardCategories))
        ]);

        // Prepare context
        const userContext = prepareUserContextForDashboard(userData);
        
        // Combine system prompt with user data
        const fullPrompt = `${DASHBOARD_SYSTEM_PROMPT}

=== USER BUSINESS DATA TO ANALYZE ===
${userContext}

Now analyze this data and provide insights in the required JSON format.`;

        console.log('\n=== AI DASHBOARD ANALYSIS START ===');
        console.log('Analyzing user data for dashboard insights...');
        console.log('=== AI DASHBOARD ANALYSIS END ===\n');

        // Prepare the model
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        // 🎯 QUALITY OPTIMIZATION: Apply dashboard-specific quality settings
        const qualityConfig = responseQualityOptimizer.getGenerationConfig('dashboard-chat', 'text');
        const qualityEnhancement = responseQualityOptimizer.getPromptEnhancement('dashboard-chat', 'business dashboard insights', 'text');
        const optimizedPrompt = fullPrompt + qualityEnhancement;

        try {
          console.log('🔄 [AI Dashboard API] Generating dashboard analysis with quality optimization');
          const result = await model.generateContent({
            contents: [{
              role: 'user',
              parts: [{ text: optimizedPrompt }]
            }],
            generationConfig: qualityConfig
          });

          const responseText = result.response.text();
          
          // Try to parse as JSON
          let analysisData;
          try {
            // Clean the response text to extract JSON
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const jsonText = jsonMatch ? jsonMatch[0] : responseText;
            analysisData = JSON.parse(jsonText);
          } catch (parseError) {
            console.error("❌ [AI Dashboard API] Failed to parse JSON response:", parseError);
            // Fallback to a default structure
            analysisData = {
              business_health: {
                working_well: ["Analysis in progress - please refresh for detailed insights"],
                lagging_areas: [{
                  issue: "Data analysis pending",
                  quick_fix: "Click refresh to generate AI-powered insights"
                }],
                critical_fixes: [{
                  issue: "Dashboard initialization required",
                  quick_fix: "Complete business setup to unlock AI analysis"
                }]
              },
              tasks_and_priorities: {
                high_priority: [{
                  task: "Complete business setup",
                  reason: "Initial configuration needed",
                  deadline: "This Week",
                  guidance: "Navigate to Business Info section to complete your profile"
                }],
                medium_priority: []
              },
              progress_metrics: {
                overall_progress: 50,
                completion_rate: 40,
                setup_progress: 30,
                strategic_progress: 45,
                operational_progress: 55,
                insights: ["Dashboard is being initialized with your business data"]
              }
            };
          }
          
          return { 
            type: 'dashboard_analysis',
            analysis: analysisData
          };
        } catch (error) {
          console.error("❌ [AI Dashboard API] Error generating analysis:", error);
          throw error;
        }
      }, force_refresh);

      if (cachedResult) {
        console.log(`✅ [AI Dashboard API] Returning ${force_refresh ? 'fresh' : 'cached'} dashboard data`);
        return NextResponse.json(cachedResult);
      } else {
        return NextResponse.json({ 
          type: 'error', 
          error: 'Failed to generate dashboard analysis'
        }, { status: 500 });
      }
    }

    return new NextResponse("Invalid request type", { status: 400 });
  } catch (error) {
    console.error("❌ [AI Dashboard API] Error processing request:", error);
    return new NextResponse(
      JSON.stringify({
        type: 'error',
        error: 'Failed to process dashboard request',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
=======
async function generateInsights(userId: string, language: string = 'en') {
  console.log('🔄 [API] Generating AI insights for dashboard');
  
  // Get user data using cache
  const userData = await serverCache.getUserData(userId, getUserData);
  
  if (!userData) {
    throw new Error('No user data available for insights');
  }

  // Get global instructions for comprehensive context
  const regularChatCategories = [
    'course_videos',
    'main_chat_instructions', 
    'global_instructions',
    'product_features',
    'faq_content',
    'internal_knowledge_base',
    'uncategorized'
  ];

  // Get user context and instructions using cache
  const [fullUserData, globalInstructions] = await Promise.all([
    userData, // We already have this
    serverCache.getGlobalInstructions(async () => getGlobalInstructions(regularChatCategories))
  ]);

  // Prepare comprehensive context
  const userContext = prepareUserContext(fullUserData);
  const context = `${userContext}\n\nGLOBAL INSTRUCTIONS: ${globalInstructions.length} business guidance instructions available.`;
  
  // Language instruction for UK English
  const languageInstruction = language === 'en-GB' 
    ? '\n\nIMPORTANT: Please respond in UK English using British spelling, terminology, and conventions (e.g., use "colour" not "color", "realise" not "realize", "whilst" not "while", "analyse" not "analyze", etc.).'
    : '';

  // Create insights prompt
  const insightsPrompt = `
You are an AI business adviser analysing a company's current state and progress. Based on the following business context, provide exactly 3 concise, actionable insights with detailed implementation steps.

Business Context: ${context}

For each insight, provide:
1. A brief insight (1 sentence maximum)
2. A short "how to" instruction (1 sentence maximum)

Format as JSON:
{
  "insights": [
    {
      "insight": "Brief actionable insight here",
      "howTo": "You can go to Business Battle Plan to update your strategy.",
      "relevantPages": ["/business-battle-plan"]
    }
  ]
}

Available app pages to reference:
- /business-battle-plan - Strategic planning and business plan
- /quarterly-sprint-canvas - Quarterly goals and revenue planning  
- /key-initiatives - Key business initiatives tracking
- /triage-planner - Business triage and planning
- /growth-machine - Growth strategy planning
- /fulfillment-machine - Customer fulfillment processes
- /innovation-machine - Innovation and idea management
- /meeting-rhythm-planner - Meeting scheduling and rhythm
- /playbook-planner - Process documentation
- /chain-of-command - Team hierarchy and roles
- /calendar - Company timeline and milestones
- /chat - AI assistant for guidance
- /users - Team management

Focus on business growth, team efficiency, and strategic planning. Keep insights actionable and specific.

IMPORTANT: 
- Keep "howTo" instructions very short and simple - just mention which page to visit and what to do there in one sentence.
- Include only ONE relevant page link per insight in the relevantPages array.${languageInstruction}
`;

  // Generate insights using Gemini
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  
  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [{ text: insightsPrompt }]
    }],
    generationConfig: {
      maxOutputTokens: 500,
      temperature: 0.7,
      topK: 20,
      topP: 0.8,
    }
  });

  const insights = result.response.text();
  
  // Parse JSON response
  let parsedInsights;
  try {
    // Clean the response and try to parse JSON
    const cleanedResponse = insights.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsedInsights = JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    // Fallback to simple text parsing
    const simpleInsights = insights
      .split('\n')
      .filter(line => line.trim().length > 0)
      .slice(0, 3)
      .map(line => ({
        insight: line.replace(/^[•\-\d\.]\s*/, '').trim(),
        howTo: "Visit the relevant sections in the app to take action on this insight.",
        relevantPages: ["/chat"]
      }));
    
    parsedInsights = { insights: simpleInsights };
  }

  // Ensure we have exactly 3 insights
  const finalInsights = parsedInsights.insights ? parsedInsights.insights.slice(0, 3) : [];

  console.log('✅ [API] Generated insights successfully');
  
  return {
    type: 'dashboard_insights',
    insights: finalInsights,
    context: context,
    timestamp: new Date().toISOString()
  };
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { language } = body;
    
    const result = await generateInsights(userId, language);
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ [API] Error generating insights:', error);
    return NextResponse.json({
      type: 'error',
      error: 'Failed to generate insights',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  }
}

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

<<<<<<< HEAD
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  try {
    const dashboardCategories = [
      'course_videos',
      'main_chat_instructions',
      'global_instructions', 
      'product_features',
      'faq_content',
      'internal_knowledge_base',
      'ai_dashboard_instructions',
      'uncategorized'
    ];

    // Get user context and instructions using cache
    const [userData, globalInstructions] = await Promise.all([
      serverCache.getUserData(userId, getUserData), // Don't force refresh for GET requests
      serverCache.getGlobalInstructions(async () => getGlobalInstructions(dashboardCategories))
    ]);

    // Handle different actions
    switch (action) {
      case 'view':
        // View formatted context in browser
        try {
          console.log('🔄 [AI Dashboard API] Generating formatted view of model context');
          
          // Prepare context and instructions
          const userContext = prepareUserContextForDashboard(userData);
          const formattedInstructions = formatInstructionsForDashboard(globalInstructions, userContext);
          
          // Combine system prompt with user data
          const fullPrompt = `${DASHBOARD_SYSTEM_PROMPT}

=== USER BUSINESS DATA TO ANALYZE ===
${userContext}

Now analyze this data and provide insights in the required JSON format.`;
          
          // Return as HTML for better formatting in browser
          const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>AI Dashboard Model Context</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: monospace;
                  line-height: 1.5;
                  margin: 20px;
                  padding: 0;
                  background-color: #f5f5f5;
                  color: #333;
                }
                .container {
                  max-width: 1200px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: white;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h1 {
                  text-align: center;
                  margin-bottom: 20px;
                  color: #2563eb;
                }
                pre {
                  white-space: pre-wrap;
                  word-wrap: break-word;
                  padding: 15px;
                  background-color: #f0f7ff;
                  border-radius: 5px;
                  border: 1px solid #ccc;
                  overflow: auto;
                }
                .links {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .links a {
                  margin: 0 10px;
                  color: #2563eb;
                  text-decoration: none;
                }
                .links a:hover {
                  text-decoration: underline;
                }
                .section {
                  margin-bottom: 30px;
                }
                .section h2 {
                  color: #1f2937;
                  border-bottom: 2px solid #e5e7eb;
                  padding-bottom: 5px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>AI Dashboard Model Context</h1>
                <div class="links">
                  <a href="/api/ai-dashboard?action=debug">View Raw JSON</a>
                  <a href="/api/ai-dashboard?action=view">Refresh</a>
                </div>
                
                <div class="section">
                  <h2>Instructions & Context</h2>
                  <pre>${
                    formattedInstructions
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      // Add some coloring to the headings
                      .replace(/━━+/g, '<span style="color:#888">$&</span>')
                      .replace(/##[^\n]+/g, '<span style="color:#2563eb;font-weight:bold">$&</span>')
                  }</pre>
                </div>
                
                <div class="section">
                  <h2>Complete Prompt Sent to Model</h2>
                  <pre>${
                    fullPrompt
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/===[^=]+===/g, '<span style="color:#059669;font-weight:bold">$&</span>')
                  }</pre>
                </div>
              </div>
            </body>
          </html>
          `;
          
          return new Response(htmlContent, {
            headers: {
              "Content-Type": "text/html",
            },
          });
        } catch (error) {
          console.error("❌ [AI Dashboard API] Error generating formatted view:", error);
          return new NextResponse(
            JSON.stringify({
              type: 'error',
              error: 'Failed to generate formatted view',
              details: error instanceof Error ? error.message : String(error)
            }),
            { status: 500 }
          );
        }

      case 'debug':
        // Handle debug request - return raw JSON data
        try {
          console.log('🔄 [AI Dashboard API] Fetching debug data for model context');
          
          // Prepare context and instructions
          const userContext = prepareUserContextForDashboard(userData);
          const formattedInstructions = formatInstructionsForDashboard(globalInstructions, userContext);
          
          // Combine system prompt with user data
          const fullPrompt = `${DASHBOARD_SYSTEM_PROMPT}

=== USER BUSINESS DATA TO ANALYZE ===
${userContext}

Now analyze this data and provide insights in the required JSON format.`;
          
          // Format all the data that would be sent to the model
          const modelInput = {
            // Raw data
            raw: {
              userData,
              globalInstructions,
              userContext,
              systemPrompt: DASHBOARD_SYSTEM_PROMPT
            },
            // Formatted data (what the model actually sees)
            formatted: {
              formattedInstructions,
              fullPrompt
            }
          };
          
          console.log('✅ [AI Dashboard API] Returning debug data');
          return new NextResponse(
            JSON.stringify({
              type: 'debug_data',
              modelInput
            }, null, 2)
          );
        } catch (error) {
          console.error("❌ [AI Dashboard API] Error fetching debug data:", error);
          return new NextResponse(
            JSON.stringify({
              type: 'error',
              error: 'Failed to fetch debug data',
              details: error instanceof Error ? error.message : String(error)
            }),
            { status: 500 }
          );
        }

      default:
        // Default behavior - get basic dashboard data
        console.log('🔄 [AI Dashboard API] Processing GET request for dashboard data');
        
        // Return basic dashboard data for initial load
        return NextResponse.json({
          type: 'dashboard_data',
          hasData: !!(userData && Object.keys(userData.additionalData || {}).length > 0),
          businessInfo: userData?.businessInfo || null,
          dataPoints: Object.keys(userData?.additionalData || {}).length,
          timestamp: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error("❌ [AI Dashboard API] Error processing GET request:", error);
    return NextResponse.json({
      type: 'error',
      error: 'Failed to fetch dashboard data',
=======
  try {
    const result = await generateInsights(userId);
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ [API] Error generating insights:', error);
    return NextResponse.json({
      type: 'error',
      error: 'Failed to generate insights',
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 