import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from "@/utils/supabase/server";

// Ensure the API key is available
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set in the environment variables.");
}
 
const genAI = new GoogleGenerativeAI(apiKey);

// Helper function to get user ID from request
async function getUserId(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id; 
  } catch (error) {
    console.error("Error getting user session:", error);
    return null;
  }
}

// Helper function to get user business info and onboarding data
async function getUserContext(userId: string) {
  if (!userId) return null;

  try {
    const supabase = await createClient();
    
    // Fetch business info
    const { data: businessInfo, error: businessError } = await supabase
      .from('business_info')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (businessError && businessError.code !== "PGRST116") {
      console.error("Error fetching business info:", businessError);
    }
    
    // Fetch onboarding data
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('company_onboarding')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (onboardingError && onboardingError.code !== "PGRST116") {
      console.error("Error fetching onboarding data:", onboardingError);
    }

    return {
      businessInfo: businessInfo || null,
      onboardingData: onboardingData || null
    };
  } catch (error) {
    console.error("Error fetching user context:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, action, selectedText, context } = await req.json();

    if (!content || !action) {
      return NextResponse.json({ error: "Content and action are required." }, { status: 400 });
    }

    // Get user context for better AI assistance
    const userId = await getUserId(req);
    const userContext = userId ? await getUserContext(userId) : null;
    
    // Prepare user context string for the AI
    let userContextString = '';
    if (userContext) {
      const parts = [];
      
      if (userContext.businessInfo) {
        const info = userContext.businessInfo;
        parts.push(`Business Information:
- Business Name: ${info.business_name || 'Not specified'}
- Full Name: ${info.full_name || 'Not specified'}
- Role: ${info.role || 'Not specified'}
- Job Title: ${info.job_title || 'Not specified'}
- Department: ${info.department || 'Not specified'}`);
      }
      
      if (userContext.onboardingData) {
        const onboarding = userContext.onboardingData;
        parts.push(`Onboarding Status: ${onboarding.completed ? 'Completed' : 'In Progress'}`);
        if (onboarding.onboarding_data) {
          parts.push(`Onboarding Data: ${JSON.stringify(onboarding.onboarding_data)}`);
        }
      }
      
      if (parts.length > 0) {
        userContextString = `\n\nUSER CONTEXT:\n${parts.join('\n\n')}\n\n`;
      }
    }

    // Define prompts for each action
    const prompts = {
      simplify: `You are an AI editor. Please simplify the following HTML content while keeping the core meaning intact. Make it easier to understand and more concise. and make sure to always use UK English.${userContextString}

IMPORTANT: Return ONLY the clean HTML content without any markdown formatting, code blocks, or backticks. Do not wrap your response in \`\`\`html or any other formatting.

${content}`,

      grammar: `You are an AI editor. Please fix any spelling and grammar errors in the following HTML content. Maintain the original tone and meaning, but correct any mistakes and make sure to always use UK English and if it's in a USA english, please convert it to UK English.${userContextString}

IMPORTANT: Return ONLY the clean HTML content without any markdown formatting, code blocks, or backticks. Do not wrap your response in \`\`\`html or any other formatting.

${content}`,

        shorter: `You are an AI editor. Please make the following HTML content shorter while preserving all the key information and main points. Be concise but comprehensive and make sure to always use UK English.${userContextString}

IMPORTANT: Return ONLY the clean HTML content without any markdown formatting, code blocks, or backticks. Do not wrap your response in \`\`\`html or any other formatting.

${content}`,

      longer: `You are an AI editor. Please expand the following HTML content with more detail, examples, and explanations. Add valuable information that enhances the content without changing the core message and make sure to always use UK English.${userContextString}

IMPORTANT: Return ONLY the clean HTML content without any markdown formatting, code blocks, or backticks. Do not wrap your response in \`\`\`html or any other formatting.

${content}`,

      format: `You are an HTML formatter. Your ONLY job is to improve the HTML structure of the following content.${userContextString}

RULES:
- DO NOT change ANY text content - keep every word exactly the same
- DO NOT add any new content, examples, or explanations
- DO NOT add extra line breaks or spacing and if there are any, remove them
- ONLY fix HTML tags and structure but remove any extra line breaks or spacing

WHAT TO DO:
- Convert plain text titles to proper heading tags (h1, h2, h3, etc.)
- Ensure paragraphs are properly wrapped in <p> tags
- Convert bullet points to proper <ul> and <li> tags
- Fix any broken or malformed HTML
- Keep the content exactly as it is, just with better HTML structure
- Remove any extra line breaks or spacing and if there are any, remove them

EXAMPLE:
Input: "Title\nSome content here.\n• Bullet point 1\n• Bullet point 2"
Output: "<h2>Title</h2><p>Some content here.</p><ul><li>Bullet point 1</li><li>Bullet point 2</li></ul>"

Return ONLY the HTML content - no explanations, no markdown, no extra formatting.

${content}`
    };

    // Build the appropriate prompt
    let prompt = prompts[action as keyof typeof prompts];
    
    if (!prompt) {
      return NextResponse.json({ error: "Invalid action specified. Valid actions: simplify, grammar, shorter, longer, format" }, { status: 400 });
    }

    // Add context if processing selected text
    if (selectedText && context) {
      const actionDescription = 
        action === 'simplify' ? 'simplify this text to make it clearer and easier to understand while preserving the key information' :
        action === 'grammar' ? 'fix any spelling and grammar issues in this text and ensure it uses proper UK English conventions' :
        action === 'shorter' ? 'make this text more concise while keeping all essential information and main points' :
        action === 'longer' ? 'expand this text with more details, examples and explanations that enhance the content without changing its core message' :
        action === 'format' ? 'improve the HTML structure and formatting of this text while keeping the content exactly the same' : 'modify';
        
      prompt = `You are helping edit a document. Here's the context of the full document:

FULL DOCUMENT CONTEXT:
${context}

Now, please ${actionDescription} this specific selected portion:

SELECTED TEXT TO MODIFY:
${selectedText}

Return only the modified version of the selected text in the same format (HTML if HTML, plain text if plain text). Do not include the full document context in your response.`;
    }

    // Use the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-001" });

    const result = await model.generateContent(prompt);
    const response = result.response;
    let enhancedContent = response.text();

    // Clean up the response - remove markdown code blocks and other unwanted formatting
    enhancedContent = enhancedContent
      .replace(/```html\s*/gi, '') // Remove ```html
      .replace(/```\s*/g, '') // Remove closing ```
      .replace(/^html\s*/gi, '') // Remove leading 'html' text
      .trim();

    // Additional cleanup for common AI formatting issues
    if (enhancedContent.startsWith('<') && enhancedContent.endsWith('>')) {
      // Looks like clean HTML, keep as is
    } else if (enhancedContent.includes('<') && enhancedContent.includes('>')) {
      // Contains HTML but might have extra text, try to extract just the HTML
      const htmlMatch = enhancedContent.match(/<[\s\S]*>/);
      if (htmlMatch) {
        enhancedContent = htmlMatch[0];
      }
    }

    return NextResponse.json({ 
      enhancedContent: enhancedContent.trim(),
      originalContent: selectedText || content,
      action 
    });

  } catch (error: any) {
    console.error("Editor AI Enhancement Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to enhance content with AI." 
    }, { status: 500 });
  }
} 