import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';
import {
  COLLECTIONS,
  storeVectors,
  searchVectors,
  VECTOR_SIZE,
} from './qdrant';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embeddings for a text using OpenAI's embedding model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Store instruction with its embedding in Qdrant
 */
export async function storeInstruction(
  instruction: string,
  metadata: Record<string, any> = {}
) {
  try {
    const embedding = await generateEmbedding(instruction);
    
    // Ensure the embedding has the correct dimension
    if (embedding.length !== VECTOR_SIZE) {
      console.warn(`Warning: Expected embedding size ${VECTOR_SIZE}, got ${embedding.length}`);
    }
    
    const pointId = uuidv4();
    await storeVectors(COLLECTIONS.INSTRUCTIONS, [
      {
        id: pointId,
        vector: embedding,
        payload: {
          instruction,
          createdAt: new Date().toISOString(),
          ...metadata,
        },
      },
    ]);
    
    return { id: pointId, success: true };
  } catch (error) {
    console.error('Error storing instruction:', error);
    throw error;
  }
}

/**
 * Store chat message with its embedding in Qdrant
 */
export async function storeChatMessage(
  message: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    conversationId: string;
  }
) {
  try {
    const embedding = await generateEmbedding(message.content);
    
    // Ensure the embedding has the correct dimension
    if (embedding.length !== VECTOR_SIZE) {
      console.warn(`Warning: Expected embedding size ${VECTOR_SIZE}, got ${embedding.length}`);
    }
    
    const pointId = uuidv4();
    await storeVectors(COLLECTIONS.CHAT_HISTORY, [
      {
        id: pointId,
        vector: embedding,
        payload: {
          ...message,
          createdAt: new Date().toISOString(),
        },
      },
    ]);
    
    return { id: pointId, success: true };
  } catch (error) {
    console.error('Error storing chat message:', error);
    throw error;
  }
}

/**
 * Search for relevant instructions based on a query
 */
export async function searchInstructions(query: string, limit = 5) {
  try {
    const embedding = await generateEmbedding(query);
    const results = await searchVectors(
      COLLECTIONS.INSTRUCTIONS,
      embedding,
      limit
    );
    
    return results;
  } catch (error) {
    console.error('Error searching instructions:', error);
    throw error;
  }
}

/**
 * Search for relevant chat history based on a query and conversation ID
 */
export async function searchChatHistory(
  query: string,
  conversationId: string,
  limit = 10
) {
  try {
    const embedding = await generateEmbedding(query);
    const results = await searchVectors(
      COLLECTIONS.CHAT_HISTORY,
      embedding,
      limit,
      {
        must: [
          {
            key: 'conversationId',
            match: {
              value: conversationId,
            },
          },
        ],
      }
    );
    
    return results;
  } catch (error) {
    console.error('Error searching chat history:', error);
    throw error;
  }
} 