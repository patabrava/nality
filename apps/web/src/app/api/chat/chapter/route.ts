import { streamText, type CoreMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';
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
      return NextResponse.json(
        { error: "Invalid or missing chapterId" },
        { status: 400 }
      );
    }

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
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
      return NextResponse.json(
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
    // Prefer the freshly provided Gemini key first, then fall back
    const apiKey = process.env.Gemini_API_KEY ||
                   process.env.GEMINI_API_KEY ||
                   process.env.GOOGLE_GENERATIVE_AI_API_KEY;
                   
    if (!apiKey) {
      console.error("❌ API key not configured");
      return NextResponse.json(
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
      onFinish: async ({ text, usage }) => {
        console.log(`✅ Chapter chat complete, text length: ${text.length}`);
        console.log("📊 Token usage:", usage);
        
        // Check if AI included a [SAVE_MEMORY] block and extract it
        if (text.includes('[SAVE_MEMORY]')) {
          try {
            console.log('📦 Detected [SAVE_MEMORY] block, calling extraction API...');
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
            
            const extractResponse = await fetch(`${baseUrl}/api/events/extract`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                content: text,
                source: 'chapter_chat',
                chapterId,
                userId: effectiveUserId,
                accessToken,
              }),
            });
            
            if (extractResponse.ok) {
              const extractResult = await extractResponse.json();
              console.log(`📦 Extraction result: ${extractResult.events?.length || 0} events saved`);
            } else {
              console.error('❌ Extraction API error:', await extractResponse.text());
            }
          } catch (err) {
            console.error('❌ Failed to extract memory:', err);
          }
        }
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
    
    return NextResponse.json(
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
