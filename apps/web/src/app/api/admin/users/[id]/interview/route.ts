import { streamText, type CoreMessage } from 'ai';
import { google } from '@ai-sdk/google';
import {
  AdminInterviewBodySchema,
  AdminInterviewSessionPatchSchema,
  AdminUserIdSchema,
} from '@/app/api/admin/contracts';
import { jsonFailure, jsonSuccess, zodErrorDetails } from '@/lib/server/api';
import { requireAdminRequestContext } from '@/lib/server/admin';
import { getServerConfig } from '@/lib/server/env';
import { createRouteLogger } from '@/lib/server/logger';
import { createServiceClient } from '@/lib/supabase/server';
import {
  BIOGRAPHY_INTERVIEW_START_TOKEN,
  shouldPersistInterviewMemory,
} from '@/lib/biography/interview';
import { buildBiographyInterviewPrompt } from '@/lib/prompts/biography-interview';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function sanitizeContent(raw: string): string {
  if (!raw) return '';

  let text = raw.trim();
  text = text.replace(/^(?:prompt_generation_successful|system_ready|runtime_state)\s*:?\s*/i, '');

  const fence = text.match(/```(?:text|markdown|md)?\n([\s\S]*?)\n```/i);
  if (fence?.[1]) {
    text = fence[1].trim();
  }

  return text.replace(/```/g, '').trim();
}

function getLastTurn(messages: CoreMessage[]) {
  let answerText: string | null = null;
  let questionText: string | null = null;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (!message || message.role !== 'user') {
      continue;
    }

    answerText = typeof message.content === 'string' ? sanitizeContent(message.content) : '';

    for (let previousIndex = index - 1; previousIndex >= 0; previousIndex -= 1) {
      const previousMessage = messages[previousIndex];
      if (!previousMessage || previousMessage.role !== 'assistant') {
        continue;
      }

      questionText =
        typeof previousMessage.content === 'string'
          ? sanitizeContent(previousMessage.content)
          : null;
      break;
    }

    break;
  }

  return { answerText, questionText };
}

async function ensureInterviewSession(serviceClient: Awaited<ReturnType<typeof createServiceClient>>, userId: string) {
  const { data: existing } = await serviceClient
    .from('interview_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('processing_status', 'processing')
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    return existing.id;
  }

  const { data: created } = await serviceClient
    .from('interview_sessions')
    .insert({
      user_id: userId,
      topics_covered: [],
      memory_count: 0,
      processing_status: 'processing',
    })
    .select('id')
    .single();

  return created?.id ?? null;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const logger = createRouteLogger('api.admin.users.interview.post', request);
  const { auth, isAdmin } = await requireAdminRequestContext(request);

  if (!auth) {
    return jsonFailure(request, {
      status: 401,
      code: 'AUTH_REQUIRED',
      message: 'Authentifizierung erforderlich',
      correlationId: logger.correlationId,
    });
  }

  if (!isAdmin) {
    return jsonFailure(request, {
      status: 403,
      code: 'ADMIN_FORBIDDEN',
      message: 'Admin-Zugriff erforderlich',
      correlationId: logger.correlationId,
    });
  }

  const params = await context.params;
  const parsedParams = AdminUserIdSchema.safeParse(params);
  if (!parsedParams.success) {
    return jsonFailure(request, {
      status: 400,
      code: 'INVALID_USER_ID',
      message: 'Ungültiges Ziel für das Admin-Interview',
      details: zodErrorDetails(parsedParams.error),
      correlationId: logger.correlationId,
    });
  }

  const body = await request.json().catch(() => null);
  const parsedBody = AdminInterviewBodySchema.safeParse(body);
  if (!parsedBody.success) {
    return jsonFailure(request, {
      status: 400,
      code: 'INVALID_BODY',
      message: 'Invalid admin interview payload',
      details: zodErrorDetails(parsedBody.error),
      correlationId: logger.correlationId,
    });
  }

  const serviceClient = await createServiceClient();
  const targetUserId = parsedParams.data.id;

  const [
    { data: userProfile, error: userProfileError },
    { data: recentMemories, error: recentMemoriesError },
    { data: interviewSessions, error: interviewSessionsError },
  ] =
    await Promise.all([
      serviceClient
        .from('users')
        .select('full_name, alt_onboarding_private')
        .eq('id', targetUserId)
        .maybeSingle(),
      serviceClient
        .from('memories')
        .select('raw_transcript, cleaned_content, interview_topic, interview_question, captured_at')
        .eq('user_id', targetUserId)
        .eq('capture_mode', 'interview')
        .order('captured_at', { ascending: false })
        .limit(8),
      serviceClient
        .from('interview_sessions')
        .select('topics_covered')
        .eq('user_id', targetUserId)
        .order('started_at', { ascending: false })
        .limit(6),
    ]);

  if (userProfileError || recentMemoriesError || interviewSessionsError) {
    logger.error('Failed to load admin interview context', {
      userProfileError: userProfileError?.message,
      recentMemoriesError: recentMemoriesError?.message,
      interviewSessionsError: interviewSessionsError?.message,
    });

    return jsonFailure(request, {
      status: 500,
      code: 'ADMIN_INTERVIEW_CONTEXT_FAILED',
      message: 'Interviewkontext konnte nicht geladen werden',
      correlationId: logger.correlationId,
    });
  }

  if (!userProfile) {
    return jsonFailure(request, {
      status: 404,
      code: 'USER_NOT_FOUND',
      message: 'Zielbenutzer nicht gefunden',
      correlationId: logger.correlationId,
    });
  }

  const previousTopics = Array.from(
    new Set(
      [
        ...(recentMemories || []).map((memory) => memory.interview_topic).filter(Boolean),
        ...(interviewSessions || []).flatMap((session) => session.topics_covered || []),
      ]
        .map((topic) => String(topic))
        .filter(Boolean),
    ),
  );

  const prompt = buildBiographyInterviewPrompt({
    fullName: userProfile.full_name || null,
    altOnboardingPrivate: userProfile.alt_onboarding_private ?? null,
    recentMemories: recentMemories || [],
    previousTopics,
  });

  const apiKey = getServerConfig().geminiApiKey;
  if (!apiKey) {
    return jsonFailure(request, {
      status: 500,
      code: 'AI_PROVIDER_NOT_CONFIGURED',
      message: 'KI-Anbieter ist nicht konfiguriert',
      correlationId: logger.correlationId,
    });
  }

  process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;

  const messages = parsedBody.data.messages.map((message) => ({
    role: message.role,
    content:
      sanitizeContent(message.content) === BIOGRAPHY_INTERVIEW_START_TOKEN
        ? 'Bitte eröffne das Biografiegespräch jetzt mit der ersten passenden Frage.'
        : sanitizeContent(message.content),
  })) as CoreMessage[];

  const interviewSessionId = await ensureInterviewSession(serviceClient, targetUserId);

  const result = await streamText({
    model: google('gemini-2.0-flash'),
    system: prompt.systemPrompt,
    messages,
    maxTokens: 900,
    temperature: 0.7,
    onFinish: async () => {
      const { answerText, questionText } = getLastTurn(messages);
      if (!answerText || !shouldPersistInterviewMemory(answerText)) {
        return;
      }

      const { error: memoryError } = await serviceClient.from('memories').insert({
        user_id: targetUserId,
        raw_transcript: answerText,
        cleaned_content: answerText,
        captured_at: new Date().toISOString(),
        capture_mode: 'interview',
        interview_session_id: interviewSessionId,
        interview_question: questionText,
        interview_topic: prompt.recommendedTopicId,
        people: [],
        places: [],
        topics: [prompt.recommendedTopicId],
        emotions: null,
        suggested_category: null,
        suggested_chapter_id: null,
        suggestion_confidence: 0,
        source: 'text',
        processing_status: 'complete',
        processed_at: new Date().toISOString(),
        chapter_id: null,
      });

      if (memoryError || !interviewSessionId) {
        return;
      }

      const { data: interviewSession } = await serviceClient
        .from('interview_sessions')
        .select('id, memory_count, topics_covered')
        .eq('id', interviewSessionId)
        .maybeSingle();

      if (!interviewSession) {
        return;
      }

      const nextTopics = Array.from(
        new Set([...(interviewSession.topics_covered || []), prompt.recommendedTopicId]),
      );

      await serviceClient
        .from('interview_sessions')
        .update({
          memory_count: (interviewSession.memory_count || 0) + 1,
          topics_covered: nextTopics,
          processing_status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', interviewSessionId)
        .eq('user_id', targetUserId);
    },
  });

  return result.toDataStreamResponse({
    headers: {
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'x-correlation-id': logger.correlationId,
      'x-interview-session-id': interviewSessionId ?? '',
    },
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const logger = createRouteLogger('api.admin.users.interview.patch', request);
  const { auth, isAdmin } = await requireAdminRequestContext(request);

  if (!auth) {
    return jsonFailure(request, {
      status: 401,
      code: 'AUTH_REQUIRED',
      message: 'Authentifizierung erforderlich',
      correlationId: logger.correlationId,
    });
  }

  if (!isAdmin) {
    return jsonFailure(request, {
      status: 403,
      code: 'ADMIN_FORBIDDEN',
      message: 'Admin-Zugriff erforderlich',
      correlationId: logger.correlationId,
    });
  }

  const params = await context.params;
  const parsedParams = AdminUserIdSchema.safeParse(params);
  if (!parsedParams.success) {
    return jsonFailure(request, {
      status: 400,
      code: 'INVALID_USER_ID',
      message: 'Ungültiges Ziel für das Admin-Interview',
      details: zodErrorDetails(parsedParams.error),
      correlationId: logger.correlationId,
    });
  }

  const body = await request.json().catch(() => null);
  const parsedBody = AdminInterviewSessionPatchSchema.safeParse(body);
  if (!parsedBody.success) {
    return jsonFailure(request, {
      status: 400,
      code: 'INVALID_BODY',
      message: 'Ungültige Admin-Interviewdaten',
      details: zodErrorDetails(parsedBody.error),
      correlationId: logger.correlationId,
    });
  }

  const serviceClient = await createServiceClient();
  const userId = parsedParams.data.id;
  const { interviewSessionId, endedAt, processingStatus, summary } = parsedBody.data;

  const { data: session, error } = await serviceClient
    .from('interview_sessions')
    .update({
      ended_at: endedAt ?? new Date().toISOString(),
      processing_status: processingStatus,
      summary: summary ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', interviewSessionId)
    .eq('user_id', userId)
    .select('id, user_id, ended_at, processing_status, summary')
    .maybeSingle();

  if (error) {
    logger.error('Failed to finalize admin interview session', {
      code: error.code,
      message: error.message,
    });

    return jsonFailure(request, {
      status: 500,
      code: 'ADMIN_INTERVIEW_UPDATE_FAILED',
      message: 'Interviewsitzung konnte nicht aktualisiert werden',
      correlationId: logger.correlationId,
    });
  }

  if (!session) {
    return jsonFailure(request, {
      status: 404,
      code: 'INTERVIEW_SESSION_NOT_FOUND',
      message: 'Für den Zielbenutzer wurde keine Interviewsitzung gefunden',
      correlationId: logger.correlationId,
    });
  }

  return jsonSuccess({ session }, request, {
    correlationId: logger.correlationId,
  });
}
