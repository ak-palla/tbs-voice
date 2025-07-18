import { SupabaseClient } from "@supabase/supabase-js";
import { getRelevantInstructions, generateQueryEmbedding } from "./embeddings";

interface RAGOptimizationConfig {
  minSimilarityThreshold: number;
  maxSimilarityThreshold: number;
  targetResultCount: number;
  diversityWeight: number;
  recencyWeight: number;
  priorityWeight: number;
}

const DEFAULT_CONFIG: RAGOptimizationConfig = {
  minSimilarityThreshold: 0.5,
  maxSimilarityThreshold: 0.8,
  targetResultCount: 5,
  diversityWeight: 0.2,
  recencyWeight: 0.1,
  priorityWeight: 0.3
};

interface OptimizedResult {
  instruction: any;
  score: number;
  similarity: number;
  diversityBonus: number;
  recencyBonus: number;
  priorityBonus: number;
}

export class RAGOptimizer {
  private config: RAGOptimizationConfig;

  constructor(config: Partial<RAGOptimizationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get optimally ranked instructions for a query
   */
  async getOptimizedInstructions(
    supabase: SupabaseClient,
    query: string,
    limit: number = 5
  ): Promise<any[]> {
    console.log(`🎯 [RAG OPTIMIZER] Optimizing retrieval for: "${query.substring(0, 50)}..."`);
    
    // Step 1: Cast a wide net with lower threshold
    const wideResults = await getRelevantInstructions(
      supabase, 
      query, 
      Math.max(15, limit * 3), // Get more candidates
      this.config.minSimilarityThreshold
    );

    if (wideResults.length === 0) {
      console.log(`⚠️ [RAG OPTIMIZER] No results found, falling back to priority-based selection`);
      return await this.getFallbackInstructions(supabase, limit);
    }

    // Step 2: Apply optimization scoring
    const optimizedResults = await this.applyOptimizationScoring(wideResults, query);

    // Step 3: Select top results ensuring diversity
    const finalResults = this.selectDiverseResults(optimizedResults, limit);

    console.log(`✅ [RAG OPTIMIZER] Selected ${finalResults.length} optimized instructions`);
    console.log(`📊 [RAG OPTIMIZER] Average similarity: ${(finalResults.reduce((sum, r) => sum + r.similarity, 0) / finalResults.length).toFixed(3)}`);

    return finalResults.map(r => r.instruction);
  }

  /**
   * Apply advanced scoring to rank instructions
   */
  private async applyOptimizationScoring(
    instructions: any[],
    query: string
  ): Promise<OptimizedResult[]> {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
    const now = new Date();

    return instructions.map(instruction => {
      const baseSimilarity = (instruction as any).similarity || 0;

      // Diversity bonus - reward instructions from different categories
      const category = instruction.category || 'uncategorized';
      const diversityBonus = this.calculateDiversityBonus(category, instructions);

      // Recency bonus - prefer more recently updated content
      const updatedAt = new Date(instruction.updated_at || instruction.created_at);
      const daysSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      const recencyBonus = Math.max(0, 1 - (daysSinceUpdate / 365)) * this.config.recencyWeight;

      // Priority bonus - use instruction priority levels
      const priority = instruction.priority || 0;
      const priorityBonus = (priority / 3) * this.config.priorityWeight;

      // Content relevance bonus - keyword matching
      const titleRelevance = this.calculateTitleRelevance(instruction.title || '', queryWords);
      const contentRelevance = this.calculateContentRelevance(instruction.content || '', queryWords);
      const relevanceBonus = (titleRelevance * 0.3 + contentRelevance * 0.1);

      // Final composite score
      const score = baseSimilarity + 
                   (diversityBonus * this.config.diversityWeight) + 
                   recencyBonus + 
                   priorityBonus + 
                   relevanceBonus;

      return {
        instruction,
        score,
        similarity: baseSimilarity,
        diversityBonus,
        recencyBonus,
        priorityBonus
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate diversity bonus for category distribution
   */
  private calculateDiversityBonus(category: string, allInstructions: any[]): number {
    const categoryCount = allInstructions.filter(i => (i.category || 'uncategorized') === category).length;
    const totalCount = allInstructions.length;
    
    // Reward less common categories
    return Math.max(0, 1 - (categoryCount / totalCount));
  }

  /**
   * Calculate title relevance based on keyword matching
   */
  private calculateTitleRelevance(title: string, queryWords: string[]): number {
    const titleLower = title.toLowerCase();
    const matches = queryWords.filter(word => titleLower.includes(word)).length;
    return queryWords.length > 0 ? matches / queryWords.length : 0;
  }

  /**
   * Calculate content relevance based on keyword density
   */
  private calculateContentRelevance(content: string, queryWords: string[]): number {
    const contentLower = content.toLowerCase();
    const contentWords = contentLower.split(/\s+/).length;
    
    if (contentWords === 0) return 0;
    
    const matches = queryWords.reduce((sum, word) => {
      const regex = new RegExp(word, 'gi');
      const wordMatches = (contentLower.match(regex) || []).length;
      return sum + wordMatches;
    }, 0);
    
    return Math.min(1, matches / Math.max(contentWords * 0.1, 1));
  }

  /**
   * Select diverse results ensuring good category distribution
   */
  private selectDiverseResults(
    optimizedResults: OptimizedResult[],
    limit: number
  ): OptimizedResult[] {
    const selected: OptimizedResult[] = [];
    const categoryCount: Record<string, number> = {};

    for (const result of optimizedResults) {
      if (selected.length >= limit) break;

      const category = result.instruction.category || 'uncategorized';
      const currentCategoryCount = categoryCount[category] || 0;

      // Prefer results from under-represented categories
      const maxPerCategory = Math.ceil(limit / 3); // Allow max 1/3 from same category
      
      if (currentCategoryCount < maxPerCategory || selected.length < limit * 0.8) {
        selected.push(result);
        categoryCount[category] = currentCategoryCount + 1;
      }
    }

    // Fill remaining slots with best remaining results if needed
    if (selected.length < limit) {
      const remaining = optimizedResults.filter(r => !selected.includes(r));
      selected.push(...remaining.slice(0, limit - selected.length));
    }

    return selected;
  }

  /**
   * Fallback when no semantic results found
   */
  private async getFallbackInstructions(
    supabase: SupabaseClient,
    limit: number
  ): Promise<any[]> {
    const { data: fallback } = await supabase
      .from('chatbot_instructions')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    return fallback || [];
  }

  /**
   * Analyze query to determine optimal retrieval strategy
   */
  analyzeQuery(query: string): {
    type: 'specific' | 'general' | 'exploratory' | 'organizational';
    suggestedThreshold: number;
    suggestedLimit: number;
  } {
    const queryLower = query.toLowerCase();
    const wordCount = query.split(/\s+/).length;

    // Organizational/Leadership queries (chain of command, hierarchy, structure)
    const organizationalPatterns = [
      'chain of command', 'organizational structure', 'hierarchy', 'leadership structure',
      'team structure', 'command structure', 'organization chart', 'reporting structure',
      'delegation', 'authority', 'management levels', 'organizational design',
      'team leadership', 'company structure', 'business hierarchy', 'roles and responsibilities'
    ];
    const isOrganizational = organizationalPatterns.some(pattern => queryLower.includes(pattern));

    // Specific queries (detailed questions)
    const specificPatterns = ['how to', 'what is', 'how do i', 'can you help', 'steps to', 'guide to'];
    const isSpecific = specificPatterns.some(pattern => queryLower.includes(pattern)) || wordCount > 8;

    // General queries (broad topics)
    const generalPatterns = ['help', 'improve', 'business', 'strategy', 'marketing'];
    const isGeneral = generalPatterns.some(pattern => queryLower.includes(pattern)) && wordCount <= 5;

    if (isOrganizational) {
      return {
        type: 'organizational',
        suggestedThreshold: 0.6, // Medium threshold for organizational structure queries
        suggestedLimit: 4
      };
    } else if (isSpecific) {
      return {
        type: 'specific',
        suggestedThreshold: 0.7, // Higher threshold for precise matching
        suggestedLimit: 3
      };
    } else if (isGeneral) {
      return {
        type: 'general',
        suggestedThreshold: 0.5, // Lower threshold for broader results
        suggestedLimit: 7
      };
    } else {
      return {
        type: 'exploratory',
        suggestedThreshold: 0.6, // Balanced threshold
        suggestedLimit: 5
      };
    }
  }
}

// Export singleton instance
export const ragOptimizer = new RAGOptimizer(); 