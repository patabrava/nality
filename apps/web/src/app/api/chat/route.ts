import { streamText, type CoreMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';
import { buildOnboardingSystemPrompt } from '@/lib/prompts/onboarding';
import { createClient, createServiceClient } from '@/lib/supabase/server';
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
    const { messages, userId: bodyUserId, accessToken, sessionId } = await req.json();
    console.log(" Received messages:", JSON.stringify(messages, null, 2));
    if (bodyUserId) {
      console.log(` ℹ️ Received userId from client body: ${bodyUserId}`);
    } else {
      console.log(' ℹ️ No userId provided in client body. Will attempt server auth.');
    }
    if (accessToken) {
      console.log(' 🔑 Received accessToken in request body (length):', String(accessToken).length);
    }
    if (sessionId) {
      console.log(' 📂 Received sessionId:', sessionId);
    }

    // Validate messages array
    if (!messages || !Array.isArray(messages)) {
      console.error(" Invalid messages format");
      return NextResponse.json(
        { error: "Invalid messages format. Expected array of messages." },
        { status: 400 }
      );
    }

    // Clean message format - remove parts property and ensure proper structure
    let cleanMessages = messages.map((message: { role: string; content: string }) => ({
      role: message.role,
      content: sanitizeContent(message.content)
    })) as CoreMessage[];
    
    // If sessionId is provided and client only sent 1-2 messages, load full history from DB
    // This handles the case where useChat's internal state doesn't have the full history
    if (sessionId && cleanMessages.length <= 2) {
      console.log('📂 Client sent few messages, loading full history from session:', sessionId);
      try {
        const serviceClient = await createServiceClient();
        const { data: dbMessages, error: dbError } = await serviceClient
          .from('chat_messages')
          .select('role, content')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });
        
        if (!dbError && dbMessages && dbMessages.length > cleanMessages.length) {
          console.log(`📂 Loaded ${dbMessages.length} messages from DB (client had ${cleanMessages.length})`);
          cleanMessages = dbMessages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: sanitizeContent(m.content)
          }));
        }
      } catch (dbErr) {
        console.warn('⚠️ Could not load messages from DB, using client messages:', dbErr);
      }
    }
    
    console.log(" Cleaned + sanitized messages for AI SDK:", JSON.stringify(cleanMessages, null, 2));

    let systemPrompt = buildOnboardingSystemPrompt();
    const extraSystemGuidance: string[] = [];

    /**
     * Guardrail: prevent Q1 loops.
     * If the assistant has already asked the form-of-address question multiple times,
     * inject a system reminder to move on to Q2.
     */
    const q1Regex = /wie soll ich dich ansprechen|wie m[oö]chten sie angesprochen werden/i;
    const assistantQ1Count = cleanMessages.filter(m => m.role === 'assistant' && typeof m.content === 'string' && q1Regex.test(m.content)).length;
    const lastUserMessage = [...cleanMessages].reverse().find(m => m.role === 'user');

    if (assistantQ1Count >= 2) {
      const userAnswer = lastUserMessage?.content ? sanitizeContent(String(lastUserMessage.content)) : 'Keine Antwort erkannt';
      extraSystemGuidance.push(
        `Q1 (form of address/name/style) has already been asked. User's latest reply: "${userAnswer}". Do NOT repeat Q1. Continue with the next onboarding question (Q2: origins). If style is missing, default to "locker".`
      );
    }

    // Move any system-role messages into the system prompt to satisfy provider constraints
    const systemMessages = cleanMessages.filter(
      (m) => m.role === 'system' && typeof m.content === 'string' && m.content.trim().length > 0
    );
    if (systemMessages.length > 0) {
      extraSystemGuidance.push(
        ...systemMessages.map((m) => sanitizeContent(String(m.content)))
      );
    }
    cleanMessages = cleanMessages.filter((m) => m.role !== 'system');

    if (extraSystemGuidance.length > 0) {
      systemPrompt = `${systemPrompt}\n\nAdditional guidance:\n- ${extraSystemGuidance.join('\n- ')}`;
    }

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
          // Map question content to valid onboarding_topic enum values
          // Valid values: 'identity', 'origins', 'family', 'education', 'career', 'influences', 'values'
          const inferQuestionTopic = (questionText: string | null): string => {
            if (!questionText) return 'identity';
            const q = questionText.toLowerCase();
            
            // Q7 Values - MUST check before other topics (contains 'werte', 'motto')
            if (q.includes('werte') || q.includes('values')) return 'values';
            if (q.includes('motto') && q.includes('abschluss')) return 'values';
            if (q.includes('drei werte') || q.includes('three values')) return 'values';
            
            // Q2 Origins - birth date/place (check before identity default)
            if (q.includes('geburt') || q.includes('geboren')) return 'origins';
            if (q.includes('anfang') && (q.includes('wann') || q.includes('wo'))) return 'origins';
            if (q.includes('birth') && (q.includes('year') || q.includes('place'))) return 'origins';
            
            // Q3 Family-related topics
            if (q.includes('geschwister') || q.includes('bruder') || q.includes('schwester')) return 'family';
            if (q.includes('kinder') || q.includes('children')) return 'family';
            if (q.includes('eltern') || q.includes('mutter') || q.includes('vater') || q.includes('parents')) return 'family';
            if (q.includes('partner') || q.includes('verheiratet') || q.includes('ehe') || q.includes('marriage')) return 'family';
            if (q.includes('familie') && !q.includes('ursprünglichen')) return 'family';
            if (q.includes('ursprünglichen familie')) return 'family';
            
            // Q4 Education-related topics
            if (q.includes('schule') || q.includes('grundschule') || q.includes('gymnasium')) return 'education';
            if (q.includes('studium') || q.includes('universität') || q.includes('university')) return 'education';
            if (q.includes('abschluss') || q.includes('abitur')) return 'education';
            if (q.includes('bildung') && q.includes('weg')) return 'education';
            
            // Q5 Career-related topics
            if (q.includes('beruf') || q.includes('arbeit') || q.includes('job') || q.includes('career')) return 'career';
            if (q.includes('rolle') || q.includes('position') || q.includes('firma') || q.includes('unternehmen')) return 'career';
            
            // Q6 Influences-related topics (authors, thinkers, NOT values)
            if (q.includes('autor') || q.includes('buch') || q.includes('einfluss')) return 'influences';
            if (q.includes('stimmen') && q.includes('weiter')) return 'influences';
            if (q.includes('denker') || q.includes('geprägt')) return 'influences';
            if (q.includes('bewunder') || q.includes('admire') || q.includes('vorbild')) return 'influences';
            
            // Q1 Identity is the default for: name, address preference, style
            return 'identity';
          };

          const insertPayload = {
            user_id: effectiveUserId,
            session_id: sessionId || null,
            message_id: null,
            question_topic: inferQuestionTopic(questionText),
            field_key: null,
            question_text: questionText || 'Unbekannte Frage',
            answer_text: answerText,
            answer_json: null,
            model_name: 'gemini-2.0-flash-exp',
            persona_form_of_address: null,
            persona_language_style: null,
          } as any;

          // Add some observability without leaking PII
          console.log(
            ` 🧾 Preparing insert -> user_id: ${effectiveUserId}, question_present: ${!!questionText}, answer_len: ${answerText.length}`
          );

          // Always use service client for persistence (bypasses RLS safely since we've verified user)
          try {
            const serviceClient = await createServiceClient();
            const { error: insertError } = await serviceClient.from('onboarding_answers').insert(insertPayload);
            
            if (insertError) {
              console.error('❌ Failed to persist onboarding answer:', insertError);
            } else {
              console.log('✅ Onboarding answer persisted via service client');
            }
          } catch (serviceError) {
            console.error('❌ Service client error during persistence:', serviceError);
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

    // Pick API key (prefer freshly provided Gemini key)
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

    console.log(" API key found, making request to Gemini...");

    // Stream response with onboarding-specific prompt
    const result = await streamText({
      model: google('gemini-2.0-flash-exp'),
      system: systemPrompt,
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
    return NextResponse.json(
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