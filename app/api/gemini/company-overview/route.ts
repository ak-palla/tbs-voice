import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

const MODEL_NAME = "gemini-2.5-flash-lite-preview-06-17";
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

// Helper function to get team ID from user ID
async function getTeamId(userId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("No authenticated user");

    // Get team_id from business_info
    const { data: businessInfo, error } = await supabase
      .from("business_info")
      .select("team_id")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return businessInfo?.team_id;
  } catch (error) {
    console.error("Error getting team ID:", error);
    return null;
  }
}

// Helper function to get comprehensive company data
async function getCompanyData(userId: string, teamId: string) {
  try {
    const supabase = await createClient();
    
    // Fetch business info for the user
    const { data: businessInfo, error: businessError } = await supabase
      .from('business_info')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (businessError && businessError.code !== "PGRST116") {
      console.error("Error fetching business info:", businessError);
    }
    
    // Fetch all team members' business info
    const { data: teamMembers, error: teamError } = await supabase
      .from('business_info')
      .select('*')
      .eq('team_id', teamId)
      .order('full_name', { ascending: true });

    if (teamError) {
      console.error('Error fetching team members:', teamError);
    }
    
    // Fetch key company data tables
    const dataPromises = [
      // Company onboarding
      supabase.from('company_onboarding').select('*').eq('user_id', userId),
      // Existing machines (for context)
      supabase.from('machines').select('*').eq('user_id', teamId),
      // Meeting rhythm planner
      supabase.from('meeting_rhythm_planner').select('*').eq('user_id', userId),
      // Playbooks
      supabase.from('playbooks').select('*').eq('user_id', userId),
      // Quarterly sprint canvas
      supabase.from('quarterly_sprint_canvas').select('*').eq('user_id', userId),
      // Key initiatives
      supabase.from('key_initiatives').select('*').eq('team_id', teamId),
      // Departments
      supabase.from('departments').select('*').eq('team_id', teamId),
      // Quarter planning
      supabase.from('quarter_planning').select('*').eq('team_id', teamId),
      // Battle plan (for context)
      supabase.from('battle_plan').select('*').eq('user_id', teamId),
    ];

    const results = await Promise.all(dataPromises);
    
    const companyData = {
      businessInfo: businessInfo || null,
      teamMembers: teamMembers || [],
      companyOnboarding: results[0].data || [],
      machines: results[1].data || [],
      meetingRhythmPlanner: results[2].data || [],
      playbooks: results[3].data || [],
      quarterlySprintCanvas: results[4].data || [],
      keyInitiatives: results[5].data || [],
      departments: results[6].data || [],
      quarterPlanning: results[7].data || [],
      battlePlan: results[8].data || [],
    };

    return companyData;
  } catch (error) {
    console.error("Error fetching company data:", error);
    return null;
  }
}

// Helper function to format company data for AI context
function formatCompanyContext(companyData: any) {
  if (!companyData) return '';
  
  const parts: string[] = ['📊 COMPANY DATA CONTEXT 📊\n'];
  
  // Format business info
  if (companyData.businessInfo) {
    const info = companyData.businessInfo;
    parts.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 👤 COMPANY INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Company Details:
- Business Name: ${info.business_name || 'Unknown'}
- Full Name: ${info.full_name || 'Unknown'}
- Email: ${info.email || 'Unknown'}
- Phone: ${info.phone_number || 'Unknown'}
- Role: ${info.role || 'user'}
- Job Title: ${info.job_title || 'Not specified'}
- Department: ${info.department || 'Not specified'}
- Manager: ${info.manager || 'Not specified'}
- Critical Accountabilities: ${info.critical_accountabilities ? JSON.stringify(info.critical_accountabilities) : 'None'}`);
  }

  // Format team members
  if (companyData.teamMembers && companyData.teamMembers.length > 0) {
    parts.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 👥 TEAM MEMBERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    companyData.teamMembers.forEach((member: any, index: number) => {
      parts.push(`
👤 Team Member #${index + 1}:
- Full Name: ${member.full_name}
- Job Title: ${member.job_title || 'Not specified'}
- Department: ${member.department || 'Not specified'}
- Role: ${member.role}
- Critical Accountabilities: ${member.critical_accountabilities ? JSON.stringify(member.critical_accountabilities) : 'None'}`);
    });
  }

  // Format existing machines (for context)
  if (companyData.machines && companyData.machines.length > 0) {
    parts.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ⚙️ EXISTING MACHINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    companyData.machines.forEach((machine: any, index: number) => {
      parts.push(`
🔧 Machine #${index + 1} (${machine.enginetype}):
- Name: ${machine.enginename || 'No name'}
- Type: ${machine.enginetype || 'Unknown'}
- Description: ${machine.description || 'No description'}
- Triggering Events: ${machine.triggeringevents ? JSON.stringify(machine.triggeringevents) : 'None'}
- Ending Events: ${machine.endingevent ? JSON.stringify(machine.endingevent) : 'None'}
- Actions/Activities: ${machine.actionsactivities ? JSON.stringify(machine.actionsactivities) : 'None'}`);
    });
  }

  // Format company onboarding
  if (companyData.companyOnboarding && companyData.companyOnboarding.length > 0) {
    parts.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🏢 COMPANY ONBOARDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    companyData.companyOnboarding.forEach((onboarding: any, index: number) => {
      parts.push(`
📝 Onboarding #${index + 1}:
- Company Name: ${onboarding.company_name || 'Unknown'}
- Industry: ${onboarding.industry || 'Unknown'}
- Company Size: ${onboarding.company_size || 'Unknown'}
- Revenue: ${onboarding.revenue || 'Unknown'}
- Goals: ${onboarding.goals || 'None'}`);
    });
  }

  // Format key initiatives
  if (companyData.keyInitiatives && companyData.keyInitiatives.length > 0) {
    parts.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🎯 KEY INITIATIVES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    companyData.keyInitiatives.forEach((initiative: any, index: number) => {
      parts.push(`
🎯 Initiative #${index + 1}:
- Name: ${initiative.name || 'No name'}
- Description: ${initiative.description || 'No description'}
- Status: ${initiative.status || 'Unknown'}
- Priority: ${initiative.priority || 'Unknown'}`);
    });
  }

  // Format battle plan (for context)
  if (companyData.battlePlan && companyData.battlePlan.length > 0) {
    parts.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📋 BATTLE PLAN CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    companyData.battlePlan.forEach((plan: any, index: number) => {
      parts.push(`
📋 Battle Plan #${index + 1}:
- Mission Statement: ${plan.missionstatement || 'Not specified'}
- Vision Statement: ${plan.visionstatement || 'Not specified'}
- Core Values: ${plan.corevalues ? JSON.stringify(plan.corevalues) : 'None'}
- Strategic Anchors: ${plan.strategicanchors ? JSON.stringify(plan.strategicanchors) : 'None'}
- Purpose Why: ${plan.purposewhy ? JSON.stringify(plan.purposewhy) : 'None'}
- Three Year Target: ${plan.threeyeartarget ? JSON.stringify(plan.threeyeartarget) : 'None'}`);
    });
  }

  return parts.join('\n');
}

// Helper function to generate company overview content
async function generateCompanyOverview(userId: string, teamId: string) {
  try {
    const companyData = await getCompanyData(userId, teamId);
    const companyContext = formatCompanyContext(companyData);

    const prompt = `You are an expert business analyst and strategist. Based on the provided company data, generate a comprehensive company overview that includes and make sure that everything is in the UK English:

${companyContext}

## 📋 TASK: Generate Company Overview Content

Please Analyse the company data above and generate the following sections for a comprehensive company overview and make sure that everything is in the UK English:



### 1. What You Do
Write a clear, concise description of what the business does, including keep it small and concise in one or two sentences and easy to understand:
- Core products/services
- Key value propositions
- Main business activities

### 2. Who You Serve
Describe the target audience and customer base keep it small and concise in one or two sentences and easy to understand:
- Ideal customer profiles
- Market segments served
- Customer demographics/characteristics

### 3. Internal Tasks
Generate 3-5 realistic internal tasks that would be relevant for this business keep it simple small and easy to understand:
- Task names should be clear and actionable
- Descriptions should explain the purpose and scope

### 4. Helpful Lists
Generate 3-5 items for each category keep it small and concise in one or two sentences and easy to understand:
- What's Right: Current strengths and things working well
- What's Wrong: Current challenges and areas for improvement
- What's Missing: Gaps, opportunities, or missing elements
- What's Confusing: Unclear areas or things that need clarification

### 5. Notes
Provide strategic insights and observations about the business based on the data keep it small and concise and easy to understand.

## 📝 RESPONSE FORMAT
Return ONLY a valid JSON object with this exact structure:

{
 
  "what_you_do": "comprehensive description of what the business does",
  "who_you_serve": "detailed description of target audience and customers",
  "internal_tasks": [
    {
      "name": "Task name",
      "description": "Task description"
    }
  ],
  "what_is_right": ["strength 1", "strength 2", "strength 3"],
  "what_is_wrong": ["challenge 1", "challenge 2", "challenge 3"],
  "what_is_missing": ["gap 1", "gap 2", "gap 3"],
  "what_is_confusing": ["confusion 1", "confusion 2", "confusion 3"],
  "notes": "strategic insights and observations"
}

IMPORTANT: 
- Make all content realistic and actionable
- Base recommendations on the actual company data provided
- Ensure all financial figures are reasonable for the business type and size
- Keep descriptions concise but comprehensive
- Focus on practical, implementable insights`;

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to generate valid JSON response');
    }
    
    const generatedData = JSON.parse(jsonMatch[0]);
    return generatedData;
  } catch (error) {
    console.error('Error generating company overview:', error);
    throw error;
  }
}

// Helper function to save generated content
async function saveGeneratedContent(userId: string, teamId: string, generatedData: any) {
  try {
    const supabase = await createClient();
    
    // Check if triage_planner entry exists - handle multiple rows
    const { data: existingData, error: fetchError } = await supabase
      .from("triage_planner")
      .select("id")
      .eq("user_id", teamId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      throw fetchError;
    }

    if (existingData && existingData.length > 0) {
      // Update the most recent existing entry
      const { error: updateError } = await supabase
        .from("triage_planner")
        .update({
          company_info: generatedData.company_info,
          what_you_do: generatedData.what_you_do,
          who_you_serve: generatedData.who_you_serve,
          internal_tasks: generatedData.internal_tasks,
          what_is_right: generatedData.what_is_right,
          what_is_wrong: generatedData.what_is_wrong,
          what_is_missing: generatedData.what_is_missing,
          what_is_confusing: generatedData.what_is_confusing,
          notes: generatedData.notes,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingData[0].id);

      if (updateError) throw updateError;
    } else {
      // Create new entry
      const { error: insertError } = await supabase
        .from("triage_planner")
        .insert({
          user_id: teamId,
          company_info: generatedData.company_info,
          what_you_do: generatedData.what_you_do,
          who_you_serve: generatedData.who_you_serve,
          internal_tasks: generatedData.internal_tasks,
          what_is_right: generatedData.what_is_right,
          what_is_wrong: generatedData.what_is_wrong,
          what_is_missing: generatedData.what_is_missing,
          what_is_confusing: generatedData.what_is_confusing,
          notes: generatedData.notes
        });

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving generated content:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamId = await getTeamId(userId);
    if (!teamId) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action, generatedData } = body;

    if (action === 'generate') {
      const generatedContent = await generateCompanyOverview(userId, teamId);
      return NextResponse.json({ 
        success: true, 
        data: generatedContent 
      });
    } else if (action === 'save') {
      if (!generatedData) {
        return NextResponse.json({ error: 'No generated data provided' }, { status: 400 });
      }
      
      await saveGeneratedContent(userId, teamId, generatedData);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Company Overview API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
} 