import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { Document, Page, Text, View, StyleSheet, renderToStream } from '@react-pdf/renderer';
import React from 'react';
import { getTeamId } from '@/utils/supabase/teams';

// Create styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 50,
    paddingBottom: 80,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1E40AF',
    borderBottomStyle: 'solid',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontFamily: 'Helvetica-Bold',
  },
  content: {
    marginBottom: 40,
  },
  // Heading styles with much better hierarchy
  h1: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 25,
    marginBottom: 15,
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    borderLeftStyle: 'solid',
  },
  h2: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 20,
    marginBottom: 12,
    fontFamily: 'Helvetica-Bold',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    borderBottomStyle: 'solid',
    paddingBottom: 4,
  },
  h3: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 18,
    marginBottom: 10,
    fontFamily: 'Helvetica-Bold',
  },
  h4: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  h5: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
    marginTop: 14,
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
  },
  h6: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
    marginTop: 12,
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
  },
  // Text styles
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151',
    marginBottom: 12,
    textAlign: 'left',
  },
  // Improved list styles
  listContainer: {
    marginBottom: 15,
    marginTop: 5,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  listBullet: {
    width: 20,
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    paddingTop: 1,
  },
  listContent: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.5,
    color: '#374151',
  },
  // Nested list styles
  nestedListContainer: {
    marginLeft: 20,
    marginTop: 5,
    marginBottom: 10,
  },
  nestedListItem: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  nestedListBullet: {
    width: 20,
    fontSize: 10,
    color: '#64748B',
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  nestedListContent: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
    color: '#475569',
  },
  // Code styles
  codeBlock: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 15,
    marginVertical: 15,
    fontSize: 10,
    fontFamily: 'Courier',
    color: '#1E293B',
    lineHeight: 1.4,
  },
  // Quote styles
  blockquote: {
    backgroundColor: '#FEF7CD',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderLeftStyle: 'solid',
    padding: 15,
    marginVertical: 15,
    fontStyle: 'italic',
    color: '#92400E',
    fontSize: 11,
  },
  // Horizontal rule
  horizontalRule: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    borderBottomStyle: 'solid',
    marginVertical: 20,
    height: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#9CA3AF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
});

// Enhanced markdown parser with better formatting
function parseMarkdownToElements(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactElement[] = [];
  let currentList: React.ReactElement[] = [];
  let listCounter = 0;
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let isOrderedList = false;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        React.createElement(View, { key: `list-${elements.length}`, style: styles.listContainer }, currentList)
      );
      currentList = [];
      listCounter = 0;
      isOrderedList = false;
    }
  };

  const flushCodeBlock = () => {
    if (codeBlockLines.length > 0) {
      elements.push(
        React.createElement(Text, { 
          key: `code-${elements.length}`, 
          style: styles.codeBlock 
        }, codeBlockLines.join('\n'))
      );
      codeBlockLines = [];
    }
  };

  // Function to parse inline formatting (bold, italic)
  const parseInlineText = (text: string) => {
    // Remove markdown bold syntax and return clean text
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1')      // Remove *italic*
      .replace(/`(.*?)`/g, '$1')        // Remove `code`
      .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Remove [links](url)
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Handle code blocks
    if (trimmedLine.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Empty line
    if (!trimmedLine) {
      flushList();
      continue;
    }

    // Horizontal rule
    if (trimmedLine === '---') {
      flushList();
      elements.push(
        React.createElement(View, { key: `hr-${i}`, style: styles.horizontalRule })
      );
      continue;
    }

    // Check for headings first - look for lines that start with **number. text:**
    const headingPattern = /^\*\*(\d+(?:\.\d+)*)\.\s+(.+?):\*\*(.*)$/;
    const headingMatch = trimmedLine.match(headingPattern);
    
    if (headingMatch) {
      flushList();
      const number = headingMatch[1];
      const title = headingMatch[2];
      const rest = headingMatch[3];
      
      // Determine heading level based on number of dots
      const level = (number.match(/\./g) || []).length + 1;
      const headingStyle = level === 1 ? styles.h1 : 
                          level === 2 ? styles.h2 : 
                          level === 3 ? styles.h3 : 
                          level === 4 ? styles.h4 : 
                          level === 5 ? styles.h5 : styles.h6;
      
      const fullTitle = `${number}. ${title}`;
      elements.push(
        React.createElement(Text, { 
          key: `heading-${i}`, 
          style: headingStyle 
        }, fullTitle)
      );
      
      // If there's content after the colon, add it as a paragraph
      if (rest.trim()) {
        elements.push(
          React.createElement(Text, { 
            key: `para-after-heading-${i}`, 
            style: styles.paragraph 
          }, parseInlineText(rest.trim()))
        );
      }
      continue;
    }

    // Regular markdown headings (# ## ### etc.)
    const markdownHeadingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (markdownHeadingMatch) {
      flushList();
      const level = markdownHeadingMatch[1].length;
      const text = parseInlineText(markdownHeadingMatch[2]);
      const headingStyle = level === 1 ? styles.h1 : 
                          level === 2 ? styles.h2 : 
                          level === 3 ? styles.h3 : 
                          level === 4 ? styles.h4 : 
                          level === 5 ? styles.h5 : styles.h6;
      
      elements.push(
        React.createElement(Text, { 
          key: `heading-${i}`, 
          style: headingStyle 
        }, text)
      );
      continue;
    }

    // Lists - both bullet and numbered
    const bulletMatch = trimmedLine.match(/^[-*+]\s+(.+)$/);
    const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
    
    if (bulletMatch || numberedMatch) {
      const content = bulletMatch ? bulletMatch[1] : numberedMatch![1];
      const isThisOrdered = !!numberedMatch;
      
      // Reset counter if switching list types
      if (isThisOrdered !== isOrderedList) {
        listCounter = 0;
        isOrderedList = isThisOrdered;
      }
      
      if (isThisOrdered) {
        listCounter++;
      }
      
      currentList.push(
        React.createElement(View, { key: `list-item-${i}`, style: styles.listItem },
          React.createElement(Text, { style: styles.listBullet }, 
            isThisOrdered ? `${listCounter}.` : '•'
          ),
          React.createElement(Text, { style: styles.listContent }, parseInlineText(content))
        )
      );
      continue;
    }

    // Blockquotes
    if (trimmedLine.startsWith('>')) {
      flushList();
      const content = parseInlineText(trimmedLine.replace(/^>\s*/, ''));
      elements.push(
        React.createElement(Text, { 
          key: `quote-${i}`, 
          style: styles.blockquote 
        }, content)
      );
      continue;
    }

    // Regular paragraphs
    if (trimmedLine) {
      flushList();
      
      // Check if this line starts with **text:** pattern (like a definition or key point)
      const boldLabelMatch = trimmedLine.match(/^\*\*([^*]+):\*\*\s*(.*)$/);
      if (boldLabelMatch) {
        const label = boldLabelMatch[1];
        const content = boldLabelMatch[2];
        
        elements.push(
          React.createElement(View, { key: `bold-para-${i}`, style: { marginBottom: 10 } },
            React.createElement(Text, { 
              style: { ...styles.paragraph, fontFamily: 'Helvetica-Bold', marginBottom: 0 } 
            }, `${label}: `),
            React.createElement(Text, { 
              style: { ...styles.paragraph, marginBottom: 0 } 
            }, parseInlineText(content))
          )
        );
      } else {
        // Regular paragraph
        elements.push(
          React.createElement(Text, { 
            key: `para-${i}`, 
            style: styles.paragraph 
          }, parseInlineText(trimmedLine))
        );
      }
    }
  }

  flushList();
  flushCodeBlock();
  return elements;
}

// Create the PDF Document
function createSOPDocument(sop: any) {
  const currentDate = new Date().toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });

  return React.createElement(Document, {
    title: sop.title,
    author: 'Trade Business School',
    subject: 'Standard Operating Procedure',
    creator: 'Trade Business School SOP Generator'
  },
    React.createElement(Page, { size: "A4", style: styles.page },
      // Header
      React.createElement(View, { style: styles.header },
        React.createElement(Text, { style: styles.title }, sop.title),
        React.createElement(Text, { style: styles.subtitle }, "Standard Operating Procedure")
      ),
      
      // Content
      React.createElement(View, { style: styles.content }, 
        ...parseMarkdownToElements(sop.content)
      ),
      
      // Footer
      React.createElement(Text, { style: styles.footer, fixed: true }, 
        `Generated by Trade Business School on ${currentDate} | This document is confidential and proprietary`
      )
    )
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const teamId = await getTeamId(supabase, user.id);
    const { sopId } = await req.json();

    if (!sopId) {
      return new NextResponse("SOP ID is required", { status: 400 });
    }

    // Fetch the specific SOP for the team
    const { data: sop, error: sopError } = await supabase
      .from('sop_data')
      .select('title, content, version, metadata')
      .eq('id', sopId)
      .eq('user_id', teamId)
      .single();

    if (sopError || !sop) {
      return new NextResponse("SOP not found or access denied", { status: 404 });
    }

    // Create a new PDF document
    const pdfDoc = createSOPDocument(sop);
    const stream = await renderToStream(pdfDoc);

    const companyName = sop.metadata?.company_name || 'SOP';
    const sanitizedCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${sanitizedCompanyName}_V${sop.version}.pdf`;

    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
      status: 200,
    });

  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
} 