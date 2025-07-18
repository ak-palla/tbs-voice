import { NextResponse } from "next/server";
import { ApifyClient } from 'apify-client';

// IMPORTANT: Add APIFY_TOKEN to your environment variables
// This should be set in your .env.local file or your deployment environment
// Get your token from https://console.apify.com/account/integrations

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
      const parsedUrl = new URL(url);
      if (!parsedUrl.hostname.includes('loom.com')) {
        return NextResponse.json(
          { error: "URL must be a valid Loom video URL" },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Get Apify token from environment variables
    const APIFY_TOKEN = process.env.APIFY_TOKEN;

    if (!APIFY_TOKEN) {
      console.error("Missing APIFY_TOKEN environment variable");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Initialize the ApifyClient with API token
    const client = new ApifyClient({
      token: APIFY_TOKEN,
    });

    // Prepare Actor input
    const input = {
      loom_url: [
        {
          url: url
        }
      ]
    };

    console.log(`Calling Apify API for Loom video: ${url}`);

    try {
      // Run the Actor and wait for it to finish
      // Use the correct actor ID "R4sWZC0jhh5QrKouT" 
      const run = await client.actor("R4sWZC0jhh5QrKouT").call(input);

      // Fetch results from the run's dataset
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      
      console.log("Apify API response:", JSON.stringify(items, null, 2));
      
      if (!items || items.length === 0) {
        console.error("No data returned from Apify API");
        return NextResponse.json(
          { error: "Failed to extract Loom video data" },
          { status: 500 }
        );
      }

      // Extract relevant information
      const videoData = items[0];
      
      // Log the structure to debug
      console.log("Video data structure:", Object.keys(videoData));
      
      // Extract with safe fallbacks for all properties
      const title = videoData.title || '';
      const description = videoData.description || '';
      const thumbnailUrl = videoData.thumbnailUrl || '';
      const transcript = videoData.transcript || [];
      const duration = videoData.duration || 0;
      const views = videoData.views || 0;
      const createdAt = videoData.createdAt || '';
      const owner = videoData.owner || {};

      // Format the transcript if it exists
      let formattedTranscript = "";
      
      // Log transcript structure for debugging
      console.log("Transcript structure:", typeof transcript, Array.isArray(transcript) ? transcript.length : 'not array');
      
      if (transcript && Array.isArray(transcript) && transcript.length > 0) {
        // Debug first few items
        console.log("First transcript items:", transcript.slice(0, 3));
        
        formattedTranscript = transcript
          .map(item => {
            if (typeof item === 'object' && item !== null) {
              // Debug individual item structure
              console.log("Transcript item structure:", Object.keys(item));
              
              // Use text or words field (depending on API response structure)
              const text = item.text || (item.words ? item.words.join(' ') : '');
              const timestamp = item.timestamp || item.time || 0;
              
              if (text) {
                return `[${formatTimestamp(timestamp)}] ${text}`;
              }
            }
            // If it's a string, just return it
            return typeof item === 'string' ? item : '';
          })
          .filter(Boolean) // Remove empty entries
          .join('\n');
      } else if (typeof transcript === 'string') {
        // Handle if transcript is just a string
        formattedTranscript = transcript;
      }
      
      // If still no formatted transcript but there is a 'words' field
      if (!formattedTranscript && videoData.words && Array.isArray(videoData.words)) {
        formattedTranscript = videoData.words
          .map(word => typeof word === 'object' && word !== null ? word.text || '' : '')
          .filter(Boolean)
          .join(' ');
      }

      // Ensure we return a useful response even with partial data
      return NextResponse.json({
        content: formattedTranscript || "No transcript available",
        title: title || videoData.name || url.split('/').pop() || 'Unknown',
        description: description || '',
        thumbnailUrl: thumbnailUrl || '',
        duration: duration || 0,
        views: views || 0,
        createdAt: createdAt || '',
        owner: typeof owner === 'object' && owner !== null && 'name' in owner ? owner.name : 'Unknown',
        url,
        extractionDate: new Date().toISOString()
      });
    } catch (error) {
      console.error("Apify API error:", error);
      return NextResponse.json(
        { error: "Failed to extract content from Loom video", details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error extracting Loom video:", error);
    return NextResponse.json(
      { error: "Failed to extract content from Loom video", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Helper function to format timestamp from seconds to MM:SS format
function formatTimestamp(seconds: number): string {
  if (!seconds && seconds !== 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
} 