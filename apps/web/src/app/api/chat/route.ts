import { streamText, type CoreMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';
import { buildOnboardingSystemPrompt } from '@/lib/prompts/onboarding';
import { createServiceClient } from '@/lib/supabase/server';
import {
  authenticationRequiredResponse,
  getAuthenticatedRequestContext,
} from '@/lib/server/auth';

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
  try {
    const auth = await getAuthenticatedRequestContext(req);
    if (!auth) {
      return authenticationRequiredResponse();
    }

    const { messages, sessionId } = await req.json();

    // Validate messages array
    if (!messages || !Array.isArray(messages)) {
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
      try {
        const serviceClient = await createServiceClient();
        const { data: session } = await serviceClient
          .from('chat_sessions')
          .select('id, user_id')
          .eq('id', sessionId)
          .maybeSingle();

        if (!session || session.user_id !== auth.user.id) {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const { data: dbMessages, error: dbError } = await serviceClient
          .from('chat_messages')
          .select('role, content')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });
        
        if (!dbError && dbMessages && dbMessages.length > cleanMessages.length) {
          cleanMessages = dbMessages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: sanitizeContent(m.content)
          }));
        }
      } catch (dbErr) {
        return NextResponse.json({ error: 'Failed to load session messages' }, { status: 500 });
      }
    }

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
          user_id: auth.user.id,
          session_id: sessionId || null,
          message_id: null,
          question_topic: inferQuestionTopic(questionText),
          field_key: null,
          question_text: questionText || 'Unbekannte Frage',
          answer_text: answerText,
          answer_json: null,
          model_name: 'gemini-2.0-flash',
          persona_form_of_address: null,
          persona_language_style: null,
        } as any;

        // Always use service client for persistence (bypasses RLS safely since we've verified user)
        try {
          const serviceClient = await createServiceClient();
          await serviceClient.from('onboarding_answers').insert(insertPayload);
        } catch {
          // Non-fatal persistence failure
        }
      }
    } catch {
      // Non-fatal persistence failure
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

    // Stream response with onboarding-specific prompt
    const result = await streamText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      messages: cleanMessages,
      maxTokens: 1000, // Limit response length for senior-friendly conversations
      temperature: 0.7, // Balanced creativity for warm but consistent responses
      onError: () => undefined,
    });

    // Return the AI SDK compatible stream
    return result.toDataStreamResponse({
      headers: {
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
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
