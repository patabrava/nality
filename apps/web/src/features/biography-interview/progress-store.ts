import { biographyInterviewCatalog, getCatalogQuestion } from './catalog';
import { createSeedProgressRows, summarizeProgress } from './planner';
import type { InterviewQuestionProgress, ProgressSummary } from './contracts';

type SupabaseLikeClient = {
  from: (table: string) => any;
};

export async function seedInterviewQuestionProgress(
  serviceClient: SupabaseLikeClient,
  input: {
    interviewSessionId: string;
    userId: string;
  },
) {
  const rows = createSeedProgressRows(input);
  const { error } = await serviceClient.from('interview_question_progress').insert(rows);
  if (error) {
    throw error;
  }

  return rows;
}

export async function loadInterviewQuestionProgress(
  serviceClient: SupabaseLikeClient,
  input: {
    interviewSessionId: string;
    userId: string;
  },
): Promise<InterviewQuestionProgress[]> {
  const { data, error } = await serviceClient
    .from('interview_question_progress')
    .select('*')
    .eq('interview_session_id', input.interviewSessionId)
    .eq('user_id', input.userId)
    .order('question_id', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as InterviewQuestionProgress[];
}

export async function bulkSkipQuestions(
  serviceClient: SupabaseLikeClient,
  input: {
    interviewSessionId: string;
    userId: string;
    questionIds: string[];
    summary: string;
  },
) {
  if (input.questionIds.length === 0) {
    return;
  }

  const now = new Date().toISOString();
  const { error } = await serviceClient
    .from('interview_question_progress')
    .update({
      state: 'skipped',
      skipped_at: now,
      evaluator_summary: input.summary,
      updated_at: now,
    })
    .eq('interview_session_id', input.interviewSessionId)
    .eq('user_id', input.userId)
    .in('question_id', input.questionIds);

  if (error) {
    throw error;
  }
}

export async function markQuestionAsked(
  serviceClient: SupabaseLikeClient,
  input: {
    interviewSessionId: string;
    userId: string;
    questionId: string;
    promptSnapshot: string | null;
  },
) {
  const now = new Date().toISOString();
  const { data: current, error: currentError } = await serviceClient
    .from('interview_question_progress')
    .select('asked_count')
    .eq('interview_session_id', input.interviewSessionId)
    .eq('user_id', input.userId)
    .eq('question_id', input.questionId)
    .maybeSingle();

  if (currentError) {
    throw currentError;
  }

  const { error } = await serviceClient
    .from('interview_question_progress')
    .update({
      asked_count: (current?.asked_count || 0) + 1,
      asked_at: now,
      prompt_snapshot: input.promptSnapshot,
      updated_at: now,
    })
    .eq('interview_session_id', input.interviewSessionId)
    .eq('user_id', input.userId)
    .eq('question_id', input.questionId);

  if (error) {
    throw error;
  }
}

export async function updateQuestionOutcome(
  serviceClient: SupabaseLikeClient,
  input: {
    interviewSessionId: string;
    userId: string;
    questionId: string;
    outcome: 'answered' | 'deferred' | 'skipped' | 'pending';
    evaluatorSummary: string;
    answerExcerpt: string;
    answerMemoryId?: string | null;
  },
) {
  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    state: input.outcome,
    evaluator_summary: input.evaluatorSummary,
    answer_excerpt: input.answerExcerpt,
    updated_at: now,
  };

  if (input.outcome === 'answered') {
    updates.answered_at = now;
    updates.answer_memory_id = input.answerMemoryId ?? null;
  }

  if (input.outcome === 'deferred') {
    updates.deferred_at = now;
  }

  if (input.outcome === 'skipped') {
    updates.skipped_at = now;
  }

  const { error } = await serviceClient
    .from('interview_question_progress')
    .update(updates)
    .eq('interview_session_id', input.interviewSessionId)
    .eq('user_id', input.userId)
    .eq('question_id', input.questionId);

  if (error) {
    throw error;
  }
}

export async function getProgressSummary(
  serviceClient: SupabaseLikeClient,
  input: {
    interviewSessionId: string;
    userId: string;
    activeQuestionId: string | null;
  },
): Promise<ProgressSummary> {
  const progressRows = await loadInterviewQuestionProgress(serviceClient, input);
  return summarizeProgress(progressRows, input.activeQuestionId);
}

export function getQuestionSnapshot(questionId: string | null) {
  const question = questionId ? getCatalogQuestion(questionId) : null;
  return question
    ? {
        questionId: question.id,
        questionLabel: question.promptIntent,
        topicId: question.topicId,
        topicLabel: question.topicLabel,
      }
    : null;
}

export function getCatalogQuestionCount() {
  return biographyInterviewCatalog.length;
}
