import type { CatalogQuestion, EvaluatedAnswer } from './contracts';

const SKIP_PATTERNS = [
  /\b(überspringen|skip|möchte ich nicht|will ich nicht|darüber nicht|keine angabe|lieber nicht)\b/i,
  /^\s*(nein|no)\s*$/i,
];

const DEFER_PATTERNS = [
  /\b(später|ein andermal|nicht jetzt|vielleicht später|später gerne)\b/i,
];

function toExcerpt(text: string): string {
  const compact = text.replace(/\s+/g, ' ').trim();
  return compact.length > 280 ? `${compact.slice(0, 277)}...` : compact;
}

function isSufficientTextAnswer(answerText: string, question: CatalogQuestion): boolean {
  const normalized = answerText.replace(/\s+/g, ' ').trim();
  if (normalized.length < 12) {
    return false;
  }

  if (question.answerType === 'free_text') {
    return normalized.length >= 25 || normalized.split(' ').length >= 5;
  }

  if (question.answerType === 'multi_choice') {
    return normalized.length >= 8;
  }

  return normalized.length >= 4;
}

export function evaluateInterviewAnswer(
  answerText: string,
  question: CatalogQuestion,
): EvaluatedAnswer {
  const normalized = answerText.replace(/\s+/g, ' ').trim();
  const answerExcerpt = toExcerpt(normalized);

  if (!normalized) {
    return {
      outcome: 'pending_followup',
      summary: 'Leere Antwort, bitte behutsam nachfassen.',
      answerExcerpt,
      shouldPersistMemory: false,
    };
  }

  if (SKIP_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return {
      outcome: 'skipped',
      summary: 'Person lehnt dieses Thema ausdrücklich ab.',
      answerExcerpt,
      shouldPersistMemory: false,
    };
  }

  if (DEFER_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return {
      outcome: 'deferred',
      summary: 'Person möchte dieses Thema später behandeln.',
      answerExcerpt,
      shouldPersistMemory: false,
    };
  }

  if (!isSufficientTextAnswer(normalized, question)) {
    return {
      outcome: 'pending_followup',
      summary: 'Antwort ist zu knapp; eine konkrete Folgefrage ist nötig.',
      answerExcerpt,
      shouldPersistMemory: normalized.length >= 20,
    };
  }

  return {
    outcome: 'answered',
    summary: `Frage ${question.id} wurde ausreichend beantwortet.`,
    answerExcerpt,
    shouldPersistMemory: true,
  };
}
