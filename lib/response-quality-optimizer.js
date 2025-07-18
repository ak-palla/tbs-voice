/**
 * Response Quality Optimizer - JavaScript Version
 * Implements "Quality Over Quantity" principles for AI responses
 */

class ResponseQualityOptimizer {
  
  constructor() {
    this.pipelineConfigs = new Map([
      ['main-chat', {
        name: 'Main Chat',
        purpose: 'General business advisory and problem-solving',
        responseStyle: 'structured',
        maxTokens: 350, // Increased from 300 to allow better formatting
        qualityPrinciples: [
          'Answer the specific question asked directly',
          'Use proper markdown formatting with clear structure',
          'Include numbered lists and bullet points for clarity',
          'Provide actionable guidance with logical flow',
          'End with specific immediate next steps',
          'Balance completeness with conciseness',
          'Maintain professional formatting throughout'
        ]
      }],
      ['innovation-chat', {
        name: 'Innovation Machine',
        purpose: 'Creative business innovation and opportunities',
        responseStyle: 'structured',
        maxTokens: 1000, // Slightly higher for creative exploration
        qualityPrinciples: [
          'Focus on 1-2 innovative ideas maximum',
          'Provide implementation feasibility',
          'Include ROI considerations',
          'Offer concrete first steps',
          'Balance creativity with practicality'
        ]
      }],
      ['voice-chat', {
        name: 'Voice Assistant',
        purpose: 'Real-time voice interaction and quick answers',
        responseStyle: 'conversational',
        maxTokens: 400, // Much shorter for voice
        qualityPrinciples: [
          'Keep responses under 30 seconds to read',
          'Use conversational language',
          'Prioritize immediate actionability',
          'Avoid complex formatting',
          'Focus on single clear answer'
        ]
      }],
      ['profile-chat', {
        name: 'Profile Assistant',
        purpose: 'Personalized guidance based on user profile',
        responseStyle: 'conversational',
        maxTokens: 600,
        qualityPrinciples: [
          'Reference user context specifically',
          'Provide personalized recommendations',
          'Keep advice tailored and relevant',
          'Suggest profile-specific tools',
          'Focus on user\'s current goals'
        ]
      }],
      ['enhanced-chat', {
        name: 'Enhanced Contextual Chat',
        purpose: 'Context-aware conversations with deep understanding',
        responseStyle: 'structured',
        maxTokens: 700,
        qualityPrinciples: [
          'Leverage provided context effectively',
          'Synthesize information concisely',
          'Provide context-aware recommendations',
          'Avoid repeating known information',
          'Focus on value-added insights'
        ]
      }],
      ['dashboard-chat', {
        name: 'AI Dashboard',
        purpose: 'Business analytics and performance insights',
        responseStyle: 'detailed',
        maxTokens: 900, // Higher for data analysis
        qualityPrinciples: [
          'Focus on key metrics and trends',
          'Provide data-driven insights',
          'Suggest specific improvements',
          'Include measurable outcomes',
          'Prioritize actionable analytics'
        ]
      }],
      ['content-generation', {
        name: 'Content Generator',
        purpose: 'Quick content creation and text generation',
        responseStyle: 'concise',
        maxTokens: 300, // Very short for quick content
        qualityPrinciples: [
          'Generate exactly what was requested',
          'Avoid unnecessary explanations',
          'Focus on quality over quantity',
          'Match requested tone and style',
          'Provide ready-to-use content'
        ]
      }],
      ['websocket-voice', {
        name: 'WebSocket Voice',
        purpose: 'Real-time voice processing and responses',
        responseStyle: 'conversational',
        maxTokens: 350,
        qualityPrinciples: [
          'Optimize for speech synthesis',
          'Use natural conversation flow',
          'Keep responses under 25 seconds',
          'Prioritize clarity over completeness',
          'Focus on immediate value'
        ]
      }]
    ]);
  }

  /**
   * Get optimized generation config for a specific pipeline
   */
  getGenerationConfig(pipelineId, context = 'text') {
    const pipeline = this.pipelineConfigs.get(pipelineId);
    if (!pipeline) {
      console.warn(`⚠️ [QUALITY] Unknown pipeline: ${pipelineId}, using defaults`);
      return this.getDefaultConfig();
    }

    // Adjust tokens based on context
    let maxTokens = pipeline.maxTokens;
    if (context === 'voice') {
      maxTokens = Math.min(maxTokens, 400); // Voice responses should be shorter
    } else if (context === 'streaming') {
      maxTokens = maxTokens * 0.8; // Slightly shorter for streaming
    }

    return {
      maxOutputTokens: Math.floor(maxTokens),
      temperature: this.getOptimalTemperature(pipeline.responseStyle),
      topK: 32, // Reduced for more focused responses
      topP: 0.85, // Reduced for more focused responses
    };
  }

  /**
   * Generate quality-focused system prompt addition
   */
  generateQualityPrompt(pipelineId, userQuery) {
    const pipeline = this.pipelineConfigs.get(pipelineId);
    if (!pipeline) return this.getDefaultQualityPrompt();

    const queryLength = userQuery?.length || 0;
    const isSimpleQuery = queryLength < 50;
    
    // Analyze query complexity more strictly
    const isYesNoQuestion = userQuery && /\b(is this|should i|would it be|is it)\b.*\?/i.test(userQuery);
    const isBasicQuestion = userQuery && (isYesNoQuestion || /\b(what|how|why|when|where)\b.*\?/i.test(userQuery) && queryLength < 100);
    
    // Calculate strict word limits based on token limits
    const maxWords = Math.floor(pipeline.maxTokens * 0.75); // Conservative conversion: tokens to words
    const maxChars = Math.floor(pipeline.maxTokens * 3.5); // Conservative conversion: tokens to characters
    
    let qualityPrompt = `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 RESPONSE QUALITY OPTIMIZATION - ${pipeline.name.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 **CORE PRINCIPLE: Quality Over Quantity**
Your goal is to provide the MOST HELPFUL response, not the LONGEST response.

🚨 **CRITICAL LENGTH REQUIREMENTS:**
   • TARGET: ${maxWords} words (${maxChars} characters) - Focus on quality structure
   • ${isBasicQuestion ? 'BASIC QUESTION: Maximum 60 words with proper format' : isSimpleQuery ? 'SIMPLE QUERY: Maximum 100 words with clear structure' : 'COMPLEX QUERY: Maximum ' + maxWords + ' words with excellent formatting'}
   • ALWAYS use proper markdown formatting - headers, bullets, numbered lists
   • Maintain logical flow and professional structure
   • Prioritize clarity and actionability over extreme brevity

📋 **${pipeline.name} Quality Standards:**
${pipeline.qualityPrinciples.map(principle => `   • ${principle}`).join('\n')}

⚡ **Response Optimization Rules:**
   • PRIORITIZE: Clear structure, actionable insights, proper formatting
   • USE: Headers (##), numbered lists (1. 2. 3.), bullet points (-)
   • STRUCTURE: Logical flow from problem → solution → next steps
   • LINKAGE: Include relevant tool links [Tool Name](/route) when helpful
   • FOCUS: Answer the exact question with professional presentation

🚫 **AVOID:**
   • Wall-of-text responses without structure
   • Missing headers and bullet points
   • Overly verbose explanations
   • Poor formatting that hurts readability
   • Cutting off mid-sentence or mid-point

✅ **ALWAYS DO:**
   • Use proper markdown structure (## headers, numbered lists, bullets)
   • Answer the question directly with clear formatting
   • Provide actionable guidance in organized sections
   • Include specific next steps in a logical sequence
   • Maintain professional presentation throughout
   • ${isYesNoQuestion ? 'Start with YES/NO then structured explanation' : 'Use appropriate structure for the question type'}

🎯 **Response Style: ${pipeline.responseStyle.toUpperCase()}**
${this.getStyleGuidelines(pipeline.responseStyle)}

🚨 **FORMATTING REQUIREMENTS:**
Your response MUST include:
1. Clear headers using ## for main sections
2. Numbered lists (1. 2. 3.) for sequential steps
3. Bullet points (-) for related items
4. Proper spacing and structure
5. Complete sentences and thoughts

**CRITICAL**: ${isBasicQuestion ? 'Even basic questions need proper formatting (under 60 words)' : 'This query requires well-structured response under ' + maxWords + ' words with excellent formatting'}

${isYesNoQuestion ? `
🎯 **YES/NO QUESTION DETECTED**
MANDATORY FORMAT:
**YES** or **NO** + structured explanation

Example:
**YES**, this is highly effective for business growth.

## Why This Works
- Point 1 with clear benefit
- Point 2 with specific advantage

## Next Steps
1. First action to take
2. Second implementation step

TOTAL: Under 80 words with proper structure
` : ''}

🔥 **FINAL REMINDER: Provide a well-structured, professionally formatted response under ${maxWords} words. Quality formatting is essential - never sacrifice structure for brevity.**

Remember: A concise, focused response that directly helps the user is infinitely more valuable than a comprehensive response that overwhelms them or gets cut off.`;

    return qualityPrompt;
  }

  /**
   * Get style-specific guidelines
   */
  getStyleGuidelines(style) {
    switch (style) {
      case 'concise':
        return '   • Keep responses brief and to-the-point\n   • Use short sentences and simple structure\n   • Focus on essential information only';
      case 'structured':
        return '   • Use clear headings and bullet points\n   • Organize information logically\n   • Balance detail with readability';
      case 'detailed':
        return '   • Provide thorough analysis when needed\n   • Include supporting data and context\n   • Maintain clear structure despite length';
      case 'conversational':
        return '   • Use natural, friendly language\n   • Keep the tone engaging but professional\n   • Optimize for spoken or casual interaction';
      default:
        return '   • Adapt style to match user needs\n   • Balance formality with accessibility';
    }
  }

  /**
   * Get optimal temperature based on response style
   */
  getOptimalTemperature(style) {
    switch (style) {
      case 'concise': return 0.3; // More focused and deterministic
      case 'structured': return 0.4; // Balanced creativity and focus
      case 'detailed': return 0.5; // Slightly more creative for analysis
      case 'conversational': return 0.6; // More natural and varied
      default: return 0.4;
    }
  }

  /**
   * Default configuration fallback
   */
  getDefaultConfig() {
    return {
      maxOutputTokens: 600,
      temperature: 0.4,
      topK: 32,
      topP: 0.85,
    };
  }

  /**
   * Default quality prompt fallback
   */
  getDefaultQualityPrompt() {
    return `

🎯 **RESPONSE QUALITY OPTIMIZATION**

CORE PRINCIPLE: Provide the most helpful response, not the longest response.

OPTIMIZATION RULES:
• Answer the specific question asked
• Keep responses focused and actionable
• Use clear structure with headings and bullet points
• Eliminate unnecessary background information
• End with specific next steps

Remember: Quality over quantity - a focused, helpful response is better than a comprehensive one that overwhelms the user.`;
  }

  /**
   * Get pipeline-specific prompt enhancement
   */
  getPromptEnhancement(pipelineId, userQuery, context = 'text') {
    const qualityPrompt = this.generateQualityPrompt(pipelineId, userQuery);
    const pipeline = this.pipelineConfigs.get(pipelineId);
    
    let contextEnhancement = '';
    if (context === 'voice') {
      contextEnhancement = `

🎙️ **VOICE OPTIMIZATION:**
• Keep response under 30 seconds when read aloud (~75 words)
• Use conversational language and natural flow
• Prioritize immediate actionability over comprehensive coverage
• Maintain formatting for display but optimize for speech`;
    } else if (context === 'streaming') {
      contextEnhancement = `

📡 **STREAMING OPTIMIZATION:**  
• Structure response so early chunks provide immediate value
• Use clear section breaks for better streaming experience
• Front-load the most important information`;
    }

    return qualityPrompt + contextEnhancement;
  }

  /**
   * Get all available pipeline configurations
   */
  getAllPipelineConfigs() {
    return new Map(this.pipelineConfigs);
  }
}

const responseQualityOptimizer = new ResponseQualityOptimizer();

module.exports = {
  ResponseQualityOptimizer,
  responseQualityOptimizer
}; 