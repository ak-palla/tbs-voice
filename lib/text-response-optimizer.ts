/**
 * Text Response Optimizer
 * Optimizes and formats text chat responses using voice pipeline settings
 */

interface TextOptimizationConfig {
  maxTokens: number;
  style: 'conversational';  // Changed to match voice style
  formatOptions: {
    useMarkdown: boolean;
    useSections: boolean;
    useCodeBlocks: boolean;
    useLists: boolean;
  };
}

export class TextResponseOptimizer {
  private defaultConfig: TextOptimizationConfig = {
    maxTokens: 450,  // Match voice pipeline token limit
    style: 'conversational',  // Always use conversational style like voice
    formatOptions: {
      useMarkdown: false,  // Simplified formatting like voice
      useSections: false,  // Voice doesn't use sections
      useCodeBlocks: false,  // Voice doesn't use code blocks
      useLists: true  // Keep lists for structure
    }
  };

  /**
   * Analyze user query to determine optimal response format
   */
  private analyzeQuery(query: string): TextOptimizationConfig {
    // Always return voice-optimized config
    return this.defaultConfig;
  }

  /**
   * Optimize the system message based on query analysis
   */
  getOptimizedSystemMessage(query: string, instructions: string[]): string {
    return [
      'You are a helpful AI assistant.',
      ...instructions,
      'Optimize for natural conversation flow.',
      'Keep responses under 25 seconds when spoken.',
      'Prioritize clarity over completeness.',
      'Focus on immediate value.',
      'Use natural, conversational language.'
    ].filter(Boolean).join(' ');
  }

  /**
   * Get completion parameters based on query analysis
   */
  getCompletionParams(query: string): {
    temperature: number;
    maxTokens: number;
    topP: number;
  } {
    return {
      temperature: 0.7,  // Voice pipeline temperature
      maxTokens: 450,    // Voice pipeline token limit
      topP: 0.3         // Voice pipeline top_p
    };
  }

  /**
   * Format the final response for optimal display
   */
  formatResponse(response: string, query: string): string {
    // Minimal formatting, similar to voice pipeline
    let formatted = response;

    // Format lists if present (keep this for structure)
    formatted = this.formatLists(formatted);

    // Remove any markdown formatting that might interfere with natural flow
    formatted = formatted.replace(/#{1,6}\s/g, ''); // Remove headers
    formatted = formatted.replace(/`{3}[\s\S]*?`{3}/g, ''); // Remove code blocks
    formatted = formatted.replace(/`([^`]+)`/g, '$1'); // Remove inline code
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove bold
    formatted = formatted.replace(/\*([^*]+)\*/g, '$1'); // Remove italic

    return formatted;
  }

  // Helper methods
  private formatLists(text: string): string {
    return text.replace(/(?:^|\n)[-*]\s/g, '\n- ');
  }
}

// Export singleton instance
export const textResponseOptimizer = new TextResponseOptimizer();
