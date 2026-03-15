import { generateText, streamText, type CoreMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { createServiceClient } from '@/lib/supabase/server';
import { createRouteLogger } from '@/lib/server/logger';
import { getServerConfig } from '@/lib/server/env';
import {
  BIOGRAPHY_INTERVIEW_START_TOKEN,
  buildBiographyVoiceAgentContextMessages,
  shapeGermanVoiceAgentText,
  shouldPersistInterviewMemory,
} from '@/lib/biography/interview';
import { buildBiographyInterviewPrompt } from '@/lib/prompts/biography-interview';
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
import { syncBiographyInterviewProfileData } from '@/features/biography-interview/profile-sync';
import type { InterviewQuestionProgress } from '@/features/biography-interview/contracts';

type SessionRow = {
  id: string;
  user_id: string;
  memory_count: number | null;
  topics_covered: string[] | null;
  active_question_id: string | null;
  catalog_version: string | null;
  summary?: string | null;
};

type RecentMemoryRow = {
  raw_transcript: string | null;
  cleaned_content: string | null;
  interview_topic: string | null;
  interview_question: string | null;
  captured_at: string | null;
};

export type BiographyTurnSource = 'voice' | 'text';

export type PreparedBiographyTurn = {
  systemPrompt: string;
  messages: CoreMessage[];
  interviewSessionId: string;
  activeQuestionId: string | null;
  correlationId: string;
  delivery: BiographyTurnSource;
};

type PrepareBiographyTurnInput = {
  request: Request | undefined;
  userId: string;
  interviewSessionId: string;
  source: BiographyTurnSource;
  messages: Array<{ role: 'system' | 'assistant' | 'user'; content: string }>;
  routeName: string;
};

export function sanitizeBiographyMessageContent(raw: string): string {
  if (!raw) return '';

  let text = raw.trim();
  text = text.replace(/^(?:prompt_generation_successful|system_ready|runtime_state)\s*:?\s*/i, '');

  const fence = text.match(/```(?:text|markdown|md)?\n([\s\S]*?)\n```/i);
  if (fence?.[1]) {
    text = fence[1].trim();
  }

  return text.replace(/```/g, '').trim();
}

export function isBiographyBootstrapTurn(messages: Array<{ role: string; content: string }>) {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  return sanitizeBiographyMessageContent(lastUserMessage?.content ?? '') === BIOGRAPHY_INTERVIEW_START_TOKEN;
}

function getLastTurn(messages: CoreMessage[]) {
  let answerText: string | null = null;
  let questionText: string | null = null;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (!message || message.role !== 'user') {
      continue;
    }

    answerText =
      typeof message.content === 'string' ? sanitizeBiographyMessageContent(message.content) : '';

    for (let previousIndex = index - 1; previousIndex >= 0; previousIndex -= 1) {
      const previousMessage = messages[previousIndex];
      if (!previousMessage || previousMessage.role !== 'assistant') {
        continue;
      }

      questionText =
        typeof previousMessage.content === 'string'
          ? sanitizeBiographyMessageContent(previousMessage.content)
          : null;
      break;
    }

    break;
  }

  return { answerText, questionText };
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

async function loadInterviewContext(
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
  userId: string,
  interviewSessionId: string,
) {
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
      .select('id, user_id, memory_count, topics_covered, active_question_id, catalog_version, summary')
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

export async function prepareBiographyInterviewTurn(
  input: PrepareBiographyTurnInput,
): Promise<
  | { ok: true; value: PreparedBiographyTurn }
  | { ok: false; error: { status: number; code: string; message: string; correlationId: string } }
> {
  const logger = createRouteLogger(input.routeName, input.request);
  const normalizedMessages = input.messages.map((message) => ({
    role: message.role,
    content:
      sanitizeBiographyMessageContent(message.content) === BIOGRAPHY_INTERVIEW_START_TOKEN
        ? 'Bitte eröffne das Biografiegespräch jetzt mit der ersten passenden Frage.'
        : sanitizeBiographyMessageContent(message.content),
  })) as CoreMessage[];

  const serviceClient = await createServiceClient();
  const interviewContext = await loadInterviewContext(
    serviceClient,
    input.userId,
    input.interviewSessionId,
  );

  if (
    interviewContext.userProfileError ||
    interviewContext.recentMemoriesError ||
    interviewContext.sessionError
  ) {
    logger.error('Failed to load biography interview context', {
      userProfileError: interviewContext.userProfileError?.message,
      recentMemoriesError: interviewContext.recentMemoriesError?.message,
      sessionError: interviewContext.sessionError?.message,
    });
    return {
      ok: false,
      error: {
        status: 500,
        code: 'BIOGRAPHY_INTERVIEW_CONTEXT_FAILED',
        message: 'Failed to load biography interview context',
        correlationId: logger.correlationId,
      },
    };
  }

  if (!interviewContext.session) {
    return {
      ok: false,
      error: {
        status: 404,
        code: 'INTERVIEW_SESSION_NOT_FOUND',
        message: 'Interview session not found',
        correlationId: logger.correlationId,
      },
    };
  }

  let progressRows = await loadInterviewQuestionProgress(serviceClient, {
    interviewSessionId: input.interviewSessionId,
    userId: input.userId,
  });

  if (progressRows.length === 0) {
    await seedInterviewQuestionProgress(serviceClient, {
      interviewSessionId: input.interviewSessionId,
      userId: input.userId,
    });
    progressRows = await loadInterviewQuestionProgress(serviceClient, {
      interviewSessionId: input.interviewSessionId,
      userId: input.userId,
    });
  }

  const previousActiveQuestionId = interviewContext.session.active_question_id;
  const previousActiveQuestion = previousActiveQuestionId
    ? getCatalogQuestion(previousActiveQuestionId)
    : null;
  const { answerText, questionText } = getLastTurn(normalizedMessages);
  let memoryCount = interviewContext.session.memory_count || 0;

  if (!isBiographyBootstrapTurn(input.messages) && previousActiveQuestion && answerText) {
    const evaluation = evaluateInterviewAnswer(answerText, previousActiveQuestion);
    let answerMemoryId: string | null = null;

    if (evaluation.shouldPersistMemory && shouldPersistInterviewMemory(answerText)) {
      const memoryPayload = {
        user_id: input.userId,
        raw_transcript: answerText,
        cleaned_content: answerText,
        captured_at: new Date().toISOString(),
        capture_mode: 'interview',
        interview_session_id: input.interviewSessionId,
        interview_question: questionText || previousActiveQuestion.promptIntent,
        interview_topic: previousActiveQuestion.topicId,
        people: [],
        places: [],
        topics: [previousActiveQuestion.topicId],
        emotions: null,
        suggested_category: null,
        suggested_chapter_id: null,
        suggestion_confidence: 0,
        source: input.source,
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
        return {
          ok: false,
          error: {
            status: 500,
            code: 'BIOGRAPHY_MEMORY_PERSIST_FAILED',
            message: 'Failed to persist biography memory',
            correlationId: logger.correlationId,
          },
        };
      }

      answerMemoryId = insertedMemory?.id ?? null;
      memoryCount += 1;
    }

    const progressOutcome = evaluation.outcome === 'pending_followup' ? 'pending' : evaluation.outcome;
    await updateQuestionOutcome(serviceClient, {
      interviewSessionId: input.interviewSessionId,
      userId: input.userId,
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

    try {
      await syncBiographyInterviewProfileData({
        serviceClient,
        userId: input.userId,
        currentQuestionId: previousActiveQuestion.id,
        currentAnswerText: answerText,
        progressRows,
      });
    } catch (profileSyncError) {
      logger.warn('Failed to sync biography interview profile data', {
        questionId: previousActiveQuestion.id,
        error: profileSyncError instanceof Error ? profileSyncError.message : 'unknown',
      });
    }
  }

  const autoSkippedQuestionIds = getAutoSkippedQuestionIds(progressRows);
  if (autoSkippedQuestionIds.length > 0) {
    await bulkSkipQuestions(serviceClient, {
      interviewSessionId: input.interviewSessionId,
      userId: input.userId,
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
      raw_transcript: (memory as RecentMemoryRow).raw_transcript || '',
      cleaned_content: (memory as RecentMemoryRow).cleaned_content || '',
      interview_topic: (memory as RecentMemoryRow).interview_topic || '',
      interview_question: (memory as RecentMemoryRow).interview_question || '',
      captured_at: (memory as RecentMemoryRow).captured_at || '',
    })),
    previousTopics: coveredTopics,
    activeQuestion: nextQuestion,
    bridgeContext: buildInterviewerBridgeContext({
      activeQuestion: nextQuestion ?? previousActiveQuestion ?? getCatalogQuestion('basis.birth')!,
      recentMemories: interviewContext.recentMemories || [],
    }),
    progressSummary,
    delivery: input.source,
  });

  if (nextQuestion) {
    const previousAskedCount =
      progressRows.find((row) => row.question_id === nextQuestion.id)?.asked_count || 0;
    await markQuestionAsked(serviceClient, {
      interviewSessionId: input.interviewSessionId,
      userId: input.userId,
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
    .eq('id', input.interviewSessionId)
    .eq('user_id', input.userId);

  return {
    ok: true,
    value: {
      systemPrompt: prompt.systemPrompt,
      messages: normalizedMessages,
      interviewSessionId: input.interviewSessionId,
      activeQuestionId: nextQuestion?.id ?? null,
      correlationId: logger.correlationId,
      delivery: input.source,
    },
  };
}

function ensureGeminiApiKey() {
  const apiKey = getServerConfig().geminiApiKey;
  if (!apiKey) {
    return null;
  }

  process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
  return apiKey;
}

export async function streamBiographyInterviewReply(input: PreparedBiographyTurn) {
  const apiKey = ensureGeminiApiKey();
  if (!apiKey) {
    throw new Error('AI provider not configured');
  }

  return streamText({
    model: google('gemini-2.0-flash'),
    system: input.systemPrompt,
    messages: input.messages,
    maxTokens: 900,
    temperature: 0.7,
  });
}

export async function generateBiographyInterviewReply(input: PreparedBiographyTurn) {
  const apiKey = ensureGeminiApiKey();
  if (!apiKey) {
    throw new Error('AI provider not configured');
  }

  const result = await generateText({
    model: google('gemini-2.0-flash'),
    system: input.systemPrompt,
    messages: input.messages,
    maxTokens: 900,
    temperature: 0.7,
  });

  if (input.delivery === 'voice') {
    return {
      ...result,
      text: shapeGermanVoiceAgentText(result.text),
    };
  }

  return result;
}

export async function buildBiographyVoiceAgentRuntimeContext(input: {
  userId: string;
  interviewSessionId: string;
}) {
  const serviceClient = await createServiceClient();
  const context = await loadInterviewContext(serviceClient, input.userId, input.interviewSessionId);

  if (
    context.userProfileError ||
    context.recentMemoriesError ||
    context.sessionError ||
    !context.session
  ) {
    return [];
  }

  const activeQuestion = context.session.active_question_id
    ? getCatalogQuestion(context.session.active_question_id)?.promptIntent ?? null
    : null;

  return buildBiographyVoiceAgentContextMessages({
    fullName: context.userProfile?.full_name || null,
    coveredTopics: context.session.topics_covered ?? [],
    activeQuestion,
    sessionSummary: context.session.summary ?? null,
    recentMemories: (context.recentMemories || []).map((memory) => ({
      raw_transcript: (memory as RecentMemoryRow).raw_transcript ?? null,
      cleaned_content: (memory as RecentMemoryRow).cleaned_content ?? null,
      interview_topic: (memory as RecentMemoryRow).interview_topic ?? null,
    })),
  });
}
