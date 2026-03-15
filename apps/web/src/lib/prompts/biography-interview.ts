import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { ENTRY_OPTIONS, PATH_STEPS, type AltAnswerValue, type AltPath } from '@/lib/onboarding/alt-config';
import type { CatalogQuestion, ProgressSummary } from '@/features/biography-interview/contracts';

const PROMPT_FILENAME = 'biography-interview.txt';

let cachedPromptTemplate: string | null = null;

const TopicCatalog = [
  {
    id: 'basis_information',
    label: 'Basisinformationen',
    goal: 'Basisdaten nur als warmer Einstieg nutzen und sofort in erzählbare Erinnerungen führen.',
    promptHint: 'Frage nach einer konkreten frühen Szene, einem prägenden Ort oder einem ersten klaren Lebensbild.',
    sensitive: false,
  },
  {
    id: 'family_background',
    label: 'Familienhintergrund',
    goal: 'wichtige Menschen, familiäre Dynamiken und prägende Beziehungen greifbar machen',
    promptHint: 'Frage nach einer Person, einer Szene zuhause oder einer frühen Familienregel.',
    sensitive: false,
  },
  {
    id: 'childhood_and_youth',
    label: 'Kindheit und Jugend',
    goal: 'prägende Kindheits- und Jugenderfahrungen konkretisieren',
    promptHint: 'Bitte um eine konkrete Erinnerung aus Kindheit oder Jugend mit Ort, Person und Gefühl.',
    sensitive: false,
  },
  {
    id: 'education_and_career',
    label: 'Bildung und Beruf',
    goal: 'Schlüsselstationen rund um Lernen, Ausbildung, Arbeit und Richtungswechsel sammeln',
    promptHint: 'Frage nach einer Entscheidung, einem Übergang oder einer prägenden Arbeits- oder Lernsituation.',
    sensitive: false,
  },
  {
    id: 'relationships_and_social_environment',
    label: 'Beziehungen und soziales Umfeld',
    goal: 'wichtige Bindungen und soziale Kontexte sichtbar machen',
    promptHint: 'Frage behutsam nach Menschen, die den Alltag, Halt oder Wendepunkte geprägt haben.',
    sensitive: true,
  },
  {
    id: 'personal_development_and_values',
    label: 'Persönliche Entwicklung und Werte',
    goal: 'Werte, Haltungen und innere Entwicklung an echten Situationen festmachen',
    promptHint: 'Bitte um ein Erlebnis, das einen Wert oder eine Veränderung sichtbar macht.',
    sensitive: false,
  },
  {
    id: 'interests_and_passions',
    label: 'Interessen und Leidenschaften',
    goal: 'Themen finden, bei denen Energie, Freude oder Können sichtbar wird',
    promptHint: 'Frage nach Hobbys, Leidenschaften oder Tätigkeiten, bei denen die Zeit vergessen wurde.',
    sensitive: false,
  },
  {
    id: 'life_philosophy_and_future',
    label: 'Lebensphilosophie und Zukunft',
    goal: 'Blick auf Lebenssinn, Haltung und Zukunftswünsche sammeln',
    promptHint: 'Frage nach einem Leitgedanken, einer Zukunftshoffnung oder einem selbst gesetzten Kompass.',
    sensitive: false,
  },
  {
    id: 'emotional_and_narrative_dimension',
    label: 'Emotionale und narrative Dimension',
    goal: 'Emotionen, Konflikte und Wendepunkte nur mit ausdrücklicher Erlaubnis vertiefen',
    promptHint: 'Nur wenn die Person selbst offen wirkt: nach Gefühlen, innerer Spannung oder einem Wendepunkt fragen.',
    sensitive: true,
  },
  {
    id: 'autobiography_motivation',
    label: 'Autobiografie-Motivation',
    goal: 'verstehen, warum diese Erinnerungen festgehalten werden sollen',
    promptHint: 'Frage nach Anlass, Motivation oder gewünschter Wirkung auf Familie oder spätere Leserinnen und Leser.',
    sensitive: false,
  },
  {
    id: 'basis_profile_and_storytelling_voice',
    label: 'Profil und Erzählstimme',
    goal: 'Ansprache, Ton und bevorzugte Erzählhaltung für spätere Gespräche schärfen',
    promptHint: 'Frage nach bevorzugter Art des Erzählens, Tempo oder ob eher Szenen, Personen oder Gedanken im Vordergrund stehen sollen.',
    sensitive: false,
  },
] as const;

const AltOnboardingPrivateSchema = z
  .object({
    version: z.string().optional(),
    entry: z
      .object({
        answerId: z.string(),
        path: z.enum(['A', 'B', 'C']),
      })
      .nullable()
      .optional(),
    path: z.enum(['A', 'B', 'C']).nullable().optional(),
    steps: z.record(z.string(), z.unknown()).default({}),
    addressPreference: z.enum(['du', 'sie']).nullable().optional(),
    registration: z
      .object({
        firstNameOrNickname: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().optional(),
        method: z.enum(['password', 'google']).optional(),
      })
      .nullable()
      .optional(),
    completedAt: z.string().optional(),
  })
  .passthrough();

type BiographyTopicId = (typeof TopicCatalog)[number]['id'];

type InterviewMemory = {
  raw_transcript: string;
  cleaned_content: string | null;
  interview_topic: string | null;
  interview_question: string | null;
  captured_at: string | null;
};

type LegacyPromptInput = {
  fullName: string | null;
  altOnboardingPrivate: unknown;
  recentMemories: InterviewMemory[];
  previousTopics: string[];
};

type CoveragePromptInput = {
  fullName: string | null;
  altOnboardingPrivate: unknown;
  recentMemories: InterviewMemory[];
  previousTopics?: string[];
  activeQuestion: CatalogQuestion | null;
  bridgeContext: string[];
  progressSummary: ProgressSummary | null;
  delivery?: 'text' | 'voice';
};

type PromptDelivery = 'text' | 'voice';

type DeliveryPromptInput = {
  delivery?: PromptDelivery;
};

export type BiographyInterviewPromptInput =
  | (LegacyPromptInput & DeliveryPromptInput)
  | CoveragePromptInput;

export interface BiographyInterviewPromptResult {
  systemPrompt: string;
  recommendedTopicId: string;
  activeQuestionId: string | null;
}

function resolvePromptPath(filename: string): string | null {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, 'src', 'lib', 'prompts', 'files', filename),
    path.join(cwd, 'apps', 'web', 'src', 'lib', 'prompts', 'files', filename),
    path.join(cwd, 'src', 'lib', 'prompts', filename),
    path.join(cwd, 'apps', 'web', 'src', 'lib', 'prompts', filename),
  ];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch {
      // ignore prompt path lookup failures
    }
  }

  return null;
}

function getBiographyInterviewPromptTemplate(): string {
  if (cachedPromptTemplate && process.env.NODE_ENV === 'production') {
    return cachedPromptTemplate;
  }

  const promptPath = resolvePromptPath(PROMPT_FILENAME);
  if (promptPath) {
    cachedPromptTemplate = fs.readFileSync(promptPath, 'utf-8');
    return cachedPromptTemplate;
  }

  cachedPromptTemplate = [
    'Du bist der deutsche Biografie-Interview-Agent von Nality.',
    'Aktives Thema: {{recommendedTopicLabel}}',
    'Aktive Leitfrage: {{activeQuestionLabel}}',
    'Frageziel: {{activeQuestionIntent}}',
    'Frageform: {{activeQuestionInstruction}}',
    'Name-Kontext: {{fullName}}',
    'Private Pre-Onboarding-Zusammenfassung:',
    '{{onboardingLines}}',
  ].join('\n');

  return cachedPromptTemplate;
}

function formatAnswerValue(value: AltAnswerValue | unknown): string {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry)).join(', ');
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => {
        if (Array.isArray(entry)) {
          return `${key}: ${entry.map((part) => String(part)).join(', ')}`;
        }

        return `${key}: ${String(entry)}`;
      })
      .join('; ');
  }

  return String(value ?? '');
}

function getAltOnboardingSummaryLines(privatePayload: unknown): string[] {
  const parsed = AltOnboardingPrivateSchema.safeParse(privatePayload);

  if (!parsed.success) {
    return ['Keine private Pre-Onboarding-Zusammenfassung vorhanden.'];
  }

  const payload = parsed.data;
  const lines: string[] = [];

  if (payload.registration?.firstNameOrNickname) {
    lines.push(`Name/Vorname: ${payload.registration.firstNameOrNickname}`);
  }

  if (payload.addressPreference) {
    lines.push(`Ansprache: ${payload.addressPreference}`);
  }

  if (payload.entry?.answerId) {
    const entryOption = ENTRY_OPTIONS.find((option) => option.answerId === payload.entry?.answerId);
    if (entryOption) {
      lines.push(`Einstiegstyp: ${entryOption.label}`);
    }
  }

  const pathId = payload.path ?? payload.entry?.path ?? null;
  if (pathId) {
    lines.push(`Pre-Onboarding-Pfad: ${pathId}`);
    for (const step of PATH_STEPS[pathId as AltPath]) {
      const response = payload.steps[step.id];
      if (response === undefined || response === null || response === '') {
        continue;
      }

      lines.push(`${step.text} Antwort: ${formatAnswerValue(response)}`);
    }
  }

  return lines.length > 0 ? lines : ['Keine private Pre-Onboarding-Zusammenfassung vorhanden.'];
}

function getRecentMemoryLines(recentMemories: InterviewMemory[]): string[] {
  if (recentMemories.length === 0) {
    return ['Noch keine gespeicherten Interview-Erinnerungen vorhanden.'];
  }

  return recentMemories.slice(0, 5).map((memory, index) => {
    const content = (memory.cleaned_content || memory.raw_transcript || '').replace(/\s+/g, ' ').trim();
    const excerpt = content.length > 180 ? `${content.slice(0, 180)}...` : content;
    const topic = memory.interview_topic || 'unbekanntes Thema';
    return `Erinnerung ${index + 1}: Thema=${topic}; Inhalt=${excerpt}`;
  });
}

function hasSensitiveDisclosure(lines: string[]): boolean {
  const haystack = lines.join(' ').toLowerCase();
  const sensitiveMarkers = [
    'trauer',
    'verlust',
    'krankheit',
    'tod',
    'trauma',
    'gewalt',
    'missbrauch',
    'scheidung',
    'depression',
  ];

  return sensitiveMarkers.some((marker) => haystack.includes(marker));
}

function normalizeTopic(raw: string | null | undefined): string | null {
  if (!raw) {
    return null;
  }

  return raw.trim().toLowerCase().replace(/\s+/g, '_');
}

function selectRecommendedTopic(previousTopics: string[], sensitiveAllowed: boolean) {
  const covered = new Set(previousTopics.map((topic) => normalizeTopic(topic)).filter(Boolean));

  for (const topic of TopicCatalog) {
    if (covered.has(topic.id)) {
      continue;
    }

    if (topic.sensitive && !sensitiveAllowed) {
      continue;
    }

    return topic;
  }

  return TopicCatalog.find((topic) => !topic.sensitive || sensitiveAllowed) ?? TopicCatalog[0];
}

function getTopicMeta(topicId: string | null | undefined) {
  return TopicCatalog.find((topic) => topic.id === topicId) ?? null;
}

function renderPromptList(lines: string[]): string {
  return lines.map((line) => `- ${line}`).join('\n');
}

function buildLegacyFollowupCandidates(recentMemories: InterviewMemory[], recommendedTopic: (typeof TopicCatalog)[number]): string[] {
  const candidates: string[] = [];
  const lastMemory = recentMemories[0];

  if (lastMemory) {
    const excerpt = (lastMemory.cleaned_content || lastMemory.raw_transcript || '').replace(/\s+/g, ' ').trim();
    const shortExcerpt = excerpt.length > 120 ? `${excerpt.slice(0, 120)}...` : excerpt;
    candidates.push(
      `Nutze die letzte gespeicherte Erinnerung als Anschluss: "${shortExcerpt}". Stelle dazu genau eine vertiefende Frage, die eine Szene, Person oder Entscheidung konkretisiert.`,
    );
  }

  candidates.push(
    `Falls kein guter Anschluss aus der letzten Erinnerung entsteht, führe in das empfohlene Thema "${recommendedTopic.label}" ein und bitte zuerst um Erlaubnis.`,
  );
  candidates.push(
    'Wenn die Person ein Thema ablehnt, wechsle weich zum nächsten passenden Thema aus dem Katalog statt beim selben Thema zu bleiben.',
  );

  return candidates;
}

function getActiveQuestionInstruction(question: CatalogQuestion | null): string {
  if (!question) {
    return 'Keine weitere Pflichtfrage ist offen. Beende das Gespräch warm und ohne neue Themen zu eröffnen.';
  }

  if (question.answerType === 'single_choice' || question.answerType === 'multi_choice') {
    return 'Formuliere die Leitfrage natürlich und öffne sie mit einem kurzen biografischen Anschluss, statt sie wie eine Auswahlfrage vorzulesen.';
  }

  if (question.sensitive) {
    return 'Hol dir zuerst behutsam Erlaubnis und frage nur weiter, wenn die Person sichtbar mitgehen möchte.';
  }

  return 'Formuliere genau diese Leitfrage warm, konkret und szenisch. Keine Listen, keine Meta-Erklärung.';
}

function getProgressLines(summary: ProgressSummary | null): string[] {
  if (!summary) {
    return ['Noch kein expliziter Fortschrittsstand verfügbar.'];
  }

  return [
    `Offen: ${summary.counts.pending}`,
    `Beantwortet: ${summary.counts.answered}`,
    `Vertagt: ${summary.counts.deferred}`,
    `Übersprungen: ${summary.counts.skipped}`,
    `Verbleibende Pflichtfragen: ${summary.counts.remainingRequired}`,
  ];
}

function isCoveragePromptInput(input: BiographyInterviewPromptInput): input is CoveragePromptInput {
  return 'activeQuestion' in input;
}

function getVoiceDeliveryRules(delivery: PromptDelivery | undefined): string[] {
  if (delivery !== 'voice') {
    return [];
  }

  return [
    'Sprachmodus Voice Agent:',
    '- Formuliere so, wie man in einem ruhigen deutschen Gespräch wirklich spricht, nicht wie in einem geschriebenen Text.',
    '- Nutze kurze, gut sprechbare Sätze mit klarer Interpunktion.',
    '- Stelle genau eine Frage auf einmal und halte Einleitungen knapp.',
    '- Keine Aufzählungen, keine Klammern, keine Semikolons, keine Formulierungen im Stil von Kundenservice.',
    '- Klinge warm, ruhig und glaubwürdig, nicht begeistert oder übertrieben tröstend.',
  ];
}

export function clearBiographyInterviewPromptCache(): void {
  cachedPromptTemplate = null;
}

export function buildBiographyInterviewPrompt(
  input: BiographyInterviewPromptInput,
): BiographyInterviewPromptResult {
  const delivery = input.delivery ?? 'text';
  const onboardingLines = getAltOnboardingSummaryLines(input.altOnboardingPrivate);
  const sensitiveAllowed = hasSensitiveDisclosure(onboardingLines);
  const recentMemoryLines = getRecentMemoryLines(input.recentMemories);

  if (isCoveragePromptInput(input)) {
    const fallbackTopic = selectRecommendedTopic(input.previousTopics ?? [], sensitiveAllowed);
    const activeTopicMeta = getTopicMeta(input.activeQuestion?.topicId);
    const recommendedTopicLabel = input.activeQuestion?.topicLabel ?? fallbackTopic.label;
    const activeQuestionIntent = input.activeQuestion?.promptIntent ?? 'Bedanke dich kurz und schließe das Interview natürlich ab.';
    const bridgeContextLines = input.bridgeContext.length > 0
      ? input.bridgeContext
      : ['Bitte beginne weich und knüpfe, wenn möglich, an die letzte Erzählung an.'];

    const systemPrompt = getBiographyInterviewPromptTemplate()
      .replace('{{recommendedTopicLabel}}', recommendedTopicLabel)
      .replace('{{recommendedTopicGoal}}', activeTopicMeta?.goal ?? fallbackTopic.goal)
      .replace('{{recommendedTopicPromptHint}}', getActiveQuestionInstruction(input.activeQuestion))
      .replace('{{activeQuestionLabel}}', input.activeQuestion?.id ?? 'interview.complete')
      .replace('{{activeQuestionIntent}}', activeQuestionIntent)
      .replace('{{activeQuestionInstruction}}', getActiveQuestionInstruction(input.activeQuestion))
      .replace('{{fullName}}', input.fullName || 'unbekannt')
      .replace('{{onboardingLines}}', renderPromptList(onboardingLines))
      .replace(
        '{{previousTopics}}',
        renderPromptList(
          input.previousTopics && input.previousTopics.length > 0
            ? input.previousTopics
            : ['Noch keine gespeicherten Themen.'],
        ),
      )
      .replace('{{recentMemoryLines}}', renderPromptList(recentMemoryLines))
      .replace('{{followupCandidates}}', renderPromptList(bridgeContextLines))
      .replace('{{progressLines}}', renderPromptList(getProgressLines(input.progressSummary)));
    const withDeliveryRules = [...getVoiceDeliveryRules(delivery), systemPrompt]
      .filter(Boolean)
      .join('\n\n');

    return {
      systemPrompt: withDeliveryRules,
      recommendedTopicId: input.activeQuestion?.topicId ?? fallbackTopic.id,
      activeQuestionId: input.activeQuestion?.id ?? null,
    };
  }

  const recommendedTopic = selectRecommendedTopic(input.previousTopics, sensitiveAllowed);
  const followupCandidates = buildLegacyFollowupCandidates(input.recentMemories, recommendedTopic);
  const systemPrompt = getBiographyInterviewPromptTemplate()
    .replace('{{recommendedTopicLabel}}', recommendedTopic.label)
    .replace('{{recommendedTopicGoal}}', recommendedTopic.goal)
    .replace('{{recommendedTopicPromptHint}}', recommendedTopic.promptHint)
    .replace('{{activeQuestionLabel}}', recommendedTopic.id)
    .replace('{{activeQuestionIntent}}', recommendedTopic.promptHint)
    .replace('{{activeQuestionInstruction}}', 'Frage organisch und konkret statt formularhaft.')
    .replace('{{fullName}}', input.fullName || 'unbekannt')
    .replace('{{onboardingLines}}', renderPromptList(onboardingLines))
    .replace(
      '{{previousTopics}}',
      renderPromptList(
        input.previousTopics.length > 0 ? input.previousTopics : ['Noch keine gespeicherten Themen.'],
      ),
    )
    .replace('{{recentMemoryLines}}', renderPromptList(recentMemoryLines))
    .replace('{{followupCandidates}}', renderPromptList(followupCandidates))
    .replace('{{progressLines}}', renderPromptList(['Kein explizites Frage-Tracking aktiv.']));
  const withDeliveryRules = [...getVoiceDeliveryRules(delivery), systemPrompt]
    .filter(Boolean)
    .join('\n\n');

  return {
    systemPrompt: withDeliveryRules,
    recommendedTopicId: recommendedTopic.id,
    activeQuestionId: null,
  };
}
