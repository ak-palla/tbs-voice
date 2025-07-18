import { NextRequest, NextResponse } from 'next/server';
import { storeChatMessage, searchChatHistory } from '@/lib/embeddings';

// POST endpoint to store chat messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, content, conversationId } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Message content is required and must be a string' },
        { status: 400 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { success: false, message: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    if (!role || !['user', 'assistant', 'system'].includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Valid role (user, assistant, or system) is required' },
        { status: 400 }
      );
    }

    const result = await storeChatMessage({
      role,
      content,
      conversationId,
    });

    return NextResponse.json(
      { success: true, message: 'Chat message stored successfully', data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error storing chat message:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to store chat message',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET endpoint to search for relevant chat history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const conversationId = searchParams.get('conversationId');
    const limitParam = searchParams.get('limit');

    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Query parameter is required' },
        { status: 400 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { success: false, message: 'Conversation ID parameter is required' },
        { status: 400 }
      );
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const results = await searchChatHistory(query, conversationId, limit);

    return NextResponse.json(
      { success: true, data: results },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error searching chat history:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to search chat history',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
} 