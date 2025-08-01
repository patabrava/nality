import { streamText, type CoreMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { ONBOARDING_SYSTEM_PROMPT } from '@/lib/prompts/onboarding';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  console.log("🚀 Chat API endpoint hit");
  
  try {
    const { messages } = await req.json();
    console.log("📨 Received messages:", JSON.stringify(messages, null, 2));

    // Validate messages array
    if (!messages || !Array.isArray(messages)) {
      console.error("❌ Invalid messages format");
      return Response.json(
        { error: "Invalid messages format. Expected array of messages." },
        { status: 400 }
      );
    }

    // Clean message format - remove parts property and ensure proper structure
    const cleanMessages = messages.map((message: { role: string; content: string }) => ({
      role: message.role,
      content: message.content
    })) as CoreMessage[];
    
    console.log("🔧 Cleaned messages for AI SDK:", JSON.stringify(cleanMessages, null, 2));

    // Check API key - try multiple possible variable names
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY;
    if (!apiKey) {
      console.error("❌ Google AI API key not found in environment variables");
      console.error("Looking for: GOOGLE_GENERATIVE_AI_API_KEY, GEMINI_API_KEY, or Gemini_API_KEY");
      return Response.json(
        { error: "API key not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY in your environment." },
        { status: 500 }
      );
    }

    console.log("✅ API key found, making request to Gemini...");

    // Set the API key for Google AI SDK
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;

    // Use AI SDK's streamText with cleaned messages and onboarding system prompt
    const result = await streamText({
      model: google('gemini-2.0-flash-exp'),
      system: ONBOARDING_SYSTEM_PROMPT,
      messages: cleanMessages,
      maxTokens: 1000, // Limit response length for senior-friendly conversations
      temperature: 0.7, // Balanced creativity for warm but consistent responses
      onChunk: ({ chunk }) => {
        console.log("📦 Streaming chunk:", chunk);
      },
      onFinish: ({ text, usage }) => {
        console.log("✅ Stream complete, final text length:", text.length);
        console.log("📊 Token usage:", usage);
      },
      onError: (error) => {
        console.error("❌ StreamText error:", error);
      }
    });

    console.log("✅ StreamText result created, returning response");
    
    // Return the AI SDK compatible stream
    return result.toDataStreamResponse({
      headers: {
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error("❌ Chat API error:", error);
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Return user-friendly error message
    return Response.json(
      { 
        error: "I'm having trouble connecting right now. Please try again in a moment.",
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : "Unknown error")
          : undefined
      },
      { status: 500 }
    );
  }
} 