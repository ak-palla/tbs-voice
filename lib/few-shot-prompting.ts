/**
 * Few-shot Prompting System for Consistent AI Responses
 * Provides dynamic example selection and prompt optimization
 */

export interface FewShotExample {
  id: string;
  category: string;
  subcategory?: string;
  userQuery: string;
  assistantResponse: string;
  context?: string;
  tags: string[];
  quality_score: number; // 0-1, higher is better
  usage_count: number;
  success_rate: number; // Based on user feedback
  created_at: Date;
  updated_at: Date;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  example_slots: number; // How many examples to include
  categories: string[]; // Which categories this template applies to
  priority: number;
  is_active: boolean;
}

export interface PromptContext {
  userQuery: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  userProfile?: any;
  businessContext?: string;
  urgency?: 'low' | 'medium' | 'high';
  queryType?: 'question' | 'request' | 'complaint' | 'compliment' | 'other';
}

export class FewShotPromptManager {
  private examples: Map<string, FewShotExample[]> = new Map();
  private templates: Map<string, PromptTemplate> = new Map();
  private categoryEmbeddings: Map<string, number[]> = new Map();
  
  constructor() {
    this.loadDefaultExamples();
    this.loadDefaultTemplates();
  }

  /**
   * Generate optimized prompt with few-shot examples
   */
  async generatePrompt(context: PromptContext): Promise<{
    systemPrompt: string;
    examples: FewShotExample[];
    templateUsed: string;
    reasoning: string;
  }> {
    console.log('🎯 [FEW-SHOT] Generating prompt for query:', context.userQuery.substring(0, 50));
    
    // 1. Analyze query to determine category and type
    const queryAnalysis = await this.analyzeQuery(context);
    
    // 2. Select appropriate template
    const template = this.selectTemplate(queryAnalysis);
    
    // 3. Select best examples for this context
    const selectedExamples = await this.selectExamples(context, queryAnalysis, template.example_slots);
    
    // 4. Build final prompt
    const systemPrompt = this.buildSystemPrompt(template, selectedExamples, context);
    
    const reasoning = `Template: ${template.name}, Examples: ${selectedExamples.length}, Categories: ${queryAnalysis.categories.join(', ')}`;
    
    console.log('✅ [FEW-SHOT] Generated prompt:', reasoning);
    
    return {
      systemPrompt,
      examples: selectedExamples,
      templateUsed: template.id,
      reasoning
    };
  }

  /**
   * Analyze user query to understand intent and categorize
   */
  private async analyzeQuery(context: PromptContext): Promise<{
    categories: string[];
    queryType: string;
    complexity: 'simple' | 'medium' | 'complex';
    topics: string[];
    intent: string;
  }> {
    const query = context.userQuery.toLowerCase();
    
    // Determine query type
    let queryType = context.queryType || 'other';
    if (!context.queryType) {
      if (/\?(.*?)$/.test(query) || /^(what|how|why|when|where|who|which|can|could|should|would|will|is|are|do|does)\b/.test(query)) {
        queryType = 'question';
      } else if (/^(please|can you|could you|help|assist|need|want|would like)/.test(query)) {
        queryType = 'request';
      } else if (/(problem|issue|error|broken|not working|frustrated|angry)/.test(query)) {
        queryType = 'complaint';
      } else if (/(great|amazing|excellent|love|thank|appreciate)/.test(query)) {
        queryType = 'compliment';
      }
    }

    // Determine categories based on keywords
    const categories: string[] = [];
    const categoryKeywords = {
      'business_strategy': ['strategy', 'plan', 'planning', 'goal', 'objective', 'vision', 'mission', 'growth', 'market'],
      'operations': ['process', 'workflow', 'operation', 'procedure', 'system', 'management', 'efficiency'],
      'marketing': ['marketing', 'promotion', 'advertising', 'brand', 'customer', 'audience', 'campaign'],
      'finance': ['budget', 'money', 'cost', 'price', 'revenue', 'profit', 'investment', 'financial'],
      'hr': ['employee', 'staff', 'team', 'hiring', 'recruitment', 'training', 'management'],
      'technology': ['tech', 'software', 'digital', 'online', 'website', 'app', 'automation'],
      'sales': ['sell', 'sales', 'lead', 'prospect', 'conversion', 'closing', 'pitch'],
      'support': ['help', 'support', 'assistance', 'guide', 'tutorial', 'instruction'],
      'general': ['general', 'overview', 'introduction', 'basic', 'getting started']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        categories.push(category);
      }
    }

    // Default to general if no specific category found
    if (categories.length === 0) {
      categories.push('general');
    }

    // Determine complexity
    let complexity: 'simple' | 'medium' | 'complex' = 'medium';
    if (query.length < 20 || /^(yes|no|ok|thanks|hi|hello|bye)$/i.test(query)) {
      complexity = 'simple';
    } else if (query.length > 100 || query.split(' ').length > 20) {
      complexity = 'complex';
    }

    // Extract topics (simple keyword extraction)
    const topics = query.split(' ')
      .filter(word => word.length > 3)
      .filter(word => !/^(the|and|for|are|but|not|you|all|can|had|her|was|one|our|out|day|get|has|him|his|how|its|may|new|now|old|see|two|way|who|boy|did|man|men|too|any|few|lot|put|say|she|use|why|will|have|what|with|this|that|from|they|know|want|been|good|much|some|time|very|when|come|here|just|like|long|make|many|over|such|take|than|them|well|were)$/i.test(word));

    // Determine intent
    let intent = 'unknown';
    if (queryType === 'question') {
      intent = 'information_seeking';
    } else if (queryType === 'request') {
      intent = 'action_request';
    } else if (queryType === 'complaint') {
      intent = 'problem_solving';
    } else if (queryType === 'compliment') {
      intent = 'positive_feedback';
    }

    return { categories, queryType, complexity, topics, intent };
  }

  /**
   * Select the most appropriate template
   */
  private selectTemplate(analysis: { categories: string[]; queryType: string; complexity: string }): PromptTemplate {
    // Find templates that match the categories
    const matchingTemplates = Array.from(this.templates.values())
      .filter(template => template.is_active)
      .filter(template => 
        template.categories.some(cat => analysis.categories.includes(cat)) ||
        template.categories.includes('general')
      )
      .sort((a, b) => {
        // Sort by priority and category match
        const aMatches = a.categories.filter(cat => analysis.categories.includes(cat)).length;
        const bMatches = b.categories.filter(cat => analysis.categories.includes(cat)).length;
        
        if (aMatches !== bMatches) {
          return bMatches - aMatches;
        }
        
        return b.priority - a.priority;
      });

    // Return best match or default template
    return matchingTemplates[0] || this.getDefaultTemplate();
  }

  /**
   * Select best examples for the given context
   */
  private async selectExamples(
    context: PromptContext, 
    analysis: any, 
    maxExamples: number
  ): Promise<FewShotExample[]> {
    const candidates: Array<FewShotExample & { score: number }> = [];
    
    // Collect candidate examples from relevant categories
    for (const category of analysis.categories) {
      const categoryExamples = this.examples.get(category) || [];
      candidates.push(...categoryExamples.map(ex => ({ ...ex, score: 0 })));
    }
    
    // Also include some general examples
    const generalExamples = this.examples.get('general') || [];
    candidates.push(...generalExamples.map(ex => ({ ...ex, score: 0 })));
    
    // Score each example based on relevance
    for (const candidate of candidates) {
      candidate.score = this.calculateExampleScore(candidate, context, analysis);
    }
    
    // Sort by score and select top examples
    candidates.sort((a, b) => b.score - a.score);
    
    // Ensure diversity in selected examples
    const selected = this.ensureExampleDiversity(candidates, maxExamples);
    
    console.log(`📊 [FEW-SHOT] Selected ${selected.length} examples from ${candidates.length} candidates`);
    
    return selected.map(({ score, ...example }) => example);
  }

  /**
   * Calculate relevance score for an example
   */
  private calculateExampleScore(
    example: FewShotExample, 
    context: PromptContext, 
    analysis: any
  ): number {
    let score = 0;
    
    // Base quality score (0-1)
    score += example.quality_score * 0.3;
    
    // Success rate bonus (0-1)
    score += example.success_rate * 0.2;
    
    // Category match bonus
    if (analysis.categories.includes(example.category)) {
      score += 0.25;
    }
    
    // Query similarity (simple keyword matching)
    const queryWords = context.userQuery.toLowerCase().split(/\s+/);
    const exampleWords = example.userQuery.toLowerCase().split(/\s+/);
    const commonWords = queryWords.filter(word => 
      word.length > 3 && exampleWords.includes(word)
    );
    const similarity = commonWords.length / Math.max(queryWords.length, exampleWords.length);
    score += similarity * 0.15;
    
    // Tag relevance
    const relevantTags = example.tags.filter(tag => 
      analysis.topics.includes(tag.toLowerCase()) ||
      context.userQuery.toLowerCase().includes(tag.toLowerCase())
    );
    score += (relevantTags.length / example.tags.length) * 0.1;
    
    // Penalize overused examples to encourage diversity
    const usagePenalty = Math.min(example.usage_count / 100, 0.1);
    score -= usagePenalty;
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Ensure diversity in selected examples
   */
  private ensureExampleDiversity(
    candidates: Array<FewShotExample & { score: number }>, 
    maxExamples: number
  ): Array<FewShotExample & { score: number }> {
    if (candidates.length <= maxExamples) {
      return candidates;
    }
    
    const selected: Array<FewShotExample & { score: number }> = [];
    const usedCategories = new Set<string>();
    const usedSubcategories = new Set<string>();
    
    // First pass: select highest scoring examples from different categories
    for (const candidate of candidates) {
      if (selected.length >= maxExamples) break;
      
      const categoryKey = `${candidate.category}-${candidate.subcategory || 'default'}`;
      
      if (!usedCategories.has(candidate.category) || 
          !usedSubcategories.has(categoryKey)) {
        selected.push(candidate);
        usedCategories.add(candidate.category);
        usedSubcategories.add(categoryKey);
      }
    }
    
    // Second pass: fill remaining slots with best remaining candidates
    for (const candidate of candidates) {
      if (selected.length >= maxExamples) break;
      
      if (!selected.includes(candidate)) {
        selected.push(candidate);
      }
    }
    
    return selected.slice(0, maxExamples);
  }

  /**
   * Build the final system prompt with examples
   */
  private buildSystemPrompt(
    template: PromptTemplate, 
    examples: FewShotExample[], 
    context: PromptContext
  ): string {
    let prompt = template.system_prompt;
    
    // Add context-specific instructions
    if (context.businessContext) {
      prompt += `\n\nBusiness Context: ${context.businessContext}`;
    }
    
    if (context.urgency && context.urgency !== 'medium') {
      prompt += `\n\nUrgency Level: ${context.urgency.toUpperCase()} - Adjust your response accordingly.`;
    }
    
    // Add few-shot examples
    if (examples.length > 0) {
      prompt += '\n\nHere are some examples of excellent responses:';
      
      examples.forEach((example, index) => {
        prompt += `\n\nExample ${index + 1}:`;
        prompt += `\nUser: ${example.userQuery}`;
        prompt += `\nAssistant: ${example.assistantResponse}`;
      });
      
      prompt += '\n\nNow please respond to the user\'s query following the same style and quality as the examples above.';
    }
    
    return prompt;
  }

  /**
   * Add a new example to the system
   */
  addExample(example: Omit<FewShotExample, 'id' | 'created_at' | 'updated_at'>): string {
    const id = `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullExample: FewShotExample = {
      id,
      created_at: new Date(),
      updated_at: new Date(),
      ...example
    };
    
    if (!this.examples.has(example.category)) {
      this.examples.set(example.category, []);
    }
    
    this.examples.get(example.category)!.push(fullExample);
    
    console.log(`✅ [FEW-SHOT] Added example to category: ${example.category}`);
    return id;
  }

  /**
   * Update example performance based on feedback
   */
  updateExamplePerformance(exampleId: string, wasSuccessful: boolean): void {
    for (const examples of this.examples.values()) {
      const example = examples.find(ex => ex.id === exampleId);
      if (example) {
        example.usage_count++;
        
        // Update success rate using exponential moving average
        const alpha = 0.1; // Learning rate
        const newRate = wasSuccessful ? 1 : 0;
        example.success_rate = (1 - alpha) * example.success_rate + alpha * newRate;
        example.updated_at = new Date();
        
        console.log(`📊 [FEW-SHOT] Updated example ${exampleId}: success_rate=${example.success_rate.toFixed(3)}, usage_count=${example.usage_count}`);
        break;
      }
    }
  }

  /**
   * Get performance analytics
   */
  getAnalytics(): {
    totalExamples: number;
    categoryCounts: Record<string, number>;
    averageQualityScore: number;
    averageSuccessRate: number;
    topPerformingExamples: FewShotExample[];
  } {
    let totalExamples = 0;
    let totalQuality = 0;
    let totalSuccess = 0;
    const categoryCounts: Record<string, number> = {};
    const allExamples: FewShotExample[] = [];
    
    for (const [category, examples] of this.examples.entries()) {
      categoryCounts[category] = examples.length;
      totalExamples += examples.length;
      
      for (const example of examples) {
        totalQuality += example.quality_score;
        totalSuccess += example.success_rate;
        allExamples.push(example);
      }
    }
    
    const topPerformingExamples = allExamples
      .sort((a, b) => (b.quality_score * b.success_rate) - (a.quality_score * a.success_rate))
      .slice(0, 10);
    
    return {
      totalExamples,
      categoryCounts,
      averageQualityScore: totalExamples > 0 ? totalQuality / totalExamples : 0,
      averageSuccessRate: totalExamples > 0 ? totalSuccess / totalExamples : 0,
      topPerformingExamples
    };
  }

  /**
   * Load default examples for common scenarios
   */
  private loadDefaultExamples(): void {
    const defaultExamples: Array<Omit<FewShotExample, 'id' | 'created_at' | 'updated_at'>> = [
      {
        category: 'business_strategy',
        userQuery: 'How do I create a business plan?',
        assistantResponse: 'Creating a business plan involves several key steps: 1) Executive Summary - outline your business concept, 2) Market Analysis - research your target market and competitors, 3) Organization Structure - define your team and operations, 4) Service/Product Line - detail what you\'re offering, 5) Marketing & Sales Strategy - plan how you\'ll reach customers, 6) Financial Projections - forecast revenue and expenses. Start with a simple one-page plan and expand each section gradually. Would you like me to help you focus on any specific section?',
        tags: ['planning', 'strategy', 'startup', 'business'],
        quality_score: 0.9,
        usage_count: 0,
        success_rate: 0.85
      },
      {
        category: 'operations',
        userQuery: 'What\'s the best way to improve our workflow efficiency?',
        assistantResponse: 'To improve workflow efficiency, follow this systematic approach: 1) Map your current processes to identify bottlenecks, 2) Eliminate unnecessary steps and redundancies, 3) Automate repetitive tasks where possible, 4) Implement clear communication channels, 5) Set measurable KPIs to track improvements, 6) Train your team on new processes. Start by focusing on your most time-consuming or error-prone processes first. What specific workflow would you like to optimize?',
        tags: ['efficiency', 'process', 'optimization', 'workflow'],
        quality_score: 0.85,
        usage_count: 0,
        success_rate: 0.8
      },
      {
        category: 'marketing',
        userQuery: 'How can I increase my social media engagement?',
        assistantResponse: 'To boost social media engagement: 1) Post consistently at optimal times for your audience, 2) Create valuable, shareable content that solves problems, 3) Use relevant hashtags and trending topics, 4) Engage actively with comments and messages, 5) Share behind-the-scenes content to build connection, 6) Run interactive polls, Q&As, and contests, 7) Collaborate with influencers or other businesses. Focus on providing genuine value rather than just promoting. Which platform would you like to focus on first?',
        tags: ['social media', 'engagement', 'marketing', 'content'],
        quality_score: 0.8,
        usage_count: 0,
        success_rate: 0.75
      },
      {
        category: 'general',
        userQuery: 'I\'m feeling overwhelmed with my business. Where should I start?',
        assistantResponse: 'It\'s completely normal to feel overwhelmed - every successful entrepreneur has been there. Let\'s break this down into manageable steps: 1) Take a deep breath and focus on your core business goals, 2) List your top 3 most urgent priorities this week, 3) Identify which tasks only you can do vs. what can be delegated or automated, 4) Set boundaries and schedule specific work hours, 5) Consider what support systems you need. Remember, you don\'t have to do everything at once. What feels like the most pressing issue right now?',
        tags: ['overwhelm', 'prioritization', 'support', 'mindset'],
        quality_score: 0.9,
        usage_count: 0,
        success_rate: 0.9
      }
    ];

    for (const example of defaultExamples) {
      this.addExample(example);
    }
  }

  /**
   * Load default prompt templates
   */
  private loadDefaultTemplates(): void {
    const defaultTemplates: PromptTemplate[] = [
      {
        id: 'business_advisor',
        name: 'Business Advisor',
        description: 'Comprehensive business guidance template',
        system_prompt: 'You are an expert business advisor with 20+ years of experience helping entrepreneurs and business owners succeed. Provide practical, actionable advice that is tailored to the user\'s specific situation. Always ask clarifying questions when needed, break down complex topics into manageable steps, and maintain an encouraging but realistic tone. Focus on proven strategies and include specific next steps.',
        example_slots: 3,
        categories: ['business_strategy', 'operations', 'finance', 'general'],
        priority: 10,
        is_active: true
      },
      {
        id: 'marketing_specialist',
        name: 'Marketing Specialist',
        description: 'Marketing and growth focused template',
        system_prompt: 'You are a marketing specialist focused on helping businesses grow their audience and increase sales. Provide specific, data-driven marketing strategies that are cost-effective and suitable for the business size. Always consider the target audience, budget constraints, and measurable outcomes. Include both digital and traditional marketing approaches when relevant.',
        example_slots: 2,
        categories: ['marketing', 'sales'],
        priority: 8,
        is_active: true
      },
      {
        id: 'support_helper',
        name: 'Support Helper',
        description: 'Helpful support and troubleshooting template',
        system_prompt: 'You are a helpful support assistant dedicated to solving problems and providing clear guidance. Break down complex issues into simple steps, provide multiple solution options when possible, and always follow up to ensure the issue is resolved. Maintain a patient, understanding tone especially when users are frustrated.',
        example_slots: 2,
        categories: ['support', 'technology'],
        priority: 7,
        is_active: true
      }
    ];

    for (const template of defaultTemplates) {
      this.templates.set(template.id, template);
    }
  }

  /**
   * Get default template as fallback
   */
  private getDefaultTemplate(): PromptTemplate {
    return this.templates.get('business_advisor') || {
      id: 'default',
      name: 'Default',
      description: 'Default business assistant template',
      system_prompt: 'You are a helpful business assistant. Provide clear, actionable advice to help users succeed in their business endeavors.',
      example_slots: 2,
      categories: ['general'],
      priority: 1,
      is_active: true
    };
  }
}

// Global instance
export const fewShotManager = new FewShotPromptManager(); 