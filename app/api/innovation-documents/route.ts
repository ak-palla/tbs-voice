import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Helper function to get user ID from request
async function getUserId(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id; 
  } catch (error) {
    console.error("Error getting user session:", error);
    return null;
  }
}

// Helper function to extract text from different file types using existing APIs
async function extractTextContent(file: File, fileName: string): Promise<string> {
  const fileType = file.type;
  
  try {
    console.log(`📄 [Document Extraction] Processing file: ${fileName}, type: ${fileType}`);
    
    if (fileType === 'text/plain' || fileType === 'text/markdown') {
      const content = await file.text();
      console.log(`✅ [Document Extraction] Text file processed, content length: ${content.length}`);
      return content;
    }
    
    if (fileType === 'application/pdf') {
      console.log('🔄 [Document Extraction] Processing PDF with extraction API...');
      // Import PDF extraction directly
      const pdfParse = (await import('pdf-parse')).default;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdfParse(buffer);
      console.log(`✅ [Document Extraction] PDF processed, content length: ${data.text.length}`);
      return data.text || '';
    }
    
    if (fileType.includes('word') || fileType.includes('document')) {
      console.log('🔄 [Document Extraction] Processing Word document with extraction API...');
      // Import mammoth for DOCX extraction
      const mammoth = (await import('mammoth')).default;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      console.log(`✅ [Document Extraction] Word document processed, content length: ${result.value.length}`);
      return result.value || '';
    }
    
    console.log('⚠️ [Document Extraction] Unsupported file type, returning empty content');
    return '';
  } catch (error) {
    console.error('❌ [Document Extraction] Error extracting text content:', error);
    return '';
  }
}

// GET - Fetch user's innovation documents
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    
    const { data: documents, error } = await supabase
      .from('innovation_documents')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching innovation documents:', error);
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }

    return NextResponse.json({ documents: documents || [] });
  } catch (error) {
    console.error('Error in GET /api/innovation-documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Upload new innovation document
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const supabase = await createClient();

    // Create initial document record
    const { data: document, error: insertError } = await supabase
      .from('innovation_documents')
      .insert({
        user_id: userId,
        title: title || file.name.replace(/\.[^/.]+$/, ""),
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        upload_status: 'processing',
        is_active: true
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error creating document record:', insertError);
      return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 });
    }

    // Start content extraction process
    console.log(`🔄 [Innovation Documents] Starting extraction for document: ${document.id}`);
    
    try {
      const extractedContent = await extractTextContent(file, file.name);
      console.log(`✅ [Innovation Documents] Extraction completed, content length: ${extractedContent.length}`);
      
      if (extractedContent && extractedContent.length > 0) {
        // Update document with extracted content
        const { error: updateError } = await supabase
          .from('innovation_documents')
          .update({
            extracted_content: extractedContent,
            upload_status: 'completed',
            extraction_metadata: {
              extracted_at: new Date().toISOString(),
              content_length: extractedContent.length,
              extraction_method: file.type.includes('pdf') ? 'pdf' : 
                                file.type.includes('word') ? 'word' : 'text',
              file_type: file.type,
              original_name: file.name
            }
          })
          .eq('id', document.id);

        if (updateError) {
          console.error('❌ [Innovation Documents] Error updating document with extracted content:', updateError);
          await supabase
            .from('innovation_documents')
            .update({ 
              upload_status: 'error',
              extraction_metadata: {
                error: 'Failed to save extracted content',
                error_details: updateError.message,
                extracted_at: new Date().toISOString()
              }
            })
            .eq('id', document.id);
        } else {
          console.log(`✅ [Innovation Documents] Document ${document.id} successfully updated with extracted content`);
        }
      } else {
        console.log(`⚠️ [Innovation Documents] No content extracted from document: ${document.id}`);
        await supabase
          .from('innovation_documents')
          .update({ 
            upload_status: 'error',
            extraction_metadata: {
              error: 'No content could be extracted from the document',
              extracted_at: new Date().toISOString(),
              file_type: file.type,
              original_name: file.name
            }
          })
          .eq('id', document.id);
      }
    } catch (extractionError) {
      console.error('❌ [Innovation Documents] Error during content extraction:', extractionError);
      await supabase
        .from('innovation_documents')
        .update({ 
          upload_status: 'error',
          extraction_metadata: {
            error: 'Content extraction failed',
            error_details: extractionError instanceof Error ? extractionError.message : 'Unknown error',
            extracted_at: new Date().toISOString(),
            file_type: file.type,
            original_name: file.name
          }
        })
        .eq('id', document.id);
    }

    return NextResponse.json({ 
      document: {
        ...document,
        upload_status: 'completed' // Optimistically return as completed
      }
    });
  } catch (error) {
    console.error('Error in POST /api/innovation-documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete innovation document
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId } = await req.json();
    
    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Soft delete - mark as inactive
    const { error } = await supabase
      .from('innovation_documents')
      .update({ is_active: false })
      .eq('id', documentId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting innovation document:', error);
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/innovation-documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 