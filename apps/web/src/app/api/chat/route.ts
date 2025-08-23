import { streamText, type CoreMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { buildOnboardingSystemPrompt } from '@/lib/prompts/onboarding';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

export const dynamic = "force-dynamic";

function sanitizeContent(raw: string): string {
  if (!raw) return '';
  let text = raw.trim();
  // Remove known status headers/markers at the start
  text = text.replace(/^(?:prompt_generation_successful|system_ready|runtime_state)\s*:?\s*/i, '');
  // Unwrap a top-level fenced block if present
  const fence = text.match(/```(?:text|markdown|md)?\n([\s\S]*?)\n```/i);
  if (fence && fence[1]) {
    text = fence[1].trim();
  }
  // Remove any lingering triple backticks
  text = text.replace(/```/g, '').trim();
  return text;
}

export async function POST(req: Request) {
  console.log(" Chat API endpoint hit");
  
  try {
    const { messages, userId: bodyUserId } = await req.json();
    console.log(" Received messages:", JSON.stringify(messages, null, 2));
    if (bodyUserId) {
      console.log(` ℹ️ Received userId from client body: ${bodyUserId}`);
    } else {
      console.log(' ℹ️ No userId provided in client body. Will attempt server auth.');
    }

    // Validate messages array
    if (!messages || !Array.isArray(messages)) {
      console.error(" Invalid messages format");
      return Response.json(
        { error: "Invalid messages format. Expected array of messages." },
        { status: 400 }
      );
    }

    // Clean message format - remove parts property and ensure proper structure
    const cleanMessages = messages.map((message: { role: string; content: string }) => ({
      role: message.role,
      content: sanitizeContent(message.content)
    })) as CoreMessage[];
    
    console.log(" Cleaned + sanitized messages for AI SDK:", JSON.stringify(cleanMessages, null, 2));

    // Persist latest user answer with minimal metadata (best-effort, non-blocking for chat)
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      let effectiveUserId: string | null = null;
      if (user?.id) {
        effectiveUserId = user.id;
        console.log(' 👤 Authenticated user resolved from server cookies');
      } else if (typeof bodyUserId === 'string' && bodyUserId.trim().length > 0) {
        effectiveUserId = bodyUserId.trim();
        console.log(' 🟡 No server auth; falling back to client-provided userId for persistence');
      }

      if (effectiveUserId) {
        // Find the last user message and the assistant message immediately before it (as the question)
        let answerText: string | null = null;
        let questionText: string | null = null;

        for (let i = cleanMessages.length - 1; i >= 0; i--) {
          const m = cleanMessages[i] as any;
          if (!m || typeof m !== 'object') continue;
          if (m.role === 'user') {
            const mContent = m?.content;
            answerText = typeof mContent === 'string' ? mContent : '';
            // Find the nearest prior assistant message
            for (let j = i - 1; j >= 0; j--) {
              const prev = cleanMessages[j] as any;
              if (!prev || typeof prev !== 'object') continue;
              if (prev.role === 'assistant') {
                const pContent = prev?.content;
                questionText = typeof pContent === 'string' ? pContent : null;
                break;
              }
            }
            break;
          }
        }

        // Insert only if we have an answer text
        if (answerText && answerText.trim().length > 0) {
          const insertPayload = {
            user_id: effectiveUserId,
            session_id: null, // Not tracked in this flow yet
            message_id: null,
            question_topic: null,
            field_key: null,
            question_text: questionText || null,
            answer_text: answerText,
            answer_json: null,
            model_name: 'gemini-2.0-flash-exp',
            persona_form_of_address: null,
            persona_language_style: null,
          } as any;

          // Prefer admin client to bypass RLS when using client-provided userId or when server auth is unavailable
          const useAdmin = !user?.id || effectiveUserId !== user?.id;
          let insertError: any = null;

          // Add some observability without leaking PII
          console.log(
            ` 🧾 Preparing insert -> user_id: ${effectiveUserId}, question_present: ${!!questionText}, answer_len: ${answerText.length}`
          );

          if (useAdmin) {
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (!serviceKey) {
              console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY; cannot persist without server auth');
            } else {
              const admin = createSupabaseAdmin(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                serviceKey
              );
              const { error } = await admin.from('onboarding_answers').insert(insertPayload);
              insertError = error;
              console.log(' 🔐 Used admin client for persistence');
            }
          } else {
            const { error } = await supabase.from('onboarding_answers').insert(insertPayload);
            insertError = error;
            console.log(' 🔓 Used user-scoped client for persistence');
          }

          if (insertError) {
            console.error('❌ Failed to persist onboarding answer:', insertError);
          } else {
            console.log('✅ Onboarding answer persisted');
          }
        } else {
          console.log('ℹ️ No user answer found to persist in this request');
        }
      } else {
        console.log('ℹ️ No user context available (no server auth and no client userId); skipping onboarding answer persistence');
      }
    } catch (persistError) {
      console.error('❌ Error during onboarding answer persistence (non-fatal):', persistError);
    }

    // Check API key - try multiple possible variable names
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY;
    if (!apiKey) {
      console.error(" Google AI API key not found in environment variables");
      console.error("Looking for: GOOGLE_GENERATIVE_AI_API_KEY, GEMINI_API_KEY, or Gemini_API_KEY");
      return Response.json(
        { error: "API key not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY in your environment." },
        { status: 500 }
      );
    }

    console.log(" API key found, making request to Gemini...");

    // Set the API key for Google AI SDK
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;

    // Use AI SDK's streamText with cleaned messages and runtime-built XML system prompt
    const result = await streamText({
      model: google('gemini-2.0-flash-exp'),
      system: buildOnboardingSystemPrompt(cleanMessages),
      messages: cleanMessages,
      maxTokens: 1000, // Limit response length for senior-friendly conversations
      temperature: 0.7, // Balanced creativity for warm but consistent responses
      onChunk: ({ chunk }) => {
        console.log(" Streaming chunk:", chunk);
      },
      onFinish: ({ text, usage }) => {
        console.log(" Stream complete, final text length:", text.length);
        console.log(" Token usage:", usage);
      },
      onError: (error) => {
        console.error(" StreamText error:", error);
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