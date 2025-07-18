import { useState, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ContextualMemory {
  storeMessage: (message: Message, conversationId: string) => Promise<void>;
  getRelevantContext: (query: string, conversationId: string) => Promise<Message[]>;
  storeInstruction: (instruction: string, metadata?: Record<string, any>) => Promise<void>;
  getRelevantInstructions: (query: string) => Promise<string[]>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * A hook to provide contextual memory for chat using Qdrant vector store
 */
export function useContextualMemory(): ContextualMemory {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Store a chat message in Qdrant
  const storeMessage = useCallback(async (
    message: Message,
    conversationId: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/qdrant/chat-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...message,
          conversationId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to store message');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get relevant context from chat history based on a query
  const getRelevantContext = useCallback(async (
    query: string,
    conversationId: string
  ): Promise<Message[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/qdrant/chat-history?query=${encodeURIComponent(query)}&conversationId=${encodeURIComponent(conversationId)}`,
        { method: 'GET' }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to retrieve context');
      }
      
      const data = await response.json();
      
      // Extract messages from the search results
      const messages: Message[] = data.data.map((result: any) => ({
        role: result.payload.role,
        content: result.payload.content,
      }));
      
      return messages;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Store an instruction in Qdrant
  const storeInstruction = useCallback(async (
    instruction: string,
    metadata: Record<string, any> = {}
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/qdrant/instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instruction,
          metadata,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to store instruction');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get relevant instructions based on a query
  const getRelevantInstructions = useCallback(async (
    query: string
  ): Promise<string[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/qdrant/instructions?query=${encodeURIComponent(query)}`,
        { method: 'GET' }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to retrieve instructions');
      }
      
      const data = await response.json();
      
      // Extract instructions from the search results
      const instructions: string[] = data.data.map((result: any) => result.payload.instruction);
      
      return instructions;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    storeMessage,
    getRelevantContext,
    storeInstruction,
    getRelevantInstructions,
    isLoading,
    error,
  };
} 