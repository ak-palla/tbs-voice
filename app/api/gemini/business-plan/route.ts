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
    
    // Check if battle plan already exists
    const { data: existingPlan, error: fetchError } = await supabase
      .from("battle_plan")
      .select("*")
      .eq("user_id", teamId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const planData = {
      user_id: teamId,
      missionstatement: generatedData.missionstatement,
      visionstatement: generatedData.visionstatement,
      corevalues: generatedData.corevalues,
      strategicanchors: generatedData.strategicanchors,
      purposewhy: generatedData.purposewhy,
      threeyeartarget: generatedData.threeyeartarget,
    };

    let result;
    if (existingPlan) {
      // Update existing plan
      result = await supabase
        .from("battle_plan")
        .update(planData)
        .eq("id", existingPlan.id)
        .select("*")
        .single();
    } else {
      // Create new plan
      result = await supabase
        .from("battle_plan")
        .insert(planData)
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
You are an expert business strategist and consultant helping to create a comprehensive Business Plan for a Trade Business School Bootcamp participant. Based on the comprehensive company data provided below, you will help develop their strategic business foundation and make sure that everything is in the UK English.

A Business Plan is the strategic foundation that guides all business decisions and operations. Your role is to Analyse the company's current situation and create clear, actionable strategic elements.

${companyContext}

Please Analyse the company's business information and create a comprehensive Business Plan with the following components and make sure that everything is in the UK English:

1. **Mission Statement**: A clear, concise statement (1-2 sentences) that defines:
   - What the company does
   - Who they serve
   - How they create value
   - Should be inspiring and memorable

2. **Vision Statement**: A compelling future-focused statement (1-2 sentences) that describes:
   - Where the company wants to be in the future
   - The impact they want to make
   - Should be aspirational and motivating

3. **Core Values** (5-7 items): The fundamental beliefs and principles that guide the company. Focus on:
   - What they stand for
   - How they operate
   - What makes them unique
   - Values that align with their business model

4. **Strategic Anchors** (3-5 items): Key strategic decisions that define their business direction. Include:
   - Market positioning
   - Competitive advantages
   - Key differentiators
   - Strategic focus areas

5. **Purpose/Why** (3-5 items): The deeper reasons why the company exists beyond profit. Consider:
   - Their impact on customers
   - Their contribution to society
   - Their long-term vision
   - What drives them beyond money

6. **Three Year Targets** (3-5 items): Specific, measurable goals for the next three years. Include:
   - Revenue targets
   - Market expansion goals
   - Operational improvements
   - Team growth objectives

CRITICAL: You must respond with ONLY a valid JSON object. Do not include any explanatory text before or after the JSON. The JSON must have this exact structure:

{
  "missionstatement": "Your mission statement here",
  "visionstatement": "Your vision statement here",
  "corevalues": [
    {"value": "First core value"},
    {"value": "Second core value"},
    {"value": "Third core value"}
  ],
  "strategicanchors": [
    {"value": "First strategic anchor"},
    {"value": "Second strategic anchor"},
    {"value": "Third strategic anchor"}
  ],
  "purposewhy": [
    {"value": "First purpose/why"},
    {"value": "Second purpose/why"},
    {"value": "Third purpose/why"}
  ],
  "threeyeartarget": [
    {"value": "First three year target"},
    {"value": "Second three year target"},
    {"value": "Third three year target"}
  ]
}

IMPORTANT RULES:
- Do NOT include empty strings or null values
- Each array must contain at least 3 items
- All text must be specific and actionable
- No placeholder text like "string" or "description"
- Base everything on the actual company data provided
- Focus on their specific industry, business model, and current situation
- Make all statements practical and implementable for their specific business
- Ensure alignment with their existing machines and business processes
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
        if (!generatedData.missionstatement || generatedData.missionstatement.trim() === '') {
          throw new Error("Mission statement is empty or invalid");
        }

        if (!generatedData.visionstatement || generatedData.visionstatement.trim() === '') {
          throw new Error("Vision statement is empty or invalid");
        }

        // Ensure arrays exist and have content
        if (!Array.isArray(generatedData.corevalues) || generatedData.corevalues.length === 0) {
          throw new Error("Core values array is empty or invalid");
        }

        if (!Array.isArray(generatedData.strategicanchors) || generatedData.strategicanchors.length === 0) {
          throw new Error("Strategic anchors array is empty or invalid");
        }

        if (!Array.isArray(generatedData.purposewhy) || generatedData.purposewhy.length === 0) {
          throw new Error("Purpose/why array is empty or invalid");
        }

        if (!Array.isArray(generatedData.threeyeartarget) || generatedData.threeyeartarget.length === 0) {
          throw new Error("Three year targets array is empty or invalid");
        }

        // Clean up array items - remove any empty values
        generatedData.corevalues = generatedData.corevalues
          .filter((item: any) => item && item.value && item.value.trim() !== '')
          .map((item: any) => ({ value: item.value.trim() }));

        generatedData.strategicanchors = generatedData.strategicanchors
          .filter((item: any) => item && item.value && item.value.trim() !== '')
          .map((item: any) => ({ value: item.value.trim() }));

        generatedData.purposewhy = generatedData.purposewhy
          .filter((item: any) => item && item.value && item.value.trim() !== '')
          .map((item: any) => ({ value: item.value.trim() }));

        generatedData.threeyeartarget = generatedData.threeyeartarget
          .filter((item: any) => item && item.value && item.value.trim() !== '')
          .map((item: any) => ({ value: item.value.trim() }));

        // Ensure we have minimum items
        if (generatedData.corevalues.length < 3) {
          throw new Error("Not enough core values generated");
        }

        if (generatedData.strategicanchors.length < 2) {
          throw new Error("Not enough strategic anchors generated");
        }

        if (generatedData.purposewhy.length < 2) {
          throw new Error("Not enough purpose/why items generated");
        }

        if (generatedData.threeyeartarget.length < 2) {
          throw new Error("Not enough three year targets generated");
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
    console.error("Error in business plan API:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 