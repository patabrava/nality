import { streamText, type CoreMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';
import { buildChapterSystemPrompt } from '@/lib/prompts/chapters';
import { isValidChapterId } from '@/lib/chapters';
import type { ChapterId } from '@nality/schema';
import {
  authenticationRequiredResponse,
  getAuthenticatedRequestContext,
} from '@/lib/server/auth';

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
  try {
    const auth = await getAuthenticatedRequestContext(req);
    if (!auth) {
      return authenticationRequiredResponse();
    }

    const { messages, chapterId } = await req.json();
    
    // Validate chapter ID
    if (!chapterId || !isValidChapterId(chapterId)) {
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

    // Clean messages
    const cleanMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: sanitizeContent(m.content || '')
    })) as CoreMessage[];

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
      model: google('gemini-2.0-flash'),
      system: buildChapterSystemPrompt(chapterId as ChapterId),
      messages: cleanMessages,
      maxTokens: 1000,
      temperature: 0.7,
      onFinish: async ({ text }) => {
        // Check if AI included a [SAVE_MEMORY] block and extract it
        if (text.includes('[SAVE_MEMORY]')) {
          try {
            const extractUrl = new URL('/api/events/extract', req.url);
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (auth.accessToken) {
              headers.Authorization = `Bearer ${auth.accessToken}`;
            }
            
            const extractResponse = await fetch(extractUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                content: text,
                source: 'chapter_chat',
                chapterId,
              }),
            });
            
            if (extractResponse.ok) {
              await extractResponse.json().catch(() => null);
            }
          } catch {
            // Best-effort extraction only.
          }
        }
      },
      onError: () => undefined,
    });

    return result.toDataStreamResponse({
      headers: {
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
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
