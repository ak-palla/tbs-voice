/**
 * Pipeline Optimizer for Sub-5s Performance
 * Implements advanced operation overlapping and streaming optimizations
 */

interface PipelineStage {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  dependencies: string[];
  canStartEarly?: boolean;
}

interface StreamingConfig {
  earlyTriggerThreshold: number;
  chunkSize: number;
  maxConcurrency: number;
}

class PipelineOptimizer {
  private stages = new Map<string, PipelineStage>();
  private streamingConfig: StreamingConfig = {
    earlyTriggerThreshold: 50, // Start TTS after 50 chars
    chunkSize: 100,
    maxConcurrency: 3
  };

  /**
   * Advanced parallel execution with early triggers
   */
  async executeOverlappedPipeline<T>(
    operations: Array<{
      name: string;
      fn: () => Promise<T>;
      dependencies?: string[];
      canStartEarly?: boolean;
      earlyTrigger?: (partialResult: any) => boolean;
    }>
  ): Promise<T[]> {
    console.error('🚀 [PIPELINE] Starting overlapped execution');
    const startTime = Date.now();
    
    const results = new Map<string, T>();
    const promises = new Map<string, Promise<T>>();
    
    // Start operations based on dependencies and early triggers
    for (const op of operations) {
      const promise = this.executeWithEarlyTrigger(op.name, op.fn, op.dependencies || [], op.canStartEarly);
      promises.set(op.name, promise);
      
      this.recordStageStart(op.name, op.dependencies || []);
    }
    
    // Wait for all operations to complete
    const finalResults: T[] = [];
    for (const [name, promise] of Array.from(promises.entries())) {
      const result = await promise;
      results.set(name, result);
      finalResults.push(result);
      this.recordStageEnd(name);
    }
    
    const totalTime = Date.now() - startTime;
    console.error(`✅ [PIPELINE] Overlapped execution completed in ${totalTime}ms`);
    this.logPipelineStats();
    
    return finalResults;
  }

  private async executeWithEarlyTrigger<T>(
    name: string,
    fn: () => Promise<T>,
    dependencies: string[],
    canStartEarly: boolean = false
  ): Promise<T> {
    // Wait for dependencies if not starting early
    if (!canStartEarly && dependencies.length > 0) {
      await this.waitForDependencies(dependencies);
    }
    
    console.error(`🔄 [PIPELINE] Starting ${name}${canStartEarly ? ' (early start)' : ''}`);
    const result = await fn();
    console.error(`✅ [PIPELINE] Completed ${name}`);
    
    return result;
  }

  private async waitForDependencies(dependencies: string[]): Promise<void> {
    const maxWait = 5000; // 5 second timeout
    const startWait = Date.now();
    
    while (Date.now() - startWait < maxWait) {
      const allComplete = dependencies.every(dep => {
        const stage = this.stages.get(dep);
        return stage && stage.endTime !== undefined;
      });
      
      if (allComplete) return;
      
      // Small delay before checking again
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    console.error(`⚠️ [PIPELINE] Timeout waiting for dependencies: ${dependencies.join(', ')}`);
  }

  /**
   * Streaming AI response with early TTS trigger
   */
  async optimizedStreamingResponse(
    generateResponse: () => AsyncIterable<string>,
    generateTTS: (text: string) => Promise<any>,
    shouldGenerateTTS: boolean = true
  ): Promise<{ fullText: string; ttsResult?: any }> {
    console.error('🚀 [STREAMING] Starting optimized streaming with early TTS');
    const streamStart = Date.now();
    
    let fullText = '';
    let ttsPromise: Promise<any> | null = null;
    let ttsTriggered = false;
    let firstSentence = '';
    
    try {
      const responseGenerator = generateResponse();
      
      for await (const chunk of responseGenerator) {
        fullText += chunk;
        
        // Early TTS trigger logic
        if (shouldGenerateTTS && !ttsTriggered) {
          // Extract first complete sentence or reach threshold
          const sentences = this.extractCompleteSentences(fullText);
          if (sentences.length > 0) {
            firstSentence = sentences[0];
            if (firstSentence.length >= this.streamingConfig.earlyTriggerThreshold) {
              console.error(`🚀 [EARLY TTS] Triggering TTS with first sentence: "${firstSentence.substring(0, 50)}..."`);
              ttsPromise = generateTTS(firstSentence);
              ttsTriggered = true;
            }
          } else if (fullText.length >= this.streamingConfig.earlyTriggerThreshold * 2) {
            // Fallback: use first chunk if no complete sentence
            firstSentence = fullText.substring(0, this.streamingConfig.earlyTriggerThreshold);
            console.error(`🚀 [EARLY TTS] Triggering TTS with partial text: "${firstSentence}..."`);
            ttsPromise = generateTTS(firstSentence);
            ttsTriggered = true;
          }
        }
      }
      
      // If TTS wasn't triggered or we need full text TTS
      if (shouldGenerateTTS && (!ttsTriggered || fullText !== firstSentence)) {
        if (!ttsTriggered) {
          console.error('🔄 [FULL TTS] No early trigger - generating TTS for complete response');
          ttsPromise = generateTTS(fullText);
        } else {
          console.error('🔄 [FULL TTS] Replacing early TTS with complete response TTS');
          // Cancel early TTS and generate for full text
          ttsPromise = generateTTS(fullText);
        }
      }
      
      const streamTime = Date.now() - streamStart;
      console.error(`✅ [STREAMING] Completed in ${streamTime}ms`);
      
      // Wait for TTS if it was generated
      const ttsResult = ttsPromise ? await ttsPromise : undefined;
      
      return { fullText, ttsResult };
      
    } catch (error) {
      console.error('❌ [STREAMING] Error in optimized streaming:', error);
      throw error;
    }
  }

  /**
   * Extract complete sentences from partial text
   */
  private extractCompleteSentences(text: string): string[] {
    // Match sentences ending with . ! ? followed by space or end of string
    const sentenceRegex = /[^.!?]*[.!?](?:\s|$)/g;
    const sentences = text.match(sentenceRegex) || [];
    return sentences.map(s => s.trim()).filter(s => s.length > 10);
  }

  /**
   * Batch processing optimization
   */
  async batchProcess<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    batchSize: number = 5
  ): Promise<R[]> {
    console.error(`🚀 [BATCH] Processing ${items.length} items in batches of ${batchSize}`);
    const startTime = Date.now();
    
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
      
      // Log progress for large batches
      if (items.length > 20) {
        const progress = Math.round((i + batch.length) / items.length * 100);
        console.error(`📊 [BATCH] Progress: ${progress}% (${i + batch.length}/${items.length})`);
      }
    }
    
    const batchTime = Date.now() - startTime;
    console.error(`✅ [BATCH] Completed ${items.length} items in ${batchTime}ms`);
    
    return results;
  }

  /**
   * Concurrent execution with rate limiting
   */
  async executeConcurrent<T>(
    tasks: Array<() => Promise<T>>,
    maxConcurrency: number = 3
  ): Promise<T[]> {
    console.error(`🚀 [CONCURRENT] Executing ${tasks.length} tasks with max concurrency ${maxConcurrency}`);
    const startTime = Date.now();
    
    const results: T[] = [];
    const executing: Promise<void>[] = [];
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      
      const promise = task().then(result => {
        results[i] = result;
        console.error(`✅ [CONCURRENT] Task ${i + 1}/${tasks.length} completed`);
      });
      
      executing.push(promise);
      
      // Wait if we've reached max concurrency
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
        // Remove completed promises
        const stillExecuting = executing.filter(p => {
          return p.then(() => false, () => false);
        });
        executing.length = 0;
        executing.push(...stillExecuting);
      }
    }
    
    // Wait for remaining tasks
    await Promise.all(executing);
    
    const concurrentTime = Date.now() - startTime;
    console.error(`✅ [CONCURRENT] All ${tasks.length} tasks completed in ${concurrentTime}ms`);
    
    return results;
  }

  /**
   * Pipeline stage tracking
   */
  private recordStageStart(name: string, dependencies: string[]): void {
    this.stages.set(name, {
      name,
      startTime: Date.now(),
      dependencies
    });
  }

  private recordStageEnd(name: string): void {
    const stage = this.stages.get(name);
    if (stage) {
      stage.endTime = Date.now();
      stage.duration = stage.endTime - stage.startTime;
    }
  }

  private logPipelineStats(): void {
    console.error('📊 [PIPELINE STATS] Stage execution summary:');
    
    const sortedStages = Array.from(this.stages.values())
      .filter(s => s.duration !== undefined)
      .sort((a, b) => a.startTime - b.startTime);
    
    for (const stage of sortedStages) {
      console.error(`   ${stage.name}: ${stage.duration}ms`);
    }
    
    const totalPipelineTime = Math.max(...sortedStages.map(s => s.endTime!)) - 
                             Math.min(...sortedStages.map(s => s.startTime));
    console.error(`📊 [PIPELINE] Total pipeline time: ${totalPipelineTime}ms`);
  }

  /**
   * Cleanup and reset
   */
  reset(): void {
    this.stages.clear();
  }

  /**
   * Configure streaming settings
   */
  configureStreaming(config: Partial<StreamingConfig>): void {
    this.streamingConfig = { ...this.streamingConfig, ...config };
    console.error('🔧 [PIPELINE] Updated streaming configuration:', this.streamingConfig);
  }

  /**
   * Get optimal pipeline configuration based on query analysis
   */
  getOptimalPipeline(message: string, isTextInput: boolean = false): {
    maxTokens: number;
    temperature: number;
    topP: number;
    topK: number;
    groqModel?: string;
    geminiModel?: string;
  } {
    // For text input, use the same configuration as voice
    if (isTextInput) {
      return {
        maxTokens: 2000,  // Voice token limit
        temperature: 0.4,
        topP: 0.9,
        topK: 40,
        groqModel: "llama3-70b-8192"  // Voice model
      };
    }

    // Original voice/streaming logic continues below
    const complexity = this.analyzeQueryComplexity(message);
    
    let config = {
      maxTokens: 1000,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      groqModel: "llama3-70b-8192",
      geminiModel: "gemini-1.5-flash-latest"
    };

    // Rest of the existing configuration logic...
    switch (complexity.type) {
      case 'yes_no':
        config.maxTokens = 1000;
        config.temperature = 0.3;
        break;
      case 'what':
        config.maxTokens = 2000;
        config.temperature = 0.5;
        break;
      case 'how_to':
        config.maxTokens = 4000;
        config.temperature = 0.6;
        break;
      case 'comparison':
        config.maxTokens = 3000;
        config.temperature = 0.4;
        break;
      case 'analysis':
        config.maxTokens = 5000;
        config.temperature = 0.6;
        break;
      default:
        config.maxTokens = 3000;
        break;
    }

    config.maxTokens = Math.floor(config.maxTokens * complexity.tokenMultiplier);
    config.maxTokens = Math.max(500, Math.min(config.maxTokens, 8000));

    return config;
  }

  /**
   * Analyze query complexity and type
   */
  private analyzeQueryComplexity(query: string): {
    type: 'yes_no' | 'what' | 'how_to' | 'comparison' | 'analysis' | 'other';
    complexity: 'simple' | 'moderate' | 'detailed' | 'complex';
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
        tokenMultiplier = 0.7;
        break;
      case 'what':
        complexity = wordCount > 10 ? 'moderate' : 'simple';
        tokenMultiplier = 0.85;
        break;
      case 'how_to':
        complexity = 'detailed';
        tokenMultiplier = 1.3; // Increased for complete instructions
        break;
      case 'comparison':
        complexity = 'detailed';
        tokenMultiplier = 1.2;
        break;
      case 'analysis':
        complexity = 'complex';
        tokenMultiplier = 1.4;
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
    tokenMultiplier = Math.min(tokenMultiplier, 1.8);

    return { type, complexity, tokenMultiplier };
  }

  private static getSystemPrompt(plan: ResponsePlan): string {
    const basePrompt = `You are a business AI assistant providing ${plan.complexity} guidance.
Focus on practical, actionable steps.
Use clear structure with main points.
Reference relevant platform tools and features when applicable.
Keep responses concise and implementation-focused.
Ensure each point is complete and actionable.
${plan.shouldSplit ? 'Indicate if critical information continues in part 2.' : ''}`;

    // Add voice-style formatting for all responses
    return `${basePrompt}

Response Guidelines:
1. Start with a brief introduction
2. Present 3-5 main points
3. Each point should:
   - Start with an action verb
   - Reference relevant platform tools
   - Provide clear implementation steps
4. End with a brief conclusion
5. Keep the tone conversational but professional`;
  }

  /**
   * Create structured prompt based on plan
   */
  private static createStructuredPrompt(question: string, plan: ResponsePlan): string {
    // Use voice-style prompt structure for all queries
    const promptStructure = `Question: ${question}

Key points to cover:
${plan.outline.map(point => `- ${point}`).join('\n')}

Format Guidelines:
- Start with "Let's" or similar engaging opener
- Make each point actionable and specific
- Reference relevant platform tools and features
- Keep the response focused and implementation-oriented
- Maintain consistent structure throughout
- Ensure complete thoughts and clear next steps

${plan.shouldSplit ? "\nNOTE: This is Part 1 of 2. Focus on the most critical information first." : ""}

Response:`;

    return promptStructure;
  }

  /**
   * Analyze response complexity
   */
  private static analyzeComplexity(
    question: string, 
    outline: string[]
  ): 'simple' | 'moderate' | 'complex' {
    const questionLower = question.toLowerCase();
    
    // Optimize for voice-style responses
    const hasSimpleIndicators = this.COMPLEXITY_INDICATORS.simple
      .some(word => questionLower.includes(word));
    const hasComplexIndicators = this.COMPLEXITY_INDICATORS.complex
      .some(word => questionLower.includes(word));

    // Prefer simpler, more focused responses
    const outlineComplexity = outline.reduce((score, point) => {
      const words = point.split(/\s+/).length;
      // Encourage shorter, more focused points
      return score + (words > 6 ? 2 : words > 4 ? 1 : 0);
    }, 0);

    // Bias towards simpler responses for better completion
    if (outline.length <= 3 && (hasSimpleIndicators || outlineComplexity < 2)) return 'simple';
    if (outline.length >= 5 || hasComplexIndicators || outlineComplexity > 3) return 'complex';
    return 'moderate';
  }
}

// Global pipeline optimizer instance
export const pipelineOptimizer = new PipelineOptimizer();

// Pipeline operation types
export interface PipelineOperation<T> {
  name: string;
  execute: () => Promise<T>;
  dependencies?: string[];
  canStartEarly?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export default pipelineOptimizer;