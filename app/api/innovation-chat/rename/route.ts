import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite-preview-06-17" });

    const prompt = `Based on the following first message from a user, create a short, concise, and relevant title for the chat session. The title should be no more than 5 words. Do not use quotation marks in the title.\n\nUser message: "${message}"\n\nTitle:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const title = response.text().trim().replace(/"/g, ''); // Trim and remove quotes

    return NextResponse.json({ title });
  } catch (error) {
    // Log the detailed error message
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error generating chat title:", errorMessage);

    return NextResponse.json(
      { 
        error: "Failed to generate chat title",
        details: errorMessage // Also send details in the response for debugging
      },
      { status: 500 }
    );
  }
} 