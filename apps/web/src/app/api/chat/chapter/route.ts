import { streamText, type CoreMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { buildChapterSystemPrompt } from '@/lib/prompts/chapters';
import { createClient } from '@/lib/supabase/server';
import { isValidChapterId } from '@/lib/chapters';
import type { ChapterId } from '@nality/schema';

export const dynamic = "force-dynamic";

function sanitizeContent(raw: string): string {
  if (!raw) return '';
  let text = raw.trim();
  text = text.replace(/^(?:prompt_generation_successful|system_ready|runtime_state)\s*:?\s*/i, '');
  const fence = text.match(/```(?:text|markdown|md)?\n([\s\S]*?)\n```/i);
  if (fence && fence[1]) {
    text = fence[1].trim();
  }
  text = text.replace(/```/g, '').trim();
  return text;
}

export async function POST(req: Request) {
  console.log("📖 Chapter Chat API endpoint hit");
  
  try {
    const { messages, chapterId, userId: bodyUserId, accessToken } = await req.json();
    
    // Validate chapter ID
    if (!chapterId || !isValidChapterId(chapterId)) {
      console.error("❌ Invalid or missing chapterId:", chapterId);
      return Response.json(
        { error: "Invalid or missing chapterId" },
        { status: 400 }
      );
    }

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const effectiveUserId = user?.id || bodyUserId;

    if (!effectiveUserId) {
      console.error("❌ No user authentication found");
      return Response.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Clean messages
    const cleanMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: sanitizeContent(m.content || '')
    })) as CoreMessage[];

    console.log(`📖 Chapter: ${chapterId}, User: ${effectiveUserId}, Messages: ${cleanMessages.length}`);

    // Check API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || 
                   process.env.GEMINI_API_KEY ||
                   process.env.Gemini_API_KEY;
                   
    if (!apiKey) {
      console.error("❌ API key not configured");
      return Response.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;

    // Stream response with chapter-specific prompt
    const result = await streamText({
      model: google('gemini-2.0-flash-exp'),
      system: buildChapterSystemPrompt(chapterId as ChapterId),
      messages: cleanMessages,
      maxTokens: 1000,
      temperature: 0.7,
      onFinish: ({ text, usage }) => {
        console.log(`✅ Chapter chat complete, text length: ${text.length}`);
        console.log("📊 Token usage:", usage);
      },
      onError: (error) => {
        console.error("❌ StreamText error:", error);
      }
    });

    return result.toDataStreamResponse({
      headers: {
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error("❌ Chapter Chat API error:", error);
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    return Response.json(
      { 
        error: "Something went wrong. Please try again.",
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : "Unknown error")
          : undefined
      },
      { status: 500 }
    );
  }
}
