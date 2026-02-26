export const ALT_ONBOARDING_VERSION = 'alt-onboarding-v1';

export type AltPath = 'A' | 'B' | 'C';
export type AltStage = 'entry' | 'path' | 'neutral' | 'registration' | 'completed';
export type AddressPreference = 'du' | 'sie';

export type EntryAnswerId =
  | 'entry_1'
  | 'entry_2'
  | 'entry_3'
  | 'entry_4'
  | 'entry_5';

export interface AltOption {
  id: string;
  label: string;
  description?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface AltDemographicField {
  id: string;
  label: string;
  multiple?: boolean;
  options: AltOption[];
}

export type AltStepKind = 'single' | 'multi' | 'decision' | 'demographics' | 'info';

export interface AltStep {
  id: string;
  path: AltPath;
  kind: AltStepKind;
  title: string;
  text: string;
  options?: ReadonlyArray<AltOption>;
  fields?: ReadonlyArray<AltDemographicField>;
}

export type AltDemographicAnswer = Record<string, string | string[]>;
export type AltAnswerValue = string | string[] | AltDemographicAnswer;

export interface AltRegistrationDraft {
  firstNameOrNickname: string;
  lastName: string;
  email: string;
  method: 'password' | 'google';
}

export interface PasswordRegistrationSubmission extends AltRegistrationDraft {
  method: 'password';
  password: string;
}

export interface AltOnboardingDraft {
  version: typeof ALT_ONBOARDING_VERSION;
  stage: AltStage;
  entry: { answerId: EntryAnswerId; path: AltPath } | null;
  path: AltPath | null;
  currentStepId: string | null;
  responses: Record<string, AltAnswerValue>;
  neutralBlockVisited: boolean;
  routeToRegistrationSource: 'path' | 'neutral' | null;
  registration: AltRegistrationDraft | null;
  addressPreference: AddressPreference | null;
  pendingFinalize: boolean;
  pendingLinkToken: string | null;
  awaitingAddressPreferenceAfterOAuth: boolean;
  completedAt: string | null;
}

export const ENTRY_QUESTION =
  'Wie teilst du deine Gedanken und Erlebnisse am liebsten mit anderen?';

export const ENTRY_OPTIONS: ReadonlyArray<AltOption & { answerId: EntryAnswerId }> = [
  {
    answerId: 'entry_1',
    id: 'entry_1',
    label: 'Ich erzähle einfach drauflos',
    description: 'Schneller Einstieg mit klaren Schritten.',
  },
  {
    answerId: 'entry_2',
    id: 'entry_2',
    label: 'Ich brauche Leitfragen',
    description: 'Geführter Einstieg mit mehr Orientierung.',
  },
  {
    answerId: 'entry_3',
    id: 'entry_3',
    label: 'Ich bin noch unsicher',
    description: 'Behutsam starten und Tempo selbst festlegen.',
  },
  {
    answerId: 'entry_4',
    id: 'entry_4',
    label: 'Ich möchte es strukturiert',
    description: 'Klare Anleitung in kleinen Schritten.',
  },
  {
    answerId: 'entry_5',
    id: 'entry_5',
    label: 'Für eine andere Person',
    description: 'Einrichtung für einen dritten Menschen.',
  },
];

export const ENTRY_ROUTING: Record<EntryAnswerId, AltPath> = {
  entry_1: 'A',
  entry_2: 'B',
  entry_3: 'B',
  entry_4: 'B',
  entry_5: 'C',
};

const DEMOGRAPHIC_FIELDS_STANDARD: ReadonlyArray<AltDemographicField> = [
  {
    id: 'ageRange',
    label: 'Welche Altersgruppe trifft am ehesten zu?',
    options: [
      { id: '18_29', label: '18-29' },
      { id: '30_39', label: '30-39' },
      { id: '40_49', label: '40-49' },
      { id: '50_64', label: '50-64' },
      { id: '65_plus', label: '65+' },
      { id: 'prefer_not_say', label: 'Keine Angabe' },
    ],
  },
  {
    id: 'addressingContext',
    label: 'Wie mögen wir Fragen für dich formulieren?',
    options: [
      { id: 'very_gentle', label: 'Sehr behutsam' },
      { id: 'balanced', label: 'Ausgewogen' },
      { id: 'direct', label: 'Direkt und klar' },
    ],
  },
  {
    id: 'languagePreference',
    label: 'In welcher Sprache möchtest du vorwiegend schreiben?',
    options: [
      { id: 'de', label: 'Deutsch' },
      { id: 'en', label: 'Englisch' },
      { id: 'mixed', label: 'Gemischt' },
    ],
  },
];

const DEMOGRAPHIC_FIELDS_THIRD_PERSON: ReadonlyArray<AltDemographicField> = [
  {
    id: 'relationshipToPerson',
    label: 'In welcher Beziehung stehen Sie zur Person?',
    options: [
      { id: 'family', label: 'Familie' },
      { id: 'friend', label: 'Freundin/Freund' },
      { id: 'caregiver', label: 'Pflege/Betreuung' },
      { id: 'other', label: 'Andere' },
    ],
  },
  {
    id: 'thirdPersonAgeRange',
    label: 'Welche Altersgruppe trifft auf die Person zu?',
    options: [
      { id: 'under_40', label: 'Unter 40' },
      { id: '40_64', label: '40-64' },
      { id: '65_79', label: '65-79' },
      { id: '80_plus', label: '80+' },
      { id: 'unknown', label: 'Unbekannt' },
    ],
  },
  {
    id: 'thirdPersonLanguagePreference',
    label: 'Welche Sprache passt für die Fragen am besten?',
    options: [
      { id: 'de', label: 'Deutsch' },
      { id: 'en', label: 'Englisch' },
      { id: 'both', label: 'Beides' },
    ],
  },
];

export const PATH_STEPS: Record<AltPath, ReadonlyArray<AltStep>> = {
  A: [
    {
      id: 'A1',
      path: 'A',
      kind: 'multi',
      title: 'Step A1',
      text: 'Worüber würdest du als Erstes gern erzählen – eher über dein Leben allgemein, bestimmte Erlebnisse oder Menschen, die dir wichtig sind?',
      options: [
        { id: 'general_life', label: 'Mein Leben allgemein' },
        { id: 'specific_experiences', label: 'Bestimmte Erlebnisse' },
        { id: 'important_people', label: 'Wichtige Menschen' },
      ],
    },
    {
      id: 'A2',
      path: 'A',
      kind: 'single',
      title: 'Step A2',
      text: 'Für wen möchtest du das vor allem festhalten?',
      options: [
        { id: 'for_myself', label: 'Für mich selbst' },
        { id: 'for_family', label: 'Für Familie' },
        { id: 'for_children', label: 'Für Kinder/Enkel' },
        { id: 'for_public_archive', label: 'Für ein offenes Vermächtnis' },
      ],
    },
    {
      id: 'A3',
      path: 'A',
      kind: 'demographics',
      title: 'Step A3',
      text: 'Wir möchten dir möglichst passende Fragen stellen. Bitte ordne dich deshalb im Folgenden zu:',
      fields: DEMOGRAPHIC_FIELDS_STANDARD,
    },
    {
      id: 'A4',
      path: 'A',
      kind: 'decision',
      title: 'Step A4',
      text: 'Alles klar, möchtest du jetzt direkt mit deiner ersten Erzählung starten?',
      options: [
        { id: 'start_storytelling', label: 'Ja, zuerst Storytelling starten' },
        { id: 'go_registration', label: 'Nein, direkt Registrierung' },
      ],
    },
  ],
  B: [
    {
      id: 'B1',
      path: 'B',
      kind: 'single',
      title: 'Step B1',
      text: 'Wie möchtest du deine Erlebnisse, Erfahrungen, Gedanken am liebsten festhalten?',
      options: [
        { id: 'guided_questions', label: 'Mit geführten Fragen' },
        { id: 'free_talk', label: 'Erst frei erzählen, dann strukturieren' },
        {
          id: 'book_call',
          label: 'Mit professioneller Begleitung',
          description: 'Du kannst direkt einen Termin buchen.',
          ctaLabel: 'Termin buchen',
          ctaUrl: 'https://calendar.app.google/hTLQhe9koce2qVXp9',
        },
      ],
    },
    {
      id: 'B2',
      path: 'B',
      kind: 'single',
      title: 'Step B2',
      text: 'Wie persönlich dürfen die Fragen für dich am Anfang sein?',
      options: [
        { id: 'light', label: 'Eher leicht und vorsichtig' },
        { id: 'medium', label: 'Ausgewogen' },
        { id: 'deep', label: 'Ich bin offen für tiefere Fragen' },
      ],
    },
    {
      id: 'B3',
      path: 'B',
      kind: 'multi',
      title: 'Step B3',
      text: 'Was ist dir bei Nality am wichtigsten?',
      options: [
        { id: 'clarity', label: 'Klare Struktur' },
        { id: 'privacy', label: 'Datenschutz' },
        { id: 'pace', label: 'Eigenes Tempo' },
        { id: 'family_legacy', label: 'Etwas für Familie hinterlassen' },
      ],
    },
    {
      id: 'B4',
      path: 'B',
      kind: 'decision',
      title: 'Step B4',
      text: 'Damit wir dir passende Fragen in deinem Tempo anbieten können, richten wir dir jetzt deinen persönlichen Bereich ein. Du bestimmst jederzeit, was du teilen möchtest.',
      options: [
        { id: 'continue_guided', label: 'Weiter zur Zuordnung' },
        { id: 'jump_to_neutral', label: 'Vorher neutral Storytelling ansehen' },
      ],
    },
    {
      id: 'B5',
      path: 'B',
      kind: 'demographics',
      title: 'Step B5',
      text: 'Im ersten Schritt hast du die Möglichkeit dich zuzuordnen. Das hilft uns, dir möglichst passende Fragen zu stellen.',
      fields: DEMOGRAPHIC_FIELDS_STANDARD,
    },
  ],
  C: [
    {
      id: 'C1',
      path: 'C',
      kind: 'info',
      title: 'Step C1',
      text: 'Super, dann richten wir in weniger als 1 Minute einen persönlichen Erinnerungsraum ein.',
    },
    {
      id: 'C2',
      path: 'C',
      kind: 'demographics',
      title: 'Step C2',
      text: 'Um den persönlichen Erinnerungsraum bestmöglich nutzen zu können, teilen Sie uns bitte mit:',
      fields: DEMOGRAPHIC_FIELDS_THIRD_PERSON,
    },
  ],
};

export function getPathFromEntryAnswer(answerId: EntryAnswerId): AltPath {
  return ENTRY_ROUTING[answerId];
}

export function getPathLabel(path: AltPath): string {
  if (path === 'A') return 'Pfad A - Extrovertiert';
  if (path === 'B') return 'Pfad B - Geführter Einstieg';
  return 'Pfad C - Für Dritte';
}

export function getStepById(path: AltPath, stepId: string): AltStep | null {
  const step = PATH_STEPS[path].find((candidate) => candidate.id === stepId);
  return step ?? null;
}

export function getFirstStep(path: AltPath): AltStep {
  const first = PATH_STEPS[path][0];
  if (!first) {
    throw new Error(`Missing first step for path ${path}`);
  }
  return first;
}

export function getStepIndex(path: AltPath, stepId: string): number {
  return PATH_STEPS[path].findIndex((step) => step.id === stepId);
}

export function getNextStep(path: AltPath, stepId: string): AltStep | null {
  const index = getStepIndex(path, stepId);
  if (index < 0) return null;
  const next = PATH_STEPS[path][index + 1];
  return next ?? null;
}

export function getPreviousStep(path: AltPath, stepId: string): AltStep | null {
  const index = getStepIndex(path, stepId);
  if (index <= 0) return null;
  const previous = PATH_STEPS[path][index - 1];
  return previous ?? null;
}

export function getRegistrationAnchorStepId(path: AltPath): string {
  if (path === 'A') return 'A4';
  if (path === 'B') return 'B5';
  return 'C2';
}

export function createEmptyAltOnboardingDraft(): AltOnboardingDraft {
  return {
    version: ALT_ONBOARDING_VERSION,
    stage: 'entry',
    entry: null,
    path: null,
    currentStepId: null,
    responses: {},
    neutralBlockVisited: false,
    routeToRegistrationSource: null,
    registration: null,
    addressPreference: null,
    pendingFinalize: false,
    pendingLinkToken: null,
    awaitingAddressPreferenceAfterOAuth: false,
    completedAt: null,
  };
}
