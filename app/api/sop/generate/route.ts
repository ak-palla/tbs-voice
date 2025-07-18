import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/utils/supabase/server';
import { getTeamId } from '@/utils/supabase/teams';
<<<<<<< HEAD
import { responseQualityOptimizer } from '@/lib/response-quality-optimizer';
=======
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set in the environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
<<<<<<< HEAD
=======
    // Get the current user
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = await getTeamId(supabase, user.id);
    const { onboardingData, customPrompt = "" } = await req.json();

<<<<<<< HEAD
=======
    // If no onboarding data provided, fetch from database for the team
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    let dataToUse = onboardingData;
    if (!dataToUse) {
      const { data: onboardingRecord, error: fetchError } = await supabase
        .from('company_onboarding')
        .select('onboarding_data')
        .eq('user_id', teamId)
        .eq('completed', true)
        .single();

      if (fetchError || !onboardingRecord) {
        return NextResponse.json({ 
          error: "No completed onboarding data found for the team. Please ensure the admin has completed the onboarding process." 
        }, { status: 400 });
      }

      dataToUse = onboardingRecord.onboarding_data;
    }

<<<<<<< HEAD
=======
    // Check if team already has an SOP and get the highest version number
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    const { data: existingSops, error: sopCheckError } = await supabase
      .from('sop_data')
      .select('id, version, is_current')
      .eq('user_id', teamId)
      .order('version', { ascending: false });

    if (sopCheckError) {
      console.error("Error checking existing SOPs:", sopCheckError);
      return NextResponse.json({ error: "Failed to check existing SOPs" }, { status: 500 });
    }

<<<<<<< HEAD
=======
    // Determine the next version number
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    let nextVersion = 1;
    if (existingSops && existingSops.length > 0) {
      const highestVersion = existingSops[0].version;
      nextVersion = highestVersion + 1;
<<<<<<< HEAD
=======
      console.log(`📋 Found ${existingSops.length} existing SOPs for the team. Creating version ${nextVersion}`);

      // Mark all current SOPs as not current for the team
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      await supabase
        .from('sop_data')
        .update({ is_current: false })
        .eq('user_id', teamId)
        .eq('is_current', true);
<<<<<<< HEAD
    }

    const prompt = `You are an expert business consultant creating a comprehensive Standard Operating Procedure (SOP) document for a trades business. 

Based on the following company information, create a detailed, professional SOP that covers all critical business operations.
=======
      console.log('✅ Marked existing SOPs as not current for the team');
    } else {
      console.log('🆕 Creating first SOP for the team (version 1)');
    }

    // Build comprehensive prompt for SOP generation
    const prompt = `You are an expert business consultant creating a comprehensive Standard Operating Procedure (SOP) document for a trades business. 

Based on the following company information, create a detailed, professional SOP that covers all critical business operations. Important: Please make sure all the writing is in UK English.
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

COMPANY INFORMATION:
${Object.entries(dataToUse).map(([key, value]) => {
  if (value && typeof value === 'string' && value.trim() !== '') {
    const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `${formattedKey}: ${value}`;
  }
}).filter(Boolean).join('\n')}

${customPrompt ? `\nADDITIONAL REQUIREMENTS: ${customPrompt}` : ''}

CREATE A COMPREHENSIVE SOP DOCUMENT that includes:

1. **Executive Summary** - Brief overview of the company and SOP purpose
2. **Company Overview** - Mission, vision, and key business information
3. **Organizational Structure** - Roles, responsibilities, and chain of command
4. **Core Business Processes** - Step-by-step procedures for key operations
5. **Sales & Customer Journey** - From lead generation to project completion
6. **Quality Control** - Standards and procedures for maintaining quality
7. **Safety Protocols** - Essential safety procedures and compliance
8. **Financial Procedures** - Invoicing, payments, and financial management
9. **Communication Protocols** - Internal and external communication standards
10. **Emergency Procedures** - Crisis management and contingency plans
11. **Training & Development** - Staff onboarding and continuous education
12. **Performance Metrics** - KPIs and measurement procedures

<<<<<<< HEAD
The SOP should be professional, comprehensive, and tailored specifically to this business's needs and industry.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const qualityEnhancement = responseQualityOptimizer.getPromptEnhancement('sop-generation', 'sop-document', 'text');
    const generationConfig = responseQualityOptimizer.getGenerationConfig('sop-generation', 'text');

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt + qualityEnhancement }] }],
      generationConfig,
    });

    const sopContent = result.response.text();

    const companyName = dataToUse.company_name_official_registered || 'Company';
    const title = `${companyName} - Standard Operating Procedures`;

=======
FORMAT REQUIREMENTS:
- Use clear headings and subheadings
- Include numbered lists and bullet points for easy reading
- Write in UK English
- Be specific and actionable
- Include realistic timelines where applicable
- Make it practical for immediate implementation

The SOP should be professional, comprehensive, and tailored specifically to this business's needs and industry.`;

    // Generate SOP using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-001" });
    const result = await model.generateContent(prompt);
    const sopContent = result.response.text();

        // Generate a title based on company name
    const companyName = dataToUse.company_name_official_registered || 'Company';
    const title = `${companyName} - Battle Plan`;

    // Save SOP to database for the team
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    const { data: sopRecord, error: sopError } = await supabase
      .from('sop_data')
      .insert({
        user_id: teamId,
        title,
        content: sopContent,
        version: nextVersion,
        is_current: true,
        metadata: {
          generated_from: 'onboarding_data',
          custom_prompt: customPrompt,
          generation_date: new Date().toISOString(),
<<<<<<< HEAD
          model_used: 'gemini-1.5-flash'
=======
          model_used: 'gemini-2.0-flash-lite-001'
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
        }
      })
      .select()
      .single();

    if (sopError) {
      console.error("Error saving SOP:", sopError);
      return NextResponse.json({ error: "Failed to save SOP" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sop: sopRecord
    });

  } catch (error: any) {
<<<<<<< HEAD
    console.error("SOP Generation Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to generate SOP" 
=======
    console.error("Battle Plan Generation Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to generate Battle Plan" 
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    }, { status: 500 });
  }
} 