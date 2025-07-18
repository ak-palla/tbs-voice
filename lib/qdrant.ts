import { QdrantClient } from '@qdrant/js-client-rest';
import { Schemas } from '@qdrant/js-client-rest';

// Define environment variables or use defaults
const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || ''; // Set your API key for Qdrant Cloud

// Collection names
export const COLLECTIONS = {
  INSTRUCTIONS: 'instructions',
  CHAT_HISTORY: 'chat_history',
};

// Initialize the Qdrant client
export const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  ...(QDRANT_API_KEY ? { apiKey: QDRANT_API_KEY } : {}),
});

// Vector dimensions (should match your embedding model)
export const VECTOR_SIZE = 1536; // For OpenAI embeddings, adjust if using a different model

/**
 * Initialize Qdrant collections if they don't exist
 */
export async function initializeQdrantCollections() {
  try {
    // Check if collections exist
    const collectionsInfo = await qdrantClient.getCollections();
    const existingCollections = collectionsInfo.collections.map(c => c.name);

    // Create collections if they don't exist
    for (const collectionName of Object.values(COLLECTIONS)) {
      if (!existingCollections.includes(collectionName)) {
        await qdrantClient.createCollection(collectionName, {
          vectors: {
            size: VECTOR_SIZE,
            distance: 'Cosine',
          },
        });
        console.log(`Created collection: ${collectionName}`);
      }
    }
  } catch (error) {
    console.error('Error initializing Qdrant collections:', error);
    throw error;
  }
}

/**
 * Store vectors in a Qdrant collection
 */
export async function storeVectors(
  collectionName: string,
  points: Schemas['PointStruct'][]
) {
  try {
    await qdrantClient.upsert(collectionName, {
      points,
    });
    return { success: true };
  } catch (error) {
    console.error(`Error storing vectors in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Search for similar vectors in a Qdrant collection
 */
export async function searchVectors(
  collectionName: string,
  vector: number[],
  limit = 5,
  filter?: Schemas['Filter']
) {
  try {
    const results = await qdrantClient.search(collectionName, {
      vector,
      limit,
      filter,
    });
    return results;
  } catch (error) {
    console.error(`Error searching vectors in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Delete vectors from a Qdrant collection by IDs
 */
export async function deleteVectors(
  collectionName: string,
  ids: string[] | number[]
) {
  try {
    await qdrantClient.delete(collectionName, {
      points: ids,
    });
    return { success: true };
  } catch (error) {
    console.error(`Error deleting vectors from ${collectionName}:`, error);
    throw error;
  }
} 