import { groqClient, GROQ_MODELS } from './groq-client';

interface ResponsePlan {
  outline: string[];
  estimatedTokens: number;
  complexity: 'simple' | 'moderate' | 'complex';
  shouldSplit: boolean;
}

interface GenerationConfig {
  maxTokens: number;
  temperature: number;
  topP: number;
  topK: number;
}

const PLANNING_PROMPT = `Create a brief outline for answering this business question. Focus on key points only.

Question: {question}

Requirements:
- List 2-4 main points to cover
- Prioritize most important information first
- Each point should be one line
- Start each point with "-"
- Be specific and actionable
- Consider the estimated length needed

Outline:`;

/**
 * Response Planning Service
 * Handles pre-planning and adaptive response generation
 */
export class ResponsePlanner {
  private static readonly COMPLEXITY_INDICATORS = {
    simple: ['status', 'confirm', 'check', 'list', 'basic'],
    complex: ['explain', 'compare', 'analyze', 'strategy', 'implementation']
  };

  // More accurate token estimation
  private static readonly TOKEN_ESTIMATES = {
    simple: {
      perPoint: 50,
      overhead: 30
    },
    moderate: {
      perPoint: 75,
      overhead: 50
    },
    complex: {
      perPoint: 100,
      overhead: 75
    }
  };

  /**
   * Plan the response structure before generation
   */
  static async planResponse(question: string, maxTokens: number): Promise<ResponsePlan> {
    try {
      // Configure for quick outline generation
      groqClient.configure({
        model: GROQ_MODELS.FASTEST,
        maxTokens: 100,
        temperature: 0.3,
        topP: 0.8
      });

      const prompt = PLANNING_PROMPT.replace('{question}', question);
      const response = await groqClient.generateResponse([{
        role: 'user',
        content: prompt
      }]);

      // Extract outline points
      const outline = response
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.trim().replace(/^-\s*/, ''));

      // Analyze complexity
      const complexity = this.analyzeComplexity(question, outline);
      
      // More accurate token estimation
      const estimates = this.TOKEN_ESTIMATES[complexity];
      const estimatedTokens = outline.reduce((total, point) => {
        // Count actual words and adjust estimate
        const words = point.split(/\s+/).length;
        return total + (words * 2) + estimates.perPoint;
      }, estimates.overhead);
      
      // Determine if response should be split based on better estimates
      const shouldSplit = estimatedTokens > maxTokens * 0.85;

      return {
        outline,
        estimatedTokens,
        complexity,
        shouldSplit
      };
    } catch (error) {
      console.error('Response planning failed:', error);
      // Return safe defaults
      return {
        outline: ['Key points and information', 'Recommendations and next steps'],
        estimatedTokens: 200,
        complexity: 'moderate',
        shouldSplit: false
      };
    }
  }

  /**
   * Generate response with adaptive sizing
   */
  static async generateResponse(
    question: string,
    plan: ResponsePlan,
    config: GenerationConfig
  ): Promise<string> {
    // Adjust generation config based on plan
    const adjustedConfig = this.adjustConfig(config, plan);

    // Create generation prompt with explicit structure
    const prompt = this.createStructuredPrompt(question, plan);

    try {
      const response = await groqClient.generateResponse([{
        role: 'system',
        content: this.getSystemPrompt(plan)
      }, {
        role: 'user',
        content: prompt
      }], adjustedConfig);

      // Check for truncation with improved detection
      if (this.isTruncated(response, adjustedConfig.maxTokens)) {
        return await this.handleTruncation(question, plan, response, adjustedConfig);
      }

      return response;
    } catch (error) {
      console.error('Response generation failed:', error);
      throw error;
    }
  }

  /**
   * Create structured prompt based on plan
   */
  private static createStructuredPrompt(question: string, plan: ResponsePlan): string {
    const tokenWarning = plan.shouldSplit ? 
      "\nNOTE: This is Part 1 of 2. Focus on the most critical information first." :
      "\nProvide a complete response within the token limit.";

    return `Question: ${question}

Key points to cover:
${plan.outline.map(point => `- ${point}`).join('\n')}

${tokenWarning}

Response:`;
  }

  /**
   * Get system prompt based on plan
   */
  private static getSystemPrompt(plan: ResponsePlan): string {
    return `You are a business AI assistant providing ${plan.complexity} guidance.
Focus on ${plan.shouldSplit ? 'essential information first' : 'complete answers'}.
Use clear structure with headers and bullet points.
${plan.shouldSplit ? 'Indicate if critical information continues in part 2.' : ''}`;
  }

  /**
   * Analyze response complexity
   */
  private static analyzeComplexity(
    question: string, 
    outline: string[]
  ): 'simple' | 'moderate' | 'complex' {
    const questionLower = question.toLowerCase();
    
    // Check for complexity indicators
    const hasSimpleIndicators = this.COMPLEXITY_INDICATORS.simple
      .some(word => questionLower.includes(word));
    const hasComplexIndicators = this.COMPLEXITY_INDICATORS.complex
      .some(word => questionLower.includes(word));

    // Consider outline length and content
    const outlineComplexity = outline.reduce((score, point) => {
      const words = point.split(/\s+/).length;
      return score + (words > 8 ? 2 : words > 5 ? 1 : 0);
    }, 0);

    // Determine complexity based on multiple factors
    if (outline.length <= 2 && hasSimpleIndicators && outlineComplexity < 2) return 'simple';
    if (outline.length >= 4 || hasComplexIndicators || outlineComplexity > 4) return 'complex';
    return 'moderate';
  }

  /**
   * Adjust generation config based on plan
   */
  private static adjustConfig(
    config: GenerationConfig,
    plan: ResponsePlan
  ): GenerationConfig {
    const adjustedConfig = { ...config };

    if (plan.shouldSplit) {
      // Reduce tokens for split responses
      adjustedConfig.maxTokens = Math.floor(config.maxTokens * 0.65);
      adjustedConfig.temperature = Math.max(0.3, config.temperature - 0.1);
    } else if (plan.complexity === 'simple') {
      // Use lower temperature for simple responses
      adjustedConfig.temperature = Math.max(0.3, config.temperature - 0.1);
    }

    return adjustedConfig;
  }

  /**
   * Check if response appears truncated with improved detection
   */
  private static isTruncated(response: string, maxTokens: number): boolean {
    // Check for common truncation indicators
    const lastChar = response.trim().slice(-1);
    const lastWord = response.trim().split(/\s+/).pop() || '';
    const lastLine = response.trim().split('\n').pop() || '';
    
    return (
      lastChar === ',' ||
      !'.!?'.includes(lastChar) ||
      lastWord.length <= 2 ||
      lastLine.startsWith('•') || // Incomplete bullet point
      lastLine.startsWith('-') || // Incomplete list item
      lastLine.startsWith('*') || // Incomplete bullet point
      response.length >= maxTokens * 3.5 // Close to token limit (rough char to token ratio)
    );
  }

  /**
   * Handle truncated responses with improved compression
   */
  private static async handleTruncation(
    question: string,
    plan: ResponsePlan,
    truncatedResponse: string,
    config: GenerationConfig
  ): Promise<string> {
    // If already split, add continuation marker
    if (plan.shouldSplit) {
      return truncatedResponse.trim() + '\n\n[Continued in Part 2...]';
    }

    // Try regenerating with more aggressive summarization
    const compressedConfig = {
      ...config,
      maxTokens: Math.floor(config.maxTokens * 0.75),
      temperature: Math.max(0.3, config.temperature - 0.1)
    };

    const compressedPrompt = `Provide a concise version of this response, focusing only on the most critical information:

Question: ${question}

Key points (prioritized):
${plan.outline.slice(0, 2).map(point => `- ${point}`).join('\n')}

Response:`;

    return await groqClient.generateResponse([{
      role: 'user',
      content: compressedPrompt
    }], compressedConfig);
  }
} 