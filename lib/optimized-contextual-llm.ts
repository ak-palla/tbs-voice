/**
 * Optimized Contextual LLM with caching and performance improvements
 */

import { OpenAI } from 'openai';
import { searchChatHistory, searchInstructions } from './embeddings';
import { performanceCache, CacheKeys } from './performance-cache';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Optimized version of getResponseWithContext with caching and performance improvements
 */
export async function getOptimizedResponseWithContext(
  messages: Message[],
  conversationId: string,
  options: {
    includeInstructions?: boolean;
    maxInstructions?: number;
    maxHistoryContextItems?: number;
    model?: string;
  } = {}
) {
  const startTime = performance.now();
  console.time('🔍 Optimized Context Processing');
  
  try {
    const {
      includeInstructions = true,
      maxInstructions = 3,
      maxHistoryContextItems = 5,
      model = 'gpt-4-0613',
    } = options;

    // Get the latest user message
    const latestUserMessage = [...messages]
      .reverse()
      .find(msg => msg.role === 'user');

    if (!latestUserMessage) {
      throw new Error('No user message found in the conversation');
    }

    // Cache keys for vector searches
    const historyCacheKey = CacheKeys.vectorSearch(latestUserMessage.content, 'history');
    const instructionsCacheKey = CacheKeys.vectorSearch(latestUserMessage.content, 'instructions');

    // Try to get cached results first
    let relevantHistory: Message[] = [];
    let relevantInstructions: string[] = [];

    const cachedHistory = performanceCache.get<Message[]>(historyCacheKey);
    const cachedInstructions = performanceCache.get<string[]>(instructionsCacheKey);

    if (cachedHistory && cachedInstructions) {
      console.log('✅ [Optimized] Using cached vector search results');
      relevantHistory = cachedHistory;
      relevantInstructions = cachedInstructions;
    } else {
      // Perform vector searches in parallel
      const searchPromises: Promise<any>[] = [];

      if (maxHistoryContextItems > 0) {
        searchPromises.push(
          searchChatHistory(latestUserMessage.content, conversationId, maxHistoryContextItems)
            .then(results => ({ type: 'history', results }))
        );
      }

      if (includeInstructions && maxInstructions > 0) {
        searchPromises.push(
          searchInstructions(latestUserMessage.content, maxInstructions)
            .then(results => ({ type: 'instructions', results }))
        );
      }

      console.time('📄 Parallel Vector Searches');
      const searchResults = await Promise.all(searchPromises);
      console.timeEnd('📄 Parallel Vector Searches');

      // Process search results
      for (const { type, results } of searchResults) {
        if (type === 'history') {
          relevantHistory = results
            .filter((result: any) => result.payload && typeof result.payload.content === 'string')
            .map((result: any) => ({
              role: (result.payload?.role as 'user' | 'assistant' | 'system') || 'user',
              content: result.payload?.content as string,
            }));
          
          // Cache history results for 2 minutes
          performanceCache.set(historyCacheKey, relevantHistory, 2 * 60 * 1000);
        } else if (type === 'instructions') {
          relevantInstructions = results
            .filter((result: any) => result.payload && typeof result.payload.instruction === 'string')
            .map((result: any) => result.payload?.instruction as string);
          
          // Cache instruction results for 5 minutes
          performanceCache.set(instructionsCacheKey, relevantInstructions, 5 * 60 * 1000);
        }
      }
    }

    // Build context messages efficiently
    const contextMessages: Message[] = [];
    
    // Add instructions as system messages
    if (relevantInstructions.length > 0) {
      contextMessages.push({
        role: 'system',
        content: `Relevant instructions for this query:\n${relevantInstructions.map((inst, idx) => `${idx + 1}. ${inst}`).join('\n')}\n\nPlease use these instructions to guide your response.`,
      });
    }
    
    // Add relevant history
    if (relevantHistory.length > 0) {
      contextMessages.push({
        role: 'system',
        content: 'Here is some relevant conversation history that may help you provide a better response:',
      });
      
      contextMessages.push(...relevantHistory);
      
      contextMessages.push({
        role: 'system',
        content: 'Now, please respond to the user\'s current message below:',
      });
    }

    // Combine context messages with the current conversation
    const augmentedMessages = [...contextMessages, ...messages];

    // Get response from the model
    console.time('🤖 Optimized OpenAI API Call');
    const response = await openai.chat.completions.create({
      model,
      messages: augmentedMessages,
      temperature: 0.7, // Add slight creativity
      max_tokens: 2000, // Limit response length for faster processing
    });
    console.timeEnd('🤖 Optimized OpenAI API Call');

    const totalTime = performance.now() - startTime;
    console.timeEnd('🔍 Optimized Context Processing');
    console.log(`⚡ Optimized context processing time: ${totalTime.toFixed(2)}ms`);
    console.log(`📈 Vector results: ${relevantHistory.length} history + ${relevantInstructions.length} instructions`);
    
    return {
      content: response.choices[0].message.content,
      augmentedMessages,
      processingTime: totalTime,
      cacheHits: cachedHistory && cachedInstructions ? 2 : 0
    };
  } catch (error) {
    console.error('Error getting optimized response with context:', error);
    throw error;
  }
}