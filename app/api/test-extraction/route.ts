import { NextRequest, NextResponse } from 'next/server';

// Helper function to extract text from different file types
async function extractTextContent(file: File, fileName: string): Promise<string> {
  const fileType = file.type;
  
  try {
    console.log(`📄 [Test Extraction] Processing file: ${fileName}, type: ${fileType}`);
    
    if (fileType === 'text/plain' || fileType === 'text/markdown') {
      const content = await file.text();
      console.log(`✅ [Test Extraction] Text file processed, content length: ${content.length}`);
      return content;
    }
    
    if (fileType === 'application/pdf') {
      console.log('🔄 [Test Extraction] Processing PDF...');
      const pdfParse = (await import('pdf-parse')).default;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdfParse(buffer);
      console.log(`✅ [Test Extraction] PDF processed, content length: ${data.text.length}`);
      return data.text || '';
    }
    
    if (fileType.includes('word') || fileType.includes('document')) {
      console.log('🔄 [Test Extraction] Processing Word document...');
      const mammoth = (await import('mammoth')).default;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      console.log(`✅ [Test Extraction] Word document processed, content length: ${result.value.length}`);
      return result.value || '';
    }
    
    console.log('⚠️ [Test Extraction] Unsupported file type, returning empty content');
    return '';
  } catch (error) {
    console.error('❌ [Test Extraction] Error extracting text content:', error);
    throw error;
  }
}

// POST - Test document extraction without database
export async function POST(req: NextRequest) {
  try {
    console.log('🧪 [Test Extraction] Starting test extraction...');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`📁 [Test Extraction] File received: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Extract content
    const extractedContent = await extractTextContent(file, file.name);
    
    console.log(`✅ [Test Extraction] Extraction completed successfully`);
    
    return NextResponse.json({ 
      success: true,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      extractedContentLength: extractedContent.length,
      extractedContent: extractedContent.substring(0, 500) + (extractedContent.length > 500 ? '...' : ''),
      fullContentAvailable: extractedContent.length > 0
    });
    
  } catch (error) {
    console.error('❌ [Test Extraction] Error:', error);
    return NextResponse.json({ 
      error: 'Extraction failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 