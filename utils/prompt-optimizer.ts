interface QueryContext {
  type: 'question' | 'request' | 'problem' | 'exploration';
  domain: 'business' | 'marketing' | 'strategy' | 'operations' | 'organizational' | 'general';
  urgency: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'moderate' | 'complex';
  intent: 'learn' | 'implement' | 'solve' | 'plan';
}

interface PromptTemplate {
  systemPrompt: string;
  contextIntegration: string;
  responseFormat: string;
  qualityChecks: string[];
}

export class PromptOptimizer {
  
  /**
   * Analyze query to understand context and intent
   */
  analyzeQuery(query: string): QueryContext {
    const queryLower = query.toLowerCase();
    const words = query.split(/\s+/);
    
    // Determine query type
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'which', 'who'];
    const isQuestion = questionWords.some(word => queryLower.includes(word)) || query.includes('?');
    
    const requestWords = ['help', 'assist', 'show', 'tell', 'explain', 'guide'];
    const isRequest = requestWords.some(word => queryLower.includes(word));
    
    const problemWords = ['problem', 'issue', 'trouble', 'stuck', 'challenge', 'difficulty'];
    const isProblem = problemWords.some(word => queryLower.includes(word));
    
    const type = isProblem ? 'problem' : isQuestion ? 'question' : isRequest ? 'request' : 'exploration';
    
    // Determine domain
    const organizationalWords = ['chain of command', 'organizational structure', 'hierarchy', 'leadership', 'team structure', 'command structure', 'delegation', 'authority', 'management levels', 'reporting', 'roles', 'responsibilities'];
    const businessWords = ['business', 'company', 'revenue', 'profit', 'growth', 'scale'];
    const marketingWords = ['marketing', 'promotion', 'advertising', 'brand', 'social media', 'customer'];
    const strategyWords = ['strategy', 'plan', 'planning', 'goal', 'objective', 'vision'];
    const operationsWords = ['operations', 'process', 'workflow', 'efficiency', 'system'];
    
    let domain: QueryContext['domain'] = 'general';
    if (organizationalWords.some(word => queryLower.includes(word))) domain = 'organizational';
    else if (businessWords.some(word => queryLower.includes(word))) domain = 'business';
    else if (marketingWords.some(word => queryLower.includes(word))) domain = 'marketing';
    else if (strategyWords.some(word => queryLower.includes(word))) domain = 'strategy';
    else if (operationsWords.some(word => queryLower.includes(word))) domain = 'operations';
    
    // Determine urgency
    const urgentWords = ['urgent', 'asap', 'quickly', 'immediately', 'now', 'emergency'];
    const moderateWords = ['soon', 'need', 'important', 'priority'];
    
    let urgency: QueryContext['urgency'] = 'low';
    if (urgentWords.some(word => queryLower.includes(word))) urgency = 'high';
    else if (moderateWords.some(word => queryLower.includes(word))) urgency = 'medium';
    
    // Determine complexity
    const complexWords = ['comprehensive', 'detailed', 'complex', 'advanced', 'in-depth'];
    const simpleWords = ['simple', 'basic', 'quick', 'easy', 'brief'];
    
    let complexity: QueryContext['complexity'] = 'moderate';
    if (complexWords.some(word => queryLower.includes(word)) || words.length > 12) complexity = 'complex';
    else if (simpleWords.some(word => queryLower.includes(word)) || words.length < 6) complexity = 'simple';
    
    // Determine intent
    const learnWords = ['learn', 'understand', 'know', 'explain', 'what is', 'definition'];
    const implementWords = ['implement', 'do', 'start', 'begin', 'execute', 'action'];
    const solveWords = ['solve', 'fix', 'resolve', 'overcome', 'handle'];
    const planWords = ['plan', 'strategy', 'approach', 'roadmap', 'steps'];
    
    let intent: QueryContext['intent'] = 'learn';
    if (implementWords.some(word => queryLower.includes(word))) intent = 'implement';
    else if (solveWords.some(word => queryLower.includes(word))) intent = 'solve';
    else if (planWords.some(word => queryLower.includes(word))) intent = 'plan';
    
    return { type, domain, urgency, complexity, intent };
  }

  /**
   * Generate optimized prompt based on context and retrieved instructions
   */
  generateOptimizedPrompt(
    query: string,
    instructions: any[],
    userContext?: any
  ): PromptTemplate {
    const context = this.analyzeQuery(query);
    
    // Build context-aware system prompt
    const systemPrompt = this.buildSystemPrompt(context, userContext);
    
    // Build instruction integration strategy
    const contextIntegration = this.buildContextIntegration(instructions, context);
    
    // Define response format based on complexity and intent
    const responseFormat = this.buildResponseFormat(context);
    
    // Set quality checkpoints
    const qualityChecks = this.buildQualityChecks(context);
    
    return {
      systemPrompt,
      contextIntegration,
      responseFormat,
      qualityChecks
    };
  }

  private buildSystemPrompt(context: QueryContext, userContext?: any): string {
    let systemPrompt = `You are an expert business advisor AI assistant with deep expertise in helping entrepreneurs and business owners achieve success.`;
    
    // Add domain-specific expertise
    switch (context.domain) {
      case 'organizational':
        systemPrompt += ` You specialize in organizational design, leadership structures, chain of command, delegation, and team management systems.`;
        break;
      case 'business':
        systemPrompt += ` You specialize in business development, growth strategies, and operational excellence.`;
        break;
      case 'marketing':
        systemPrompt += ` You specialize in digital marketing, brand building, and customer acquisition strategies.`;
        break;
      case 'strategy':
        systemPrompt += ` You specialize in strategic planning, competitive analysis, and long-term business positioning.`;
        break;
      case 'operations':
        systemPrompt += ` You specialize in operational efficiency, process optimization, and systems implementation.`;
        break;
    }
    
    // Add urgency awareness
    if (context.urgency === 'high') {
      systemPrompt += ` The user needs immediate, actionable guidance that can be implemented quickly.`;
    } else if (context.urgency === 'medium') {
      systemPrompt += ` The user is looking for timely advice with clear next steps.`;
    }
    
    // Add complexity handling
    if (context.complexity === 'complex') {
      systemPrompt += ` Provide comprehensive, detailed guidance with multiple perspectives and considerations.`;
    } else if (context.complexity === 'simple') {
      systemPrompt += ` Keep your response clear, concise, and easy to understand.`;
    }
    
    // Add user context if available
    if (userContext?.industry) {
      systemPrompt += ` The user operates in the ${userContext.industry} industry.`;
    }
    if (userContext?.businessStage) {
      systemPrompt += ` Their business is in the ${userContext.businessStage} stage.`;
    }
    
    systemPrompt += `

CORE PRINCIPLES:
1. Always provide practical, actionable advice
2. Use specific examples and concrete steps
3. Consider the user's context and constraints
4. Focus on measurable outcomes
5. Anticipate follow-up questions
6. Maintain a supportive, professional tone

🎯 QUALITY OVER QUANTITY PRINCIPLE:
- Your goal is to provide the MOST HELPFUL response, not the LONGEST response
- Answer the specific question asked directly
- Eliminate unnecessary background explanations
- Focus on actionable insights the user can implement immediately
- Use appropriate response length for the query complexity
- End with clear, specific next steps`;

    return systemPrompt;
  }

  private buildContextIntegration(instructions: any[], context: QueryContext): string {
    if (instructions.length === 0) {
      return `Base your response on general business best practices and your expertise.`;
    }

    let integration = `Use the following knowledge base to inform your response:\n\n`;
    
    // Limit instructions for quality-focused responses
    const maxInstructions = context.complexity === 'simple' ? 2 : context.complexity === 'complex' ? 5 : 3;
    const limitedInstructions = instructions.slice(0, maxInstructions);
    
    limitedInstructions.forEach((instruction, index) => {
      const relevanceNote = this.getRelevanceNote(instruction, context);
      integration += `**Source ${index + 1}${relevanceNote}:**\n`;
      integration += `Title: ${instruction.title}\n`;
      integration += `Content: ${instruction.content}\n\n`;
    });

    integration += `Instructions for using these sources:
- Synthesize information concisely from relevant sources
- Cite specific insights when they directly answer the question
- Don't repeat source content - add your expertise and interpretation
- Focus on what's immediately actionable for the user
- Skip sources that don't directly relate to the question`;

    return integration;
  }

  private getRelevanceNote(instruction: any, context: QueryContext): string {
    const similarity = (instruction as any).similarity;
    if (similarity && similarity > 0.8) return " (Highly Relevant)";
    if (similarity && similarity > 0.6) return " (Relevant)";
    return " (Context)";
  }

  private buildResponseFormat(context: QueryContext): string {
    let format = `CRITICAL: You must follow these formatting requirements:

### ⚠️ MANDATORY FORMATTING RULES:

- **Quality Over Quantity**: Provide focused, helpful responses, not comprehensive essays
- **Never** write wall-of-text responses without breaks
- **MANDATORY:** Always use proper markdown headings (## for main sections)
- **MANDATORY:** Always break up content into scannable sections with clear headings
- **MANDATORY:** Always provide numbered steps for processes (use 1. 2. 3. format)
- **MANDATORY:** Always use bullet points for lists of related items (use - or * format)
- **MANDATORY:** Always bold important concepts and key terms (**text**)
- **MANDATORY:** Always create clickable links for business tools using [Tool Name](/route-name) format
- **MANDATORY:** Always end with clear next steps or call-to-action
- **MANDATORY:** Always add line breaks between different points
- **Never** combine multiple sequential points in one paragraph

### 🔗 MANDATORY LINK FORMATTING:
When referencing business assessment tools, ALWAYS format as clickable links:
- Company Scorecard → [Company Scorecard](/company-scorecard)
- Chain of Command → [Chain of Command](/chain-of-command)  
- Growth Machine → [Growth Machine](/growth-machine)
- Battle Plan → [Battle Plan](/battle-plan)
- Meeting Rhythm → [Meeting Rhythm Planner](/meeting-rhythm-planner)
- Quarterly Sprint → [Quarterly Sprint Canvas](/quarterly-sprint-canvas)
- Fulfillment Machine → [Fulfillment Machine](/fulfillment-machine)
- Innovation Machine → [Innovation Machine](/innovation-machine)
- Triage Planner → [Triage Planner](/triage-planner)
- SOP Creator → [SOP Creator](/sop)

Now structure your response as follows:

`;
    
    // Adapt format based on intent and complexity
    switch (context.intent) {
      case 'learn':
        format += `## 🎯 Quick Answer
*Direct response to your question in 1-2 sentences*

## 📋 Key Points
- **Main concept:** Brief explanation with bold key terms
- **Why it matters:** Context and importance
- **How it works:** Core mechanism

## 🚀 Next Steps
*Specific recommended actions*`;
        break;
        
      case 'implement':
        format += `## 🎯 Implementation Plan
*Brief overview of what you need to accomplish*

## 🔄 Step-by-Step Actions

1. **First Critical Action**
   Specific description with clear requirements

2. **Second Essential Step**
   Clear next step with detailed instructions

3. **Third Implementation Phase**
   Continue the logical sequence

## 🚀 Next Steps
*Immediate actions to begin implementation*`;
        break;
        
      case 'solve':
        format += `## 🎯 Solution Overview
*Understanding the core issue and recommended approach*

## 🔄 Solution Steps

1. **Identify Root Cause**
   What's actually causing this problem

2. **Implement Fix**
   Specific action to resolve the issue

3. **Prevent Recurrence**
   How to avoid this problem in the future

## 🚀 Next Steps
*Immediate actions to resolve the issue*`;
        break;
        
      case 'plan':
        format += `## 🎯 Strategic Approach
*Clear goal definition and recommended strategy*

## 🔄 Action Plan

1. **Phase 1: Foundation**
   Initial steps and preparation

2. **Phase 2: Implementation**
   Core execution activities

3. **Phase 3: Optimization**
   Refinement and scaling

## 🚀 Next Steps
*Immediate actions to begin planning*`;
        break;
    }
    
    // Add complexity-specific requirements
    if (context.complexity === 'simple') {
      format += `\n\n**Keep each section concise (1-2 sentences) while maintaining proper formatting.**`;
    } else if (context.complexity === 'complex') {
      format += `\n\n**Provide detailed explanations with examples, but maintain clear structure and focus on actionability.**`;
    }
    
    format += `\n\n**Remember: Users should be able to quickly scan your response and immediately understand the key points and action items.**`;
    
    return format;
  }

  private buildQualityChecks(context: QueryContext): string[] {
    const checks = [
      "Does the response directly address the user's question?",
      "Are the recommendations practical and actionable?",
      "Is the advice appropriate for the user's context?",
      "Are there specific examples or tools mentioned?",
      "Is the response well-structured and easy to follow?",
      "Is the response length appropriate for the question complexity?",
      "Does it end with clear, specific next steps?"
    ];
    
    // Add context-specific checks
    if (context.urgency === 'high') {
      checks.push("Can the user start implementing this advice immediately?");
    }
    
    if (context.domain === 'business') {
      checks.push("Does the advice consider business metrics and ROI?");
    }
    
    if (context.intent === 'implement') {
      checks.push("Are there clear, numbered steps to follow?");
      checks.push("Are required resources and tools specified?");
    }
    
    return checks;
  }

  /**
   * Generate final prompt for the LLM
   */
  generateFinalPrompt(
    query: string, 
    instructions: any[], 
    userContext?: any,
    isVoiceQuery: boolean = false
  ): string {
    const template = this.generateOptimizedPrompt(query, instructions, userContext);
    
    let voiceOptimization = '';
    if (isVoiceQuery) {
      voiceOptimization = `

### 🎙️ VOICE RESPONSE OPTIMIZATION:
- Keep sections concise but maintain ALL formatting (links, bold, headings)
- Prioritize actionable guidance over explanations
- Use conversational transitions between sections
- Target 30 seconds or less when read aloud (~75 words max)
- The response will be read aloud AND displayed with formatting`;
    }
    
    const finalPrompt = `${template.systemPrompt}

${template.contextIntegration}

${template.responseFormat}${voiceOptimization}

USER QUERY: "${query}"

Please provide a response that meets these quality criteria:
${template.qualityChecks.map(check => `- ${check}`).join('\n')}

🔗 FINAL REMINDER: MUST include clickable links like [Company Scorecard](/company-scorecard) when referencing business tools.`;

    // DEBUG: Log prompt details
    console.log(`🔍 [PROMPT] Generated for ${isVoiceQuery ? 'VOICE' : 'TEXT'} query`);
    console.log(`🔗 [PROMPT] Contains link formatting rules: ${finalPrompt.includes('MANDATORY LINK FORMATTING')}`);
    console.log(`📏 [PROMPT] Total length: ${finalPrompt.length} chars`);
    
    return finalPrompt;
  }
}

export const promptOptimizer = new PromptOptimizer(); 