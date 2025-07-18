import { NextResponse } from "next/server";
import { JSDOM } from "jsdom";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove unwanted elements
    const unwantedElements = document.querySelectorAll('script, style, nav, footer, header, iframe, noscript, .sidebar, .menu, .navigation, .ads, .advertisement, .banner, .cookie-notice, .popup, .modal, .overlay');
    unwantedElements.forEach((element: Element) => element.remove());

    // Extract title
    const title = document.querySelector('title')?.textContent || '';

    // Extract main content
    let mainContent = '';
    const possibleContentSelectors = [
      'article',
      'main',
      '.content',
      '#content',
      '.main-content',
      '#main-content',
      '.post-content',
      '.article-content',
      '.entry-content',
      '.post-body',
      '.article-body',
      '.story-body',
      '.post',
      '.article',
      '.blog-post',
      '.news-content',
      '.page-content'
    ];

    // First try to find the main content area
    for (const selector of possibleContentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        // Get all paragraphs and headings
        const paragraphs = element.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
        if (paragraphs.length > 0) {
          mainContent = Array.from(paragraphs)
            .map(p => p.textContent?.trim())
            .filter(text => text && text.length > 0)
            .join('\n\n');
          break;
        }
      }
    }

    // If no main content found, try to find the largest text block
    if (!mainContent) {
      const paragraphs = document.querySelectorAll('p');
      if (paragraphs.length > 0) {
        // Find the largest text block
        let largestBlock = '';
        let maxLength = 0;

        paragraphs.forEach(p => {
          const text = p.textContent?.trim() || '';
          if (text.length > maxLength) {
            maxLength = text.length;
            largestBlock = text;
          }
        });

        if (largestBlock) {
          mainContent = largestBlock;
        }
      }
    }

    // If still no content found, use body text but filter out short lines
    if (!mainContent) {
      const bodyText = document.body.textContent || '';
      mainContent = bodyText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 50) // Only keep lines with substantial content
        .join('\n\n');
    }

    // Clean up the content
    const cleanedContent = cleanText(mainContent);

    return NextResponse.json({
      content: cleanedContent,
      title,
      url,
      extractionDate: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error extracting content from link:", error);
    return NextResponse.json(
      { error: "Failed to extract content from link" },
      { status: 500 }
    );
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim() // Remove leading/trailing whitespace
    .replace(/[^\S\n]+/g, ' ') // Replace multiple spaces with single space (except newlines)
    .replace(/\n\s*\n/g, '\n\n') // Remove empty lines
    .replace(/^\s+|\s+$/gm, ''); // Trim each line
} 