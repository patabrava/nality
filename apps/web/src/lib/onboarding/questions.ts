export type OnboardingSectionId =
  | 'identity'
  | 'origins'
  | 'family'
  | 'education'
  | 'career'
  | 'influences'
  | 'values';

export interface OnboardingSection {
  id: OnboardingSectionId;
  label: string;
  questions: number;
}

// Seven core onboarding questions defined in onboarding.txt
export const ONBOARDING_SECTIONS: OnboardingSection[] = [
  { id: 'identity', label: 'Identität & Stimme', questions: 1 },
  { id: 'origins', label: 'Anfänge & Herkunft', questions: 1 },
  { id: 'family', label: 'Familienbild', questions: 1 },
  { id: 'education', label: 'Bildungsweg', questions: 1 },
  { id: 'career', label: 'Beruf & Berufung', questions: 1 },
  { id: 'influences', label: 'Prägende Stimmen', questions: 1 },
  { id: 'values', label: 'Werte & Motto', questions: 1 },
];

export const TOTAL_ONBOARDING_QUESTIONS = ONBOARDING_SECTIONS.reduce(
  (sum, section) => sum + section.questions,
  0
);

// Regex matchers that help us detect which canonical question the assistant is asking
export const QUESTION_MATCHERS: Record<OnboardingSectionId, RegExp[]> = {
  identity: [
    /bevor wir beginnen/i,
    /wie (?:möchtest du|möchten sie) angesprochen/i,
    /welcher stil passt zu (?:dir|ihnen)/i,
  ],
  origins: [
    /jede geschichte hat einen anfang/i,
    /wann und wo beginnt (?:deine|ihre)/i,
    /geburts(?:jahr|ort)/i,
  ],
  family: [
    /wer gehört zu (?:deiner|ihrer) ursprünglichen familie/i,
    /geschwister/i,
    /eigene kinder/i,
  ],
  education: [
    /bildung prägt uns/i,
    /erzäh(?:l|len) .* bildungsweg/i,
    /schulen?, studium, abschlüsse/i,
    /lehrer oder moment/i,
  ],
  career: [
    /was hast du beruflich aufgebaut/i,
    /was haben sie beruflich aufgebaut/i,
    /aktuelle rolle/i,
    /frühere stationen/i,
  ],
  influences: [
    /wessen stimmen tragen in (?:dir|ihnen) weiter/i,
    /welche autoren/i,
    /denker oder menschen/i,
  ],
  values: [
    /zum abschluss/i,
    /welche werte/i,
    /motto/i,
  ],
};
