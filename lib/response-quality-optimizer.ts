interface PipelineType {
  name: string;
  purpose: string;
  responseStyle: 'concise' | 'structured' | 'detailed' | 'conversational';
  maxTokens: number;
  qualityPrinciples: string[];
}

interface ResponseQualityConfig {
  pipeline: PipelineType;
  userQuery: string;
  context: 'text' | 'voice' | 'streaming';
  urgency: 'low' | 'medium' | 'high';
}

export class ResponseQualityOptimizer {
  
  private pipelineConfigs: Map<string, PipelineType> = new Map([
    ['main-chat', {
      name: 'Main Chat',
      purpose: 'General business advisory and problem-solving',
      responseStyle: 'structured',
      maxTokens: 500, // Increased to accommodate links and prevent cutoffs
      qualityPrinciples: [
        'Answer the specific question asked directly',
        'Provide 1 key actionable point maximum for basic questions',
        'Use clear structure with headings only when needed',
        'Include relevant links to tools when directly applicable',
        'End with specific immediate next steps',
        'Avoid comprehensive overviews unless specifically requested',
        'Start with YES/NO for yes/no questions',
        'Ensure all tool mentions are properly linked',
        'Never end a response mid-sentence or mid-link',
        'Complete all started sections and lists'
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
      maxTokens: 450, // Slightly increased for voice to avoid cutoffs
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
      maxTokens: 450,
      qualityPrinciples: [
        'Optimize for speech synthesis',
        'Use natural conversation flow',
        'Keep responses under 25 seconds',
        'Prioritize clarity over completeness',
        'Focus on immediate value'
      ]
    }]
  ]);

  /**
   * Enhanced query complexity detection with more granular analysis
   */
  private detectQueryComplexity(query: string): { 
    complexity: 'simple' | 'moderate' | 'detailed' | 'complex';
    type: 'yes_no' | 'what' | 'how_to' | 'comparison' | 'analysis' | 'other';
    tokenMultiplier: number;
  } {
    const lowerQuery = query.toLowerCase();
    
    // Detect question type
    let type: 'yes_no' | 'what' | 'how_to' | 'comparison' | 'analysis' | 'other' = 'other';
    
    if (/^(is|are|should|can|will|does|do)\s/i.test(query)) {
      type = 'yes_no';
    } else if (/^what\s/i.test(query)) {
      type = 'what';
    } else if (/^how\s(to|do|can|should)/i.test(query)) {
      type = 'how_to';
    } else if (/\b(vs|versus|compare|difference|better)\b/i.test(query)) {
      type = 'comparison';
    } else if (/\b(analyze|evaluate|assess|impact|strategy)\b/i.test(query)) {
      type = 'analysis';
    }

    // Analyze complexity factors
    const wordCount = query.split(/\s+/).length;
    const hasMultipleQuestions = (query.match(/\?/g) || []).length > 1;
    const hasComplexityIndicators = /\b(detailed|comprehensive|explain|elaborate|analyze|compare)\b/i.test(query);
    const hasTechnicalTerms = /\b(implementation|architecture|framework|methodology|integration)\b/i.test(query);
    const hasBusinessMetrics = /\b(roi|metrics|kpi|revenue|growth|conversion|performance)\b/i.test(query);
    
    // Calculate base complexity
    let complexity: 'simple' | 'moderate' | 'detailed' | 'complex' = 'simple';
    let tokenMultiplier = 1.0;

    // Adjust based on type
    switch (type) {
      case 'yes_no':
        complexity = 'simple';
        tokenMultiplier = 0.7; // Shorter responses for yes/no
        break;
      case 'what':
        complexity = wordCount > 10 ? 'moderate' : 'simple';
        tokenMultiplier = 0.85;
        break;
      case 'how_to':
        complexity = 'detailed';
        tokenMultiplier = 1.2; // Slightly longer for how-to
        break;
      case 'comparison':
        complexity = 'detailed';
        tokenMultiplier = 1.3; // Longer for comparisons
        break;
      case 'analysis':
        complexity = 'complex';
        tokenMultiplier = 1.4; // Longest for analysis
        break;
    }

    // Further adjust based on complexity factors
    if (hasMultipleQuestions) {
      complexity = 'complex';
      tokenMultiplier += 0.2;
    }
    if (hasComplexityIndicators) {
      tokenMultiplier += 0.15;
    }
    if (hasTechnicalTerms) {
      tokenMultiplier += 0.1;
    }
    if (hasBusinessMetrics) {
      tokenMultiplier += 0.1;
    }

    // Cap the multiplier
    tokenMultiplier = Math.min(tokenMultiplier, 1.5);

    return { complexity, type, tokenMultiplier };
  }

  /**
   * Get optimized generation config with dynamic token adjustment
   */
  getGenerationConfig(pipelineId: string, userQuery: string, context: 'text' | 'voice' | 'streaming' = 'text') {
    const pipeline = this.pipelineConfigs.get(pipelineId);
    if (!pipeline) {
      console.warn(`⚠️ [QUALITY] Unknown pipeline: ${pipelineId}, using defaults`);
      return this.getDefaultConfig();
    }

    // Analyze query complexity
    const { complexity, type, tokenMultiplier } = this.detectQueryComplexity(userQuery);
    
    // Base token calculation
    let maxTokens = pipeline.maxTokens;

    // Adjust tokens based on complexity and type
    maxTokens = Math.floor(maxTokens * tokenMultiplier);

    // Context-based adjustments
    if (context === 'voice') {
      maxTokens = Math.min(maxTokens, 400); // Cap voice responses
    } else if (context === 'streaming') {
      maxTokens = Math.floor(maxTokens * 0.9); // Slightly reduce for streaming
    }

    // Quality-focused temperature adjustment
    let temperature = this.getOptimalTemperature(pipeline.responseStyle);
    
    // Fine-tune temperature based on question type
    if (type === 'yes_no' || type === 'what') {
      temperature = Math.max(0.3, temperature - 0.1); // More focused for simple questions
    } else if (type === 'analysis') {
      temperature = Math.min(0.7, temperature + 0.1); // More creative for analysis
    }

    // Apply buffer to prevent cutoffs
    const effectiveTokens = Math.floor(maxTokens * 0.85);

    console.log(`🎯 [QUALITY] Query analysis:`, {
      complexity,
      type,
      tokenMultiplier,
      maxTokens: effectiveTokens,
      temperature
    });
    
    return {
      maxOutputTokens: effectiveTokens,
      temperature,
      topK: type === 'analysis' ? 40 : 32, // More diverse for analysis
      topP: type === 'analysis' ? 0.9 : 0.85,
    };
  }

  /**
   * Generate quality-focused system prompt addition
   */
  generateQualityPrompt(pipelineId: string, userQuery?: string): string {
    const pipeline = this.pipelineConfigs.get(pipelineId);
    if (!pipeline) return this.getDefaultQualityPrompt();
    
    let qualityPrompt = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 RESPONSE QUALITY PRINCIPLES - ${pipeline.name.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**CORE PRINCIPLE: Quality Over Quantity. Your goal is to be helpful and concise.**

**RESPONSE REQUIREMENTS:**
- **Clarity and Actionability:** Prioritize direct answers and immediately actionable guidance.
- **Structure:** Use markdown for clear, scannable formatting.
  - Use `##` for main headings.
  - Use `###` for subheadings.
  - Use `1.` for numbered lists (for steps).
  - Use `*` or `-` for bullet points.
  - Use **bold** for key terms.
- **Tone:** Professional, direct, and encouraging.
- **No Emojis:** Under no circumstances should you use emojis.

**RESPONSE STRUCTURE:**
1.  **Quick Summary (1-2 sentences):** Start with a brief overview of the answer.
2.  **Key Points or Steps:** Use headings, lists, and bold text to structure the main content.
3.  **Next Steps:** Always conclude with a clear, actionable next step.

**MANDATORY TOOL LINKS - Use these exact formats:**
- Company Scorecard → [Company Scorecard](/company-scorecard)
- Growth Machine → [Growth Machine](/growth-machine)  
- Growth Machine Planner → [Growth Machine Planner](/growth-machine-planner)
- Chain of Command → [Chain of Command](/chain-of-command)
- Battle Plan → [Battle Plan](/battle-plan)
- Triage Planner → [Triage Planner](/triage-planner)

**Example of a GOOD response:**
## Quick Summary
This is a brief summary of the topic.

### Key Details
* Here is the first key point.
* Here is the second key point.

### Action Plan
1. **First Step:** Review your [Company Scorecard](/company-scorecard).
2. **Second Step:** Use the [Growth Machine Planner](/growth-machine-planner) to create forecasts.

## Next Steps
Your next step is to update your financial data in the [Company Scorecard](/company-scorecard).

**CRITICAL:** Always follow these formatting rules. Do not use emojis.`;

    return qualityPrompt;
  }

  /**
   * Get style-specific guidelines
   */
  private getStyleGuidelines(style: string): string {
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
  private getOptimalTemperature(style: string): number {
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
  private getDefaultConfig() {
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
  private getDefaultQualityPrompt(): string {
    return `
🎯 **RESPONSE QUALITY PRINCIPLES**

**CORE PRINCIPLE: Provide the most helpful and concise response possible.**

**FORMATTING:**
- Use markdown for clear headings, lists, and bold text.
- Structure your response for easy readability.
- Do not use emojis.

**CONTENT:**
- Be direct and answer the user's question.
- Prioritize actionable advice.
- Always end with a clear next step.`;
  }

  /**
   * Analyze if a response meets quality standards
   */
  assessResponseQuality(response: string, pipelineId: string, userQuery: string): {
    score: number;
    feedback: string[];
    suggestions: string[];
  } {
    const pipeline = this.pipelineConfigs.get(pipelineId);
    const wordCount = response.split(/\s+/).length;
    const maxWords = pipeline ? pipeline.maxTokens * 0.75 : 450; // Rough token to word conversion
    
    let score = 100;
    const feedback: string[] = [];
    const suggestions: string[] = [];

    // Check if this is a basic yes/no question
    const isYesNoQuestion = /\b(is this|should i|would it be|is it)\b.*\?/i.test(userQuery);
    const isBasicQuestion = isYesNoQuestion || (/\b(what|how|why|when|where)\b.*\?/i.test(userQuery) && userQuery.length < 100);

    // Check length appropriateness
    if (isBasicQuestion && wordCount > 75) {
      score -= 30;
      feedback.push(`Response is too long for basic question (${wordCount} words, should be under 75)`);
      suggestions.push('Answer the question directly first, then provide 1-2 key points maximum');
    } else if (wordCount > maxWords) {
      score -= 20;
      feedback.push(`Response is too long (${wordCount} words, target: ${Math.floor(maxWords)})`);
      suggestions.push('Reduce unnecessary explanations and focus on key points');
    }

    // Check for direct answer to yes/no questions
    if (isYesNoQuestion) {
      const startsWithYesNo = /^(yes|no)\b/i.test(response.trim());
      if (!startsWithYesNo) {
        score -= 25;
        feedback.push('Yes/No question should start with YES or NO');
        suggestions.push('Begin response with "YES" or "NO" then explain briefly');
      }
    }

    // Check for inappropriate comprehensive content on simple questions
    if (isBasicQuestion) {
      const hasStepByStep = /actionable steps|step.by.step|implementation/i.test(response);
      const hasMarketAnalysis = /market analysis|competitor|analysis/i.test(response);
      const hasBenefitsAndChallenges = /benefits.*challenges|advantages.*disadvantages/i.test(response);
      
      if (hasStepByStep) {
        score -= 20;
        feedback.push('Basic question should not include step-by-step implementation');
        suggestions.push('Remove implementation steps - just answer the question');
      }
      
      if (hasMarketAnalysis) {
        score -= 15;
        feedback.push('Basic question should not include market analysis');
        suggestions.push('Remove market analysis - focus on direct answer');
      }
      
      if (hasBenefitsAndChallenges) {
        score -= 15;
        feedback.push('Basic "Is this good?" question should not list both benefits AND challenges');
        suggestions.push('Answer directly - if it\'s good, focus on why it\'s good');
      }
    }

    // Check structure
    const hasHeadings = /^##?\s+/m.test(response);
    const hasBulletPoints = /^\s*[•\-\*]\s+/m.test(response);
    if (!hasHeadings && !hasBulletPoints && wordCount > 100) {
      score -= 15;
      feedback.push('Response lacks clear structure');
      suggestions.push('Add headings or bullet points for better readability');
    }

    // Check for actionable content
    const hasActionWords = /\b(steps?|action|implement|start|begin|next|should|must|can)\b/i.test(response);
    if (!hasActionWords && !isBasicQuestion) {
      score -= 10;
      feedback.push('Response lacks actionable guidance');
      suggestions.push('Include specific next steps or actions');
    }

    // Check for tool links (if appropriate)
    const queryMentionsBusiness = /\b(business|company|growth|strategy|plan)\b/i.test(userQuery);
    const hasLinks = /\[.*?\]\(\/.*?\)/.test(response);
    if (queryMentionsBusiness && !hasLinks && wordCount > 50 && !isBasicQuestion) {
      score -= 5;
      feedback.push('Consider adding relevant tool links');
      suggestions.push('Link to appropriate business tools like [Company Scorecard](/company-scorecard)');
    }

    return {
      score: Math.max(0, score),
      feedback,
      suggestions
    };
  }

  /**
   * Get pipeline-specific prompt enhancement
   */
  getPromptEnhancement(pipelineId: string, userQuery: string, context: 'text' | 'voice' | 'streaming' = 'text'): string {
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
  getAllPipelineConfigs(): Map<string, PipelineType> {
    return new Map(this.pipelineConfigs);
  }
}

export const responseQualityOptimizer = new ResponseQualityOptimizer(); 