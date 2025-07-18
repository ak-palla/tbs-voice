import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    groq_key_exists: !!process.env.GROQ_API_KEY,
    groq_key_length: process.env.GROQ_API_KEY?.length || 0,
    groq_key_prefix: process.env.GROQ_API_KEY?.substring(0, 10) || 'N/A',
    deepgram_key_exists: !!process.env.DEEPGRAM_API_KEY,
    deepgram_key_length: process.env.DEEPGRAM_API_KEY?.length || 0,
    deepgram_key_prefix: process.env.DEEPGRAM_API_KEY?.substring(0, 10) || 'N/A',
    node_env: process.env.NODE_ENV
  });
}