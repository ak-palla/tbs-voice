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
      // Battle plan
      supabase.from('battle_plan').select('*').eq('user_id', userId),
      // Company onboarding
      supabase.from('company_onboarding').select('*').eq('user_id', userId),
      // Existing machines (including growth machine for context)
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
    ];

    const results = await Promise.all(dataPromises);
    
    const companyData = {
      businessInfo: businessInfo || null,
      teamMembers: teamMembers || [],
      battlePlan: results[0].data || [],
      companyOnboarding: results[1].data || [],
      machines: results[2].data || [],
      meetingRhythmPlanner: results[3].data || [],
      playbooks: results[4].data || [],
      quarterlySprintCanvas: results[5].data || [],
      keyInitiatives: results[6].data || [],
      departments: results[7].data || [],
      quarterPlanning: results[8].data || [],
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

  // Format existing machines (especially growth machine for context)
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

  // Format battle plan
  if (companyData.battlePlan && companyData.battlePlan.length > 0) {
    parts.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ⚔️ BATTLE PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    companyData.battlePlan.forEach((plan: any, index: number) => {
      parts.push(`
📋 Battle Plan #${index + 1}:
- Title: ${plan.title || 'No title'}
- Description: ${plan.description || 'No description'}
- Status: ${plan.status || 'Unknown'}
- Priority: ${plan.priority || 'Unknown'}`);
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

  // Format departments
  if (companyData.departments && companyData.departments.length > 0) {
    parts.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🏢 DEPARTMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    companyData.departments.forEach((dept: any, index: number) => {
      parts.push(`
🏢 Department #${index + 1}:
- Name: ${dept.name || 'No name'}
- Description: ${dept.description || 'No description'}`);
    });
  }

  // Format quarter planning
  if (companyData.quarterPlanning && companyData.quarterPlanning.length > 0) {
    parts.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📅 QUARTER PLANNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    companyData.quarterPlanning.forEach((plan: any, index: number) => {
      parts.push(`
📅 Quarter Plan #${index + 1}:
- Quarter: ${plan.quarter || 'Unknown'}
- Year: ${plan.year || 'Unknown'}
- Goals: ${plan.goals || 'None'}
- Objectives: ${plan.objectives || 'None'}`);
    });
  }

  return parts.join('\n');
}

// Helper function to save generated content to database
async function saveGeneratedContent(userId: string, teamId: string, generatedData: any) {
  try {
    const supabase = await createClient();
    
    // Check if fulfillment machine already exists
    const { data: existingMachine, error: fetchError } = await supabase
      .from("machines")
      .select("*")
      .eq("user_id", teamId)
      .eq("enginetype", "FULFILLMENT")
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const machineData = {
      user_id: teamId,
      enginename: generatedData.enginename,
      enginetype: "FULFILLMENT",
      description: generatedData.description,
      triggeringevents: generatedData.triggeringevents,
      endingevent: generatedData.endingevent,
      actionsactivities: generatedData.actionsactivities,
    };

    let result;
    if (existingMachine) {
      // Update existing machine
      result = await supabase
        .from("machines")
        .update(machineData)
        .eq("id", existingMachine.id)
        .select("*")
        .single();
    } else {
      // Create new machine
      result = await supabase
        .from("machines")
        .insert(machineData)
        .select("*")
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    return result.data;
  } catch (error) {
    console.error("Error saving generated content:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = await getTeamId(userId);
    if (!teamId) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Read the request body once
    const body = await req.json();
    const { action, generatedData } = body;

    if (action === "generate") {
      // Generate content using Gemini
      const companyData = await getCompanyData(userId, teamId);
      const companyContext = formatCompanyContext(companyData);

      const prompt = `
You are an expert business process consultant helping to map out a Fulfillment Machine for a Trade Business School Bootcamp participant. Based on the comprehensive company data provided below, you will help organize their service delivery information into a structured Fulfillment Machine Planner and make sure that everything is in the UK English.

A Fulfillment Machine is a systematic process that ensures consistent, high-quality service delivery and customer satisfaction. Your role is to Analyse the company's current service delivery operations and create a clear, actionable fulfillment process.

${companyContext}

Please Analyse the company's business information and create a comprehensive Fulfillment Machine with the following components and make sure that everything is in the UK English:

1. **Engine Name**: engine name should be simple and easy to understand and related to their business, product and process.

2. **Description**: A clear, concise explanation (1-2 paragraphs) that covers:
   - What their primary service delivery process is
   - How they ensure quality and customer satisfaction
   - The key steps in their service delivery
   - Why this approach works for their specific business model

3. **Triggering Events** (5-8 items): The specific events that kick off their fulfillment process. Focus on:
   - Customer purchases or service requests
   - Project initiation
   - Service delivery triggers
   - Measurable starting points

4. **Ending Events** (3-5 items): Clear outcomes that mark successful completion. Include:
   - Service delivery completion
   - Customer satisfaction achieved
   - Payment received
   - Review request sent
   - Measurable service results

5. **Actions/Activities** (8-12 items): The major steps involved in their fulfillment process. Structure as:
   - Service preparation activities
   - Delivery execution steps
   - Quality assurance activities
   - Customer communication and follow-up
   - All in logical, sequential order

CRITICAL: You must respond with ONLY a valid JSON object. Do not include any explanatory text before or after the JSON. The JSON must have this exact structure:

{
  "enginename": "Your Engine Name Here",
  "description": "Your detailed description here",
  "triggeringevents": [
    {"value": "First triggering event"},
    {"value": "Second triggering event"},
    {"value": "Third triggering event"}
  ],
  "endingevent": [
    {"value": "First ending event"},
    {"value": "Second ending event"},
    {"value": "Third ending event"}
  ],
  "actionsactivities": [
    {"value": "First action/activity"},
    {"value": "Second action/activity"},
    {"value": "Third action/activity"}
  ]
}

IMPORTANT RULES:
- Do NOT include empty strings or null values
- Each array must contain at least 3 items
- All text must be specific and actionable
- No placeholder text like "string" or "description"
- Base everything on the actual company data provided
- Focus on their primary service delivery and current business model
- Make the process practical and implementable for their specific business
- Ensure the fulfillment process aligns with their growth machine (if they have one)
`;

      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      let generatedData;
      try {
        // Clean the response text
        let cleanedText = text.trim();
        
        // Remove any markdown code blocks
        cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          generatedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }

        // Validate and clean the generated data
        if (!generatedData.enginename || generatedData.enginename.trim() === '') {
          throw new Error("Engine name is empty or invalid");
        }

        if (!generatedData.description || generatedData.description.trim() === '') {
          throw new Error("Description is empty or invalid");
        }

        // Ensure arrays exist and have content
        if (!Array.isArray(generatedData.triggeringevents) || generatedData.triggeringevents.length === 0) {
          throw new Error("Triggering events array is empty or invalid");
        }

        if (!Array.isArray(generatedData.endingevent) || generatedData.endingevent.length === 0) {
          throw new Error("Ending events array is empty or invalid");
        }

        if (!Array.isArray(generatedData.actionsactivities) || generatedData.actionsactivities.length === 0) {
          throw new Error("Actions/activities array is empty or invalid");
        }

        // Clean up array items - remove any empty values
        generatedData.triggeringevents = generatedData.triggeringevents
          .filter((item: any) => item && item.value && item.value.trim() !== '')
          .map((item: any) => ({ value: item.value.trim() }));

        generatedData.endingevent = generatedData.endingevent
          .filter((item: any) => item && item.value && item.value.trim() !== '')
          .map((item: any) => ({ value: item.value.trim() }));

        generatedData.actionsactivities = generatedData.actionsactivities
          .filter((item: any) => item && item.value && item.value.trim() !== '')
          .map((item: any) => ({ value: item.value.trim() }));

        // Ensure we have minimum items
        if (generatedData.triggeringevents.length < 3) {
          throw new Error("Not enough triggering events generated");
        }

        if (generatedData.endingevent.length < 2) {
          throw new Error("Not enough ending events generated");
        }

        if (generatedData.actionsactivities.length < 5) {
          throw new Error("Not enough actions/activities generated");
        }

      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        console.error("Raw response:", text);
        return NextResponse.json({ 
          error: "Failed to parse AI response",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
          rawResponse: text 
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: generatedData
      });

    } else if (action === "save") {
      // Save the generated content to database
      if (!generatedData) {
        return NextResponse.json({ error: "No data provided" }, { status: 400 });
      }

      const savedData = await saveGeneratedContent(userId, teamId, generatedData);

      return NextResponse.json({
        success: true,
        data: savedData
      });

    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (error) {
    console.error("Error in fulfillment machine API:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 