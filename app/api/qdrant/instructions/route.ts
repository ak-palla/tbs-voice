import { NextRequest, NextResponse } from 'next/server';
import { storeInstruction, searchInstructions } from '@/lib/embeddings';

// POST endpoint to store new instructions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instruction, metadata } = body;

    if (!instruction || typeof instruction !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Instruction is required and must be a string' },
        { status: 400 }
      );
    }

    const result = await storeInstruction(instruction, metadata || {});
    return NextResponse.json(
      { success: true, message: 'Instruction stored successfully', data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error storing instruction:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to store instruction',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET endpoint to search for relevant instructions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limitParam = searchParams.get('limit');

    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 5;
    const results = await searchInstructions(query, limit);

    return NextResponse.json(
      { success: true, data: results },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error searching instructions:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to search instructions',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
} 