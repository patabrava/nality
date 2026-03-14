import { streamText, type CoreMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import {
  authenticationRequiredResponse,
  getAuthenticatedRequestContext,
} from '@/lib/server/auth';
import { jsonFailure, zodErrorDetails } from '@/lib/server/api';
import {
  BIOGRAPHY_INTERVIEW_START_TOKEN,
  shouldPersistInterviewMemory,
} from '@/lib/biography/interview';
import { buildBiographyInterviewPrompt } from '@/lib/prompts/biography-interview';
import { getServerConfig } from '@/lib/server/env';
import { createRouteLogger } from '@/lib/server/logger';
import { BIOGRAPHY_INTERVIEW_CATALOG_VERSION, getCatalogQuestion } from '@/features/biography-interview/catalog';
import { evaluateInterviewAnswer } from '@/features/biography-interview/evaluator';
import {
  buildTopicCoverage,
  chooseNextQuestion,
  getAutoSkippedQuestionIds,
  summarizeProgress,
} from '@/features/biography-interview/planner';
import {
  bulkSkipQuestions,
  loadInterviewQuestionProgress,
  markQuestionAsked,
  seedInterviewQuestionProgress,
  updateQuestionOutcome,
} from '@/features/biography-interview/progress-store';
import { buildInterviewerBridgeContext } from '@/features/biography-interview/reviewer';
import type { InterviewQuestionProgress } from '@/features/biography-interview/contracts';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BiographyInterviewBodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'assistant', 'user']),
      content: z.string(),
    }),
  ),
  interviewSessionId: z.string().uuid(),
  source: z.enum(['voice', 'text']).optional(),
});

type SessionRow = {
  id: string;
  user_id: string;
  memory_count: number | null;
  topics_covered: string[] | null;
  active_question_id: string | null;
  catalog_version: string | null;
};

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

function isBootstrapTurn(messages: Array<{ role: string; content: string }>) {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  return sanitizeContent(lastUserMessage?.content ?? '') === BIOGRAPHY_INTERVIEW_START_TOKEN;
}

function applyProgressMutation(
  progressRows: InterviewQuestionProgress[],
  questionId: string,
  updates: Partial<InterviewQuestionProgress>,
) {
  const progress = progressRows.find((row) => row.question_id === questionId);
  if (!progress) {
    return;
  }

  Object.assign(progress, updates);
}

function buildSessionSummaryText(progressRows: InterviewQuestionProgress[]) {
  const summary = summarizeProgress(progressRows, null);
  return `Beantwortet: ${summary.counts.answered}, offen: ${summary.counts.pending}, vertagt: ${summary.counts.deferred}, übersprungen: ${summary.counts.skipped}.`;
}

async function loadInterviewContext(serviceClient: Awaited<ReturnType<typeof createServiceClient>>, userId: string, interviewSessionId: string) {
  const [
    { data: userProfile, error: userProfileError },
    { data: recentMemories, error: recentMemoriesError },
    { data: session, error: sessionError },
  ] = await Promise.all([
    serviceClient
      .from('users')
      .select('full_name, alt_onboarding_private')
      .eq('id', userId)
      .maybeSingle(),
    serviceClient
      .from('memories')
      .select('id, raw_transcript, cleaned_content, interview_topic, interview_question, captured_at')
      .eq('user_id', userId)
      .eq('capture_mode', 'interview')
      .order('captured_at', { ascending: false })
      .limit(8),
    serviceClient
      .from('interview_sessions')
      .select('id, user_id, memory_count, topics_covered, active_question_id, catalog_version')
      .eq('id', interviewSessionId)
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  return {
    userProfile,
    userProfileError,
    recentMemories,
    recentMemoriesError,
    session: session as SessionRow | null,
    sessionError,
  };
}

export async function POST(request: Request) {
  const logger = createRouteLogger('api.chat.biography.post', request);
  try {
    const auth = await getAuthenticatedRequestContext(request);

    if (!auth) {
      return authenticationRequiredResponse(request);
    }

    const body = await request.json().catch(() => null);
    const parsedBody = BiographyInterviewBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonFailure(request, {
        status: 400,
        code: 'INVALID_BODY',
        message: 'Invalid biography interview payload',
        details: zodErrorDetails(parsedBody.error),
        correlationId: logger.correlationId,
      });
    }

    const { interviewSessionId } = parsedBody.data;
    const source = parsedBody.data.source ?? 'text';
    const messages = parsedBody.data.messages.map((message) => ({
      role: message.role,
      content:
        sanitizeContent(message.content) === BIOGRAPHY_INTERVIEW_START_TOKEN
          ? 'Bitte eröffne das Biografiegespräch jetzt mit der ersten passenden Frage.'
          : sanitizeContent(message.content),
    })) as CoreMessage[];

    const serviceClient = await createServiceClient();
    const interviewContext = await loadInterviewContext(serviceClient, auth.user.id, interviewSessionId);

    if (interviewContext.userProfileError || interviewContext.recentMemoriesError || interviewContext.sessionError) {
      logger.error('Failed to load biography interview context', {
        userProfileError: interviewContext.userProfileError?.message,
        recentMemoriesError: interviewContext.recentMemoriesError?.message,
        sessionError: interviewContext.sessionError?.message,
      });
      return jsonFailure(request, {
        status: 500,
        code: 'BIOGRAPHY_INTERVIEW_CONTEXT_FAILED',
        message: 'Failed to load biography interview context',
        correlationId: logger.correlationId,
      });
    }

    if (!interviewContext.session) {
      return jsonFailure(request, {
        status: 404,
        code: 'INTERVIEW_SESSION_NOT_FOUND',
        message: 'Interview session not found',
        correlationId: logger.correlationId,
      });
    }

    let progressRows = await loadInterviewQuestionProgress(serviceClient, {
      interviewSessionId,
      userId: auth.user.id,
    });

    if (progressRows.length === 0) {
      await seedInterviewQuestionProgress(serviceClient, {
        interviewSessionId,
        userId: auth.user.id,
      });
      progressRows = await loadInterviewQuestionProgress(serviceClient, {
        interviewSessionId,
        userId: auth.user.id,
      });
    }

    const previousActiveQuestionId = interviewContext.session.active_question_id;
    const previousActiveQuestion = previousActiveQuestionId ? getCatalogQuestion(previousActiveQuestionId) : null;
    const { answerText, questionText } = getLastTurn(messages);
    let memoryCount = interviewContext.session.memory_count || 0;

    if (!isBootstrapTurn(parsedBody.data.messages) && previousActiveQuestion && answerText) {
      const evaluation = evaluateInterviewAnswer(answerText, previousActiveQuestion);
      let answerMemoryId: string | null = null;

      if (evaluation.shouldPersistMemory && shouldPersistInterviewMemory(answerText)) {
        const memoryPayload = {
          user_id: auth.user.id,
          raw_transcript: answerText,
          cleaned_content: answerText,
          captured_at: new Date().toISOString(),
          capture_mode: 'interview',
          interview_session_id: interviewSessionId,
          interview_question: questionText || previousActiveQuestion.promptIntent,
          interview_topic: previousActiveQuestion.topicId,
          people: [],
          places: [],
          topics: [previousActiveQuestion.topicId],
          emotions: null,
          suggested_category: null,
          suggested_chapter_id: null,
          suggestion_confidence: 0,
          source,
          processing_status: 'complete',
          processed_at: new Date().toISOString(),
          chapter_id: null,
        };

        const { data: insertedMemory, error: memoryError } = await serviceClient
          .from('memories')
          .insert(memoryPayload)
          .select('id')
          .single();

        if (memoryError) {
          logger.error('Failed to persist biography interview memory', {
            code: memoryError.code,
            message: memoryError.message,
          });
          return jsonFailure(request, {
            status: 500,
            code: 'BIOGRAPHY_MEMORY_PERSIST_FAILED',
            message: 'Failed to persist biography memory',
            correlationId: logger.correlationId,
          });
        }

        answerMemoryId = insertedMemory?.id ?? null;
        memoryCount += 1;
      }

      const progressOutcome = evaluation.outcome === 'pending_followup' ? 'pending' : evaluation.outcome;
      await updateQuestionOutcome(serviceClient, {
        interviewSessionId,
        userId: auth.user.id,
        questionId: previousActiveQuestion.id,
        outcome: progressOutcome,
        evaluatorSummary: evaluation.summary,
        answerExcerpt: evaluation.answerExcerpt,
        answerMemoryId,
      });

      applyProgressMutation(progressRows, previousActiveQuestion.id, {
        state: progressOutcome,
        evaluator_summary: evaluation.summary,
        answer_excerpt: evaluation.answerExcerpt,
        answer_memory_id: answerMemoryId,
      });
    }

    const autoSkippedQuestionIds = getAutoSkippedQuestionIds(progressRows);
    if (autoSkippedQuestionIds.length > 0) {
      await bulkSkipQuestions(serviceClient, {
        interviewSessionId,
        userId: auth.user.id,
        questionIds: autoSkippedQuestionIds,
        summary: 'Automatisch übersprungen, weil die Abhängigkeitsfrage verneint wurde.',
      });

      for (const questionId of autoSkippedQuestionIds) {
        applyProgressMutation(progressRows, questionId, {
          state: 'skipped',
          evaluator_summary: 'Automatisch übersprungen, weil die Abhängigkeitsfrage verneint wurde.',
        });
      }
    }

    const nextQuestion = chooseNextQuestion(progressRows, previousActiveQuestionId);
    const progressSummary = summarizeProgress(progressRows, nextQuestion?.id ?? null);
    const coveredTopics = buildTopicCoverage(progressRows);
    const prompt = buildBiographyInterviewPrompt({
      fullName: interviewContext.userProfile?.full_name || null,
      altOnboardingPrivate: interviewContext.userProfile?.alt_onboarding_private ?? null,
      recentMemories: (interviewContext.recentMemories || []).map((memory) => ({
        raw_transcript: memory.raw_transcript,
        cleaned_content: memory.cleaned_content,
        interview_topic: memory.interview_topic,
        interview_question: memory.interview_question,
        captured_at: memory.captured_at,
      })),
      previousTopics: coveredTopics,
      activeQuestion: nextQuestion,
      bridgeContext: buildInterviewerBridgeContext({
        activeQuestion: nextQuestion ?? previousActiveQuestion ?? getCatalogQuestion('basis.birth')!,
        recentMemories: interviewContext.recentMemories || [],
      }),
      progressSummary,
    });

    if (nextQuestion) {
      const previousAskedCount =
        progressRows.find((row) => row.question_id === nextQuestion.id)?.asked_count || 0;
      await markQuestionAsked(serviceClient, {
        interviewSessionId,
        userId: auth.user.id,
        questionId: nextQuestion.id,
        promptSnapshot: nextQuestion.promptIntent,
      });
      applyProgressMutation(progressRows, nextQuestion.id, {
        asked_count: previousAskedCount + 1,
        prompt_snapshot: nextQuestion.promptIntent,
      });
    }

    await serviceClient
      .from('interview_sessions')
      .update({
        active_question_id: nextQuestion?.id ?? null,
        catalog_version: BIOGRAPHY_INTERVIEW_CATALOG_VERSION,
        memory_count: memoryCount,
        topics_covered: coveredTopics,
        processing_status: nextQuestion ? 'processing' : 'complete',
        summary: buildSessionSummaryText(progressRows),
        updated_at: new Date().toISOString(),
      })
      .eq('id', interviewSessionId)
      .eq('user_id', auth.user.id);

    const apiKey = getServerConfig().geminiApiKey;
    if (!apiKey) {
      logger.error('AI provider not configured for biography interview');
      return jsonFailure(request, {
        status: 500,
        code: 'AI_PROVIDER_NOT_CONFIGURED',
        message: 'AI provider not configured',
        correlationId: logger.correlationId,
      });
    }

    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;

    const result = await streamText({
      model: google('gemini-2.0-flash'),
      system: prompt.systemPrompt,
      messages,
      maxTokens: 900,
      temperature: 0.7,
    });

    return result.toDataStreamResponse({
      headers: {
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'x-correlation-id': logger.correlationId,
        'x-interview-session-id': interviewSessionId,
        'x-active-question-id': nextQuestion?.id ?? '',
      },
    });
  } catch (error) {
    logger.error('Biography interview failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });

    return jsonFailure(request, {
      status: 500,
      code: 'BIOGRAPHY_INTERVIEW_FAILED',
      message: 'Die Interview-Antwort konnte gerade nicht erzeugt werden.',
      correlationId: logger.correlationId,
    });
  }
}
