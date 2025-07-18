import { NextRequest, NextResponse } from 'next/server';
import { getResponseWithContext } from '@/lib/contextual-llm';

export async function POST(request: NextRequest) {
  try {
    const { messages, conversationId, relevantMessages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Get response from the LLM with enhanced context
    const response = await getResponseWithContext(
      messages,
      conversationId,
      {
        includeInstructions: true,
        maxInstructions: 3,
        maxHistoryContextItems: 5,
        model: 'gpt-4-0613', // You can adjust the model as needed
      }
    );

    return NextResponse.json(
      {
        content: response.content,
        augmentedMessages: response.augmentedMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
} 