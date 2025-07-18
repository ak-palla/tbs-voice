# Qdrant Vector Database Setup

This document explains how to set up and use Qdrant as a vector database for contextual memory in your Next.js application.

## What is Qdrant?

Qdrant is a vector similarity search engine that provides a production-ready service with a convenient API to store, search, and manage vectors with an additional payload. It's perfect for storing embeddings and implementing semantic search.

## Setup Options

### Option 1: Local Docker Installation

1. Install Docker on your system if you haven't already.

2. Run the Qdrant Docker container:
   ```bash
   docker run -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant
   ```

   This will start Qdrant on port 6333 and persist data in a `qdrant_storage` directory.

### Option 2: Qdrant Cloud

1. Sign up for a free account at [Qdrant Cloud](https://qdrant.tech/cloud/).

2. Create a new cluster and get your API key and endpoint URL.

## Configuration

1. Add the following environment variables to your `.env` file:

   ```
   # Qdrant Configuration
   QDRANT_URL=http://localhost:6333
   QDRANT_API_KEY=your_api_key_if_using_qdrant_cloud

   # OpenAI API Key for embeddings and chat completions
   OPENAI_API_KEY=your_openai_api_key
   ```

   If using Qdrant Cloud, set `QDRANT_URL` to your cloud endpoint URL.

## Initialize Collections

Before using Qdrant, you need to initialize the collections by calling the `/api/qdrant/init` endpoint:

```bash
curl http://localhost:3000/api/qdrant/init
```

This will create the necessary collections:
- `instructions` - For storing system instructions
- `chat_history` - For storing chat messages

## API Endpoints

The following API endpoints are available:

### Instructions

- **POST** `/api/qdrant/instructions` - Store a new instruction
  ```json
  {
    "instruction": "String instruction to store",
    "metadata": { "optional": "metadata" }
  }
  ```

- **GET** `/api/qdrant/instructions?query=your+search+query` - Search for relevant instructions

### Chat History

- **POST** `/api/qdrant/chat-history` - Store a chat message
  ```json
  {
    "role": "user" | "assistant" | "system",
    "content": "Message content",
    "conversationId": "unique-conversation-id"
  }
  ```

- **GET** `/api/qdrant/chat-history?query=your+search+query&conversationId=unique-conversation-id` - Search for relevant chat history

## React Hook

A React hook `useContextualMemory` is provided to make it easy to integrate with your frontend:

```typescript
import { useContextualMemory } from '@/hooks/useContextualMemory';

function ChatComponent() {
  const {
    storeMessage,
    getRelevantContext,
    storeInstruction,
    getRelevantInstructions,
    isLoading,
    error,
  } = useContextualMemory();

  // Use these functions in your chat component
}
```

## LLM Integration

The `lib/contextual-llm.ts` file provides a utility function `getResponseWithContext` that can be used to enhance LLM responses with relevant context:

```typescript
import { getResponseWithContext } from '@/lib/contextual-llm';

const response = await getResponseWithContext(
  messages,
  conversationId,
  {
    includeInstructions: true,
    maxInstructions: 3,
    maxHistoryContextItems: 5,
    model: 'gpt-4-0613',
  }
);
```

## Vector Dimensions

By default, the system is configured to use OpenAI's embeddings with dimension size 1536. If you're using a different embedding model, you may need to adjust the `VECTOR_SIZE` in `lib/qdrant.ts`. 