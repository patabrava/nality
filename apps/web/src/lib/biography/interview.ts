export const BIOGRAPHY_INTERVIEW_START_TOKEN = '__START_BIOGRAPHY_INTERVIEW__';

export type VoiceAgentContextMessage = {
  role: 'assistant' | 'user';
  content: string;
};

export function shouldPersistInterviewMemory(answerText: string): boolean {
  const normalized = answerText.trim().toLowerCase();

  if (answerText.trim() === BIOGRAPHY_INTERVIEW_START_TOKEN) {
    return false;
  }

  if (normalized.length < 20) {
    return false;
  }

  const discardPatterns = [
    /^ja[.!?]?$/,
    /^nein[.!?]?$/,
    /^weiter[.!?]?$/,
    /^überspringen[.!?]?$/,
    /^skip[.!?]?$/,
    /^weiß ich nicht[.!?]?$/,
  ];

  return !discardPatterns.some((pattern) => pattern.test(normalized));
}

export function shapeGermanVoiceAgentText(raw: string): string {
  const withoutMarkdown = raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[*_`#>]/g, ' ')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .trim();

  const clauseNormalized = withoutMarkdown
    .replace(/\s*;\s*/g, '. ')
    .replace(/\s*:\s*/g, '. ')
    .replace(/\s*\/\s*oder\s*/gi, ' oder ')
    .replace(/\s*\/\s*/g, ' oder ')
    .replace(/\.{4,}/g, '...')
    .replace(/\?{2,}/g, '?')
    .replace(/!{2,}/g, '!')
    .replace(/\s+/g, ' ')
    .replace(/,\s+(und|aber|weil|dass|wobei)\s+/gi, '. $1 ')
    .trim();

  return clauseNormalized
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/([.!?])(?=[^\s])/g, '$1 ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clipForVoiceContext(raw: string, maxLength = 220) {
  const shaped = shapeGermanVoiceAgentText(raw);
  if (shaped.length <= maxLength) {
    return shaped;
  }

  return `${shaped.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildBiographyVoiceAgentContextMessages(input: {
  fullName: string | null;
  coveredTopics: string[];
  activeQuestion: string | null;
  sessionSummary: string | null;
  recentMemories: Array<{
    raw_transcript: string | null;
    cleaned_content: string | null;
    interview_topic: string | null;
  }>;
}): VoiceAgentContextMessage[] {
  const messages: VoiceAgentContextMessage[] = [];
  const assistantSummaryParts = [
    input.fullName ? `Gespräch mit ${input.fullName}.` : null,
    input.coveredTopics.length > 0
      ? `Schon besprochene Themen: ${input.coveredTopics.join(', ')}.`
      : 'Es wurden noch keine Themen sauber abgeschlossen.',
    input.activeQuestion ? `Die aktuell offene Leitfrage lautet: ${input.activeQuestion}.` : null,
    input.sessionSummary ? clipForVoiceContext(input.sessionSummary, 180) : null,
  ].filter(Boolean);

  if (assistantSummaryParts.length > 0) {
    messages.push({
      role: 'assistant',
      content: assistantSummaryParts.join(' '),
    });
  }

  const latestMemory = input.recentMemories[0];
  const latestMemoryText = latestMemory
    ? latestMemory.cleaned_content || latestMemory.raw_transcript || null
    : null;

  if (latestMemoryText) {
    messages.push({
      role: 'user',
      content: `Zuletzt habe ich erzählt: ${clipForVoiceContext(latestMemoryText, 180)}`,
    });
  }

  return messages;
}
