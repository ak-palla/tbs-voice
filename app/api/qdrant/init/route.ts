import { NextResponse } from 'next/server';
import { initializeQdrantCollections } from '@/lib/qdrant';

export async function GET() {
  try {
    await initializeQdrantCollections();
    return NextResponse.json(
      { success: true, message: 'Qdrant collections initialized successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error initializing Qdrant collections:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to initialize Qdrant collections',
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 