import {
  BIOGRAPHY_INTERVIEW_CATALOG_VERSION,
  biographyInterviewCatalog,
  getCatalogQuestion,
} from './catalog';
import type {
  CatalogQuestion,
  InterviewQuestionProgress,
  InterviewQuestionState,
  ProgressCounts,
  ProgressSummary,
} from './contracts';

type ProgressMap = Map<string, InterviewQuestionProgress>;

export function createSeedProgressRows(input: {
  interviewSessionId: string;
  userId: string;
}): InterviewQuestionProgress[] {
  const now = new Date().toISOString();

  return biographyInterviewCatalog.map((question) => ({
    interview_session_id: input.interviewSessionId,
    user_id: input.userId,
    question_id: question.id,
    topic_id: question.topicId,
    state: 'pending' as InterviewQuestionState,
    asked_count: 0,
    asked_at: null,
    answered_at: null,
    deferred_at: null,
    skipped_at: null,
    answer_memory_id: null,
    prompt_snapshot: null,
    evaluator_summary: null,
    answer_excerpt: null,
    created_at: now,
    updated_at: now,
  }));
}

function buildProgressMap(progressRows: InterviewQuestionProgress[]): ProgressMap {
  return new Map(progressRows.map((row) => [row.question_id, row]));
}

function normalizeAnswer(text: string | null | undefined): string {
  return (text ?? '').trim().toLowerCase();
}

function conditionSatisfied(
  progressMap: ProgressMap,
  condition: CatalogQuestion['dependsOn'][number],
): boolean | null {
  const progress = progressMap.get(condition.questionId);
  if (!progress) {
    return null;
  }

  if (progress.state !== 'answered' && progress.state !== 'skipped') {
    return null;
  }

  const haystack = normalizeAnswer(progress.answer_excerpt);

  if (progress.state === 'skipped') {
    return false;
  }

  if (condition.anyKeywords.length > 0 && !condition.anyKeywords.some((keyword) => haystack.includes(keyword))) {
    return false;
  }

  if (condition.noneKeywords.length > 0 && condition.noneKeywords.some((keyword) => haystack.includes(keyword))) {
    return false;
  }

  return true;
}

function isEligible(question: CatalogQuestion, progressMap: ProgressMap): boolean {
  if (question.dependsOn.length === 0) {
    return true;
  }

  let hasUnknownDependency = false;
  for (const condition of question.dependsOn) {
    const satisfied = conditionSatisfied(progressMap, condition);
    if (satisfied === null) {
      hasUnknownDependency = true;
      continue;
    }
    if (!satisfied) {
      return false;
    }
  }

  return !hasUnknownDependency;
}

export function getAutoSkippedQuestionIds(progressRows: InterviewQuestionProgress[]): string[] {
  const progressMap = buildProgressMap(progressRows);
  const autoSkipped: string[] = [];

  for (const question of biographyInterviewCatalog) {
    if (question.dependsOn.length === 0) {
      continue;
    }

    const progress = progressMap.get(question.id);
    if (!progress || progress.state !== 'pending' || progress.asked_count > 0) {
      continue;
    }

    const dependencyResults = question.dependsOn.map((condition) => conditionSatisfied(progressMap, condition));
    if (dependencyResults.some((result) => result === false)) {
      autoSkipped.push(question.id);
    }
  }

  return autoSkipped;
}

export function chooseNextQuestion(progressRows: InterviewQuestionProgress[], currentQuestionId: string | null) {
  const progressMap = buildProgressMap(progressRows);

  if (currentQuestionId) {
    const currentProgress = progressMap.get(currentQuestionId);
    if (currentProgress?.state === 'pending') {
      return getCatalogQuestion(currentQuestionId);
    }
  }

  const pendingQuestions = biographyInterviewCatalog.filter((question) => {
    const progress = progressMap.get(question.id);
    if (!progress) {
      return false;
    }
    return progress.state === 'pending' && isEligible(question, progressMap);
  });

  if (pendingQuestions.length > 0) {
    return pendingQuestions[0] ?? null;
  }

  const deferredQuestions = biographyInterviewCatalog.filter((question) => {
    const progress = progressMap.get(question.id);
    if (!progress) {
      return false;
    }
    return progress.state === 'deferred' && isEligible(question, progressMap);
  });

  return deferredQuestions[0] ?? null;
}

export function summarizeProgress(progressRows: InterviewQuestionProgress[], activeQuestionId: string | null): ProgressSummary {
  const counts = progressRows.reduce<ProgressCounts>(
    (acc, row) => {
      acc[row.state] += 1;
      acc.total += 1;
      return acc;
    },
    {
      pending: 0,
      answered: 0,
      deferred: 0,
      skipped: 0,
      total: 0,
      remainingRequired: 0,
    },
  );

  const progressMap = buildProgressMap(progressRows);
  counts.remainingRequired = biographyInterviewCatalog.filter((question) => {
    const progress = progressMap.get(question.id);
    return question.required && progress && progress.state !== 'answered' && progress.state !== 'skipped';
  }).length;

  const activeQuestion = activeQuestionId ? getCatalogQuestion(activeQuestionId) : null;

  return {
    counts,
    activeQuestionId,
    activeQuestionLabel: activeQuestion?.promptIntent ?? null,
    activeTopicLabel: activeQuestion?.topicLabel ?? null,
    catalogVersion: BIOGRAPHY_INTERVIEW_CATALOG_VERSION,
  };
}

export function buildTopicCoverage(progressRows: InterviewQuestionProgress[]): string[] {
  const progressMap = buildProgressMap(progressRows);
  const coveredTopics = new Set<string>();

  for (const question of biographyInterviewCatalog) {
    const progress = progressMap.get(question.id);
    if (progress?.state === 'answered') {
      coveredTopics.add(question.topicId);
    }
  }

  return Array.from(coveredTopics);
}

export function getCatalogTopicByQuestionId(questionId: string | null): string | null {
  const question = questionId ? getCatalogQuestion(questionId) : null;
  return question?.topicId ?? null;
}
