export type Strand = 'extrovert' | 'introvert' | 'third_party' | null;

export type QuestionId =
  | 'Q1'
  | 'Q2'
  | 'Q3'
  | 'Q4'
  | 'Q5'
  | 'Q6'
  | 'Q7'
  | 'Q8'
  | 'Q9'
  | 'Q10'
  | 'Q11'
  | 'Q12'
  | 'Q13'
  | 'E1'
  | 'E2';

export type PreOnboardingStatus = 'in_progress' | 'paused' | 'completed';

export interface AnswerValue {
  selected?: string[];
  birth_decade?: string;
  gender_identity?: string;
  answered_at: string;
}

export type AnswersMap = Record<string, AnswerValue>;

export interface PreOnboardingState {
  sessionId: string;
  currentStrand: Strand;
  currentQuestion: QuestionId;
  questionHistory: QuestionId[];
  answers: AnswersMap;
  status: PreOnboardingStatus;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  syncError: boolean;
}

export type RouteRule = {
  questionId: QuestionId;
  optionId?: string;
  nextQuestionId: QuestionId;
};

export const ROUTING_RULES: RouteRule[] = [
  { questionId: 'Q1', optionId: 'Q1_O1', nextQuestionId: 'Q2' },
  { questionId: 'Q1', optionId: 'Q1_O2', nextQuestionId: 'Q7' },
  { questionId: 'Q1', optionId: 'Q1_O3', nextQuestionId: 'Q7' },
  { questionId: 'Q1', optionId: 'Q1_O4', nextQuestionId: 'Q7' },
  { questionId: 'Q1', optionId: 'Q1_O5', nextQuestionId: 'Q12' },
  { questionId: 'Q2', nextQuestionId: 'Q3' },
  { questionId: 'Q3', nextQuestionId: 'Q4' },
  { questionId: 'Q4', nextQuestionId: 'Q5' },
  { questionId: 'Q5', optionId: 'Q5_O1', nextQuestionId: 'Q6' },
  { questionId: 'Q5', optionId: 'Q5_O2', nextQuestionId: 'Q6' },
  { questionId: 'Q5', optionId: 'Q5_O3', nextQuestionId: 'E1' },
  { questionId: 'Q6', nextQuestionId: 'E2' },
  { questionId: 'Q7', optionId: 'Q7_O1', nextQuestionId: 'Q8' },
  { questionId: 'Q7', optionId: 'Q7_O2', nextQuestionId: 'Q8' },
  { questionId: 'Q7', optionId: 'Q7_O3', nextQuestionId: 'Q8' },
  { questionId: 'Q7', optionId: 'Q7_O4', nextQuestionId: 'Q8' },
  { questionId: 'Q7', optionId: 'Q7_O5', nextQuestionId: 'E2' },
  { questionId: 'Q7', optionId: 'Q7_O6', nextQuestionId: 'Q8' },
  { questionId: 'Q8', optionId: 'Q8_O1', nextQuestionId: 'Q9' },
  { questionId: 'Q8', optionId: 'Q8_O2', nextQuestionId: 'Q9' },
  { questionId: 'Q8', optionId: 'Q8_O3', nextQuestionId: 'Q9' },
  { questionId: 'Q8', optionId: 'Q8_O4', nextQuestionId: 'Q5' },
  { questionId: 'Q8', optionId: 'Q8_O5', nextQuestionId: 'Q9' },
  { questionId: 'Q9', nextQuestionId: 'Q10' },
  { questionId: 'Q10', optionId: 'Q10_O1', nextQuestionId: 'Q11' },
  { questionId: 'Q10', optionId: 'Q10_O2', nextQuestionId: 'E1' },
  { questionId: 'Q11', nextQuestionId: 'E2' },
  { questionId: 'Q12', nextQuestionId: 'Q13' },
  { questionId: 'Q13', nextQuestionId: 'E2' },
];

const INFO_QUESTIONS: QuestionId[] = ['Q6', 'Q12', 'E1', 'E2'];
const COMPOSITE_QUESTIONS: QuestionId[] = ['Q4', 'Q11', 'Q13'];

export const STRAND_QUESTION_SEQUENCES: Record<Exclude<Strand, null>, QuestionId[]> = {
  extrovert: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'],
  introvert: ['Q1', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11'],
  third_party: ['Q1', 'Q12', 'Q13'],
};

export function isCompositeQuestion(questionId: QuestionId): boolean {
  return COMPOSITE_QUESTIONS.includes(questionId);
}

export function isInfoQuestion(questionId: QuestionId): boolean {
  return INFO_QUESTIONS.includes(questionId);
}

export function deriveStrandFromQ1(optionId?: string): Strand {
  if (!optionId) return null;
  if (optionId === 'Q1_O1') return 'extrovert';
  if (optionId === 'Q1_O5') return 'third_party';
  return 'introvert';
}

export function getSelectedOption(answers: AnswersMap, questionId: QuestionId): string | undefined {
  return answers[questionId]?.selected?.[0];
}

export function getNextQuestionId(questionId: QuestionId, selectedOptionId?: string): QuestionId {
  const directRule = selectedOptionId
    ? ROUTING_RULES.find((rule) => rule.questionId === questionId && rule.optionId === selectedOptionId)
    : undefined;

  if (directRule) return directRule.nextQuestionId;

  const fallback = ROUTING_RULES.find((rule) => rule.questionId === questionId && !rule.optionId);
  if (fallback) return fallback.nextQuestionId;

  return questionId;
}

export function isQuestionAnswered(questionId: QuestionId, answers: AnswersMap): boolean {
  const value = answers[questionId];
  if (!value) return false;

  if (isCompositeQuestion(questionId)) {
    return Boolean(value.birth_decade && value.gender_identity);
  }

  if (isInfoQuestion(questionId)) {
    return true;
  }

  return Boolean(value.selected && value.selected.length > 0);
}

export function mergeAnswers(localAnswers: AnswersMap, remoteAnswers: AnswersMap): AnswersMap {
  const merged: AnswersMap = { ...localAnswers };
  const questionIds = new Set([...Object.keys(localAnswers), ...Object.keys(remoteAnswers)]);

  for (const questionId of questionIds) {
    const localValue = localAnswers[questionId];
    const remoteValue = remoteAnswers[questionId];

    if (!localValue) {
      if (!remoteValue) continue;
      merged[questionId] = remoteValue;
      continue;
    }

    if (!remoteValue) {
      merged[questionId] = localValue;
      continue;
    }

    merged[questionId] = Date.parse(remoteValue.answered_at) > Date.parse(localValue.answered_at) ? remoteValue : localValue;
  }

  return merged;
}

export function deriveCurrentQuestion(answers: AnswersMap): QuestionId {
  let current: QuestionId = 'Q1';
  const visited = new Set<QuestionId>();

  while (!visited.has(current)) {
    visited.add(current);
    const answered = isQuestionAnswered(current, answers);
    if (!answered) return current;

    if (current === 'E1' || current === 'E2') {
      return current;
    }

    const selected = getSelectedOption(answers, current);
    const next = getNextQuestionId(current, selected);

    if (next === current) {
      return current;
    }

    current = next;
  }

  return current;
}

export function deriveQuestionHistory(answers: AnswersMap, targetQuestionId: QuestionId): QuestionId[] {
  let current: QuestionId = 'Q1';
  const visited = new Set<QuestionId>();
  const history: QuestionId[] = [];

  while (!visited.has(current)) {
    if (current === targetQuestionId) {
      return history;
    }

    visited.add(current);
    const answered = isQuestionAnswered(current, answers);
    if (!answered) {
      return history;
    }

    const selected = getSelectedOption(answers, current);
    const next = getNextQuestionId(current, selected);
    if (next === current) {
      return history;
    }

    history.push(current);
    current = next;
  }

  return history;
}

export function getProgressForState(state: Pick<PreOnboardingState, 'currentStrand' | 'currentQuestion' | 'answers'>): {
  current: number;
  total: number;
  label: string;
} | null {
  const strand = state.currentStrand;
  if (!strand) return null;

  if (strand === 'introvert' && ['Q5', 'Q6', 'E1', 'E2'].includes(state.currentQuestion)) {
    return {
      current: ['Q5', 'Q6', 'E1', 'E2'].includes(state.currentQuestion) ? 4 : 3,
      total: 5,
      label: 'Strang Introvertiert (mit Sprung)',
    };
  }

  const sequence = STRAND_QUESTION_SEQUENCES[strand];
  const index = sequence.indexOf(state.currentQuestion);

  if (index === -1) {
    const answeredCount = sequence.filter((questionId) => isQuestionAnswered(questionId, state.answers)).length;
    return {
      current: Math.max(1, Math.min(answeredCount + 1, sequence.length)),
      total: sequence.length,
      label: strand === 'extrovert' ? 'Strang Extrovertiert' : strand === 'introvert' ? 'Strang Introvertiert' : 'Strang Für Dritte',
    };
  }

  return {
    current: index + 1,
    total: sequence.length,
    label: strand === 'extrovert' ? 'Strang Extrovertiert' : strand === 'introvert' ? 'Strang Introvertiert' : 'Strang Für Dritte',
  };
}

export function getPreviousQuestionId(currentQuestion: QuestionId, questionHistory: QuestionId[]): QuestionId | null {
  if (currentQuestion === 'Q1') return null;

  if (currentQuestion === 'Q2' || currentQuestion === 'Q7' || currentQuestion === 'Q12') {
    return 'Q1';
  }

  return questionHistory.length > 0 ? questionHistory[questionHistory.length - 1] ?? null : null;
}
