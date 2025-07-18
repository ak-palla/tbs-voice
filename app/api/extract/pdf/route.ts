import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import pdfParse from 'pdf-parse';
import fetch from 'node-fetch';

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    let content = '';
    let fileName = '';
    
    // Check if the request is a multipart form data (file upload)
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }
      
      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdfParse(buffer);
      content = data.text;
    } else {
      // Handle URL-based extraction
      const { url } = await req.json();
      
      if (!url) {
        return NextResponse.json(
          { error: 'URL is required' },
          { status: 400 }
        );
      }
      
      fileName = url.split('/').pop() || 'unknown';
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const data = await pdfParse(buffer);
        content = data.text;
      } catch (parseError) {
        console.error('PDF fetch/parse error:', parseError);
        const errorMessage = parseError instanceof Error ? parseError.message : 'Failed to process PDF';
        return NextResponse.json(
          { error: errorMessage },
          { status: 500 }
        );
      }
    }
    
    // Optionally limit content length if needed
    const MAX_LENGTH = 100000; // Increased from 10000 to 100000
    if (content.length > MAX_LENGTH) {
      content = content.substring(0, MAX_LENGTH) + '\n... [Content truncated]';
    }
    
    return NextResponse.json({ 
      content,
      metadata: {
        file_name: fileName,
        extraction_date: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('PDF Content extraction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract PDF content';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
