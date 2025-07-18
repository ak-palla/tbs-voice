import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";
import mammoth from "mammoth";
import { Document } from "docx";
import { createClient } from "@/utils/supabase/server";

// Initialize Google Docs API
const docs = google.docs("v1");

export async function POST(request: Request) {
  try {
    let file: File | null = null;
    let url: string | null = null;

    // Check if the request is multipart/form-data
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      file = formData.get("file") as File;
    } else {
      // Handle JSON request body
      const body = await request.json();
      url = body.url;
    }

    if (!file && !url) {
      return NextResponse.json(
        { error: "Either file or URL is required" },
        { status: 400 }
      );
    }

    let content = "";
    let fileName = "";

    if (file) {
      // Handle file upload
      if (!file.type.includes("document")) {
        return NextResponse.json(
          { error: "Only document files are allowed" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const stream = Readable.from(buffer);
      
      content = await extractTextFromDocument(stream, file.name);
      fileName = file.name;
    } else if (url) {
      // Handle Google Docs URL
      if (!url.includes("docs.google.com")) {
        return NextResponse.json(
          { error: "Only Google Docs URLs are supported" },
          { status: 400 }
        );
      }

      const docId = extractDocIdFromUrl(url);
      if (!docId) {
        return NextResponse.json(
          { error: "Invalid Google Docs URL" },
          { status: 400 }
        );
      }

      content = await extractTextFromGoogleDoc(docId);
      fileName = url.split("/").pop() || "document";
    }

    return NextResponse.json({
      content,
      fileName,
      extractionDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error extracting document content:", error);
    return NextResponse.json(
      { error: "Failed to extract document content" },
      { status: 500 }
    );
  }
}

async function extractTextFromDocument(stream: Readable, fileName: string): Promise<string> {
  try {
    if (fileName.endsWith('.docx')) {
      const buffer = await streamToBuffer(stream);
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (fileName.endsWith('.doc')) {
      // For .doc files, we'll need to convert them to .docx first
      // This is a placeholder - you'll need to implement the conversion
      throw new Error("DOC file conversion not implemented yet");
    } else if (fileName.endsWith('.odt')) {
      // For ODT files, we'll need to implement ODT parsing
      // This is a placeholder - you'll need to implement the parsing
      throw new Error("ODT file parsing not implemented yet");
    } else {
      throw new Error("Unsupported document format");
    }
  } catch (error) {
    console.error("Error extracting text from document:", error);
    throw new Error("Failed to extract text from document");
  }
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function extractTextFromGoogleDoc(docId: string): Promise<string> {
  try {
    // For public Google Docs, we can fetch the content directly
    const publicUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
    const response = await fetch(publicUrl);
    
    if (!response.ok) {
      throw new Error("Failed to fetch document content");
    }
    
    const content = await response.text();
    return content;
  } catch (error) {
    console.error("Error extracting text from Google Doc:", error);
    throw new Error("Failed to extract text from Google Doc");
  }
}

function extractDocIdFromUrl(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
} 