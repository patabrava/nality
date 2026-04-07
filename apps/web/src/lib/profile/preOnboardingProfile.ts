export type PreOnboardingAnswerValue = {
  selected?: string[];
  birth_decade?: string;
  gender_identity?: string;
  answered_at?: string;
};

export type PreOnboardingAnswersMap = Record<string, PreOnboardingAnswerValue>;

export type PreOnboardingDraftEntry =
  | { questionId: string; type: 'single'; selectedOptionId: string }
  | { questionId: string; type: 'composite'; birthDecade: string; genderIdentity: string };

export const PROFILE_PREONBOARDING_QUESTION_IDS = [
  'Q1',
  'Q2',
  'Q3',
  'Q4',
  'Q5',
  'Q7',
  'Q8',
  'Q9',
  'Q10',
  'Q11',
  'Q13',
] as const;

const COMPOSITE_QUESTION_IDS = new Set<string>(['Q4', 'Q11', 'Q13']);

export const PREONBOARDING_SINGLE_CHOICE_OPTIONS: Record<string, Array<{ id: string; label: string }>> = {
  Q1: [
    { id: 'Q1_O1', label: 'Ich rede gern frei drauflos und komme ins Erzählen, sobald ich anfange.' },
    { id: 'Q1_O2', label: 'Ich erzähle gern, brauche aber ein paar gezielte Fragen, um rein zu kommen.' },
    { id: 'Q1_O3', label: 'Ich bin eher zurückhaltend und teile nur, was ich mir vorher gut überlegt habe.' },
    { id: 'Q1_O4', label: 'Ich bin mir nicht sicher – ich möchte es einfach ausprobieren.' },
    { id: 'Q1_O5', label: 'Es geht nicht um mich. Ich möchte jemandem ermöglichen, Erinnerungen festzuhalten.' },
  ],
  Q2: [
    { id: 'Q2_O1', label: 'Leben im Allgemeinen' },
    { id: 'Q2_O2', label: 'Bestimmte Erlebnisse' },
    { id: 'Q2_O3', label: 'Wichtige Menschen' },
    { id: 'Q2_O4', label: 'Ich weiß noch nicht genau' },
  ],
  Q3: [
    { id: 'Q3_O1', label: 'Für mich selbst' },
    { id: 'Q3_O2', label: 'Für meine Partnerin / Partner' },
    { id: 'Q3_O3', label: 'Für meine Kinder' },
    { id: 'Q3_O4', label: 'Für meine Enkel' },
    { id: 'Q3_O5', label: 'Für meine Familie insgesamt' },
    { id: 'Q3_O6', label: 'Für jemand ganz Bestimmten' },
    { id: 'Q3_O7', label: 'Ich weiß es noch nicht' },
  ],
  Q5: [
    { id: 'Q5_O1', label: 'Ja, gleich loslegen.' },
    { id: 'Q5_O2', label: 'Ja, aber mit kurzen Fragen als Einstieg.' },
    { id: 'Q5_O3', label: 'Lieber später.' },
  ],
  Q7: [
    { id: 'Q7_O1', label: 'In Ruhe schreiben, am liebsten kurze Texte oder Stichworte' },
    { id: 'Q7_O2', label: 'Ich schreibe gerne, auch längere Texte und lasse Gedanken freien Lauf.' },
    { id: 'Q7_O3', label: 'In meinem eigenen Tempo sprechen – mit klaren Fragen.' },
    { id: 'Q7_O4', label: 'Mit sehr kurzen, konkreten Fragen, Schritt für Schritt.' },
    { id: 'Q7_O5', label: 'Ich unterhalte mich am liebsten mit einer anderen Person.' },
    { id: 'Q7_O6', label: 'Ich möchte erstmal nur schauen und später entscheiden.' },
  ],
  Q8: [
    { id: 'Q8_O1', label: 'Eher allgemein (z.B. Hobbys, Interessen, Alltag).' },
    { id: 'Q8_O2', label: 'Ein paar persönlichere Themen sind für mich in Ordnung.' },
    { id: 'Q8_O3', label: 'Ich bin bereit, auch sehr Persönliches zu teilen.' },
    { id: 'Q8_O4', label: 'Ich möchte selbst entscheiden, was ich thematisiere.' },
    { id: 'Q8_O5', label: 'Ich weiß es nicht und möchte mich später entscheiden.' },
  ],
  Q9: [
    { id: 'Q9_O1', label: 'Meine Erinnerungen für mich selbst sortieren.' },
    { id: 'Q9_O2', label: 'Etwas für Familie / kommende Generationen festhalten.' },
    { id: 'Q9_O3', label: 'Mein Gedächtnis und meine geistige Fitness trainieren.' },
    { id: 'Q9_O4', label: 'Erstmal ausprobieren, was zu mir passt.' },
  ],
  Q10: [
    { id: 'Q10_O1', label: 'Ja, jetzt meinen persönlichen Bereich einrichten.' },
    { id: 'Q10_O2', label: 'Lieber später.' },
  ],
};

export const PREONBOARDING_COMPOSITE_OPTIONS = {
  decade: [
    { id: 'Q4_decade_1920', label: '1920er' },
    { id: 'Q4_decade_1930', label: '1930er' },
    { id: 'Q4_decade_1940', label: '1940er' },
    { id: 'Q4_decade_1950', label: '1950er' },
    { id: 'Q4_decade_1960', label: '1960er' },
    { id: 'Q4_decade_1970', label: '1970er' },
    { id: 'Q4_decade_1980', label: '1980er' },
    { id: 'Q4_decade_1990', label: '1990er' },
    { id: 'Q4_decade_2000', label: '2000er' },
    { id: 'Q4_decade_2010', label: '2010er' },
    { id: 'Q4_decade_2020', label: '2020er' },
    { id: 'Q4_decade_none', label: 'keine Angabe' },
  ],
  gender: [
    { id: 'Q4_gender_female', label: 'Frau' },
    { id: 'Q4_gender_male', label: 'Mann' },
    { id: 'Q4_gender_diverse', label: 'divers' },
    { id: 'Q4_gender_none', label: 'keine Angabe' },
  ],
} as const;

export const PREONBOARDING_QUESTION_TITLES: Record<string, string> = {
  Q1: 'Wie teilst du Gedanken und Erlebnisse am liebsten mit anderen?',
  Q2: 'Worüber würdest du als Erstes gern erzählen?',
  Q3: 'Für wen möchtest du das vor allem festhalten?',
  Q4: 'Bitte ordne dich zu (Geburtsdekade / Geschlechtsidentität).',
  Q5: 'Möchtest du jetzt direkt mit deiner ersten Erzählung starten?',
  Q7: 'Wie möchtest du Erlebnisse und Gedanken am liebsten festhalten?',
  Q8: 'Wie persönlich dürfen die Fragen am Anfang sein?',
  Q9: 'Was ist dir bei Nality am wichtigsten?',
  Q10: 'Persönlichen Bereich jetzt einrichten?',
  Q11: 'Bitte ordne dich zu (Geburtsdekade / Geschlechtsidentität).',
  Q13: 'Bitte ordne dich zu (Geburtsdekade / Geschlechtsidentität).',
};

export function buildProfilePreOnboardingDraft(answers: PreOnboardingAnswersMap): PreOnboardingDraftEntry[] {
  const result: PreOnboardingDraftEntry[] = [];

  for (const questionId of PROFILE_PREONBOARDING_QUESTION_IDS) {
    const value = answers[questionId];
    if (!value) continue;

    if (COMPOSITE_QUESTION_IDS.has(questionId)) {
      if (value.birth_decade && value.gender_identity) {
        result.push({
          questionId,
          type: 'composite',
          birthDecade: value.birth_decade,
          genderIdentity: value.gender_identity,
        });
      }
      continue;
    }

    const selectedOptionId = value.selected?.[0];
    if (selectedOptionId) {
      result.push({ questionId, type: 'single', selectedOptionId });
    }
  }

  return result;
}

export function applyDraftToAnswers(
  baseAnswers: PreOnboardingAnswersMap,
  draft: PreOnboardingDraftEntry[],
  nowIso = new Date().toISOString(),
): PreOnboardingAnswersMap {
  const nextAnswers: PreOnboardingAnswersMap = { ...baseAnswers };

  for (const entry of draft) {
    if (entry.type === 'single') {
      nextAnswers[entry.questionId] = {
        selected: [entry.selectedOptionId],
        answered_at: nowIso,
      };
      continue;
    }

    nextAnswers[entry.questionId] = {
      birth_decade: entry.birthDecade,
      gender_identity: entry.genderIdentity,
      answered_at: nowIso,
    };
  }

  return nextAnswers;
}
