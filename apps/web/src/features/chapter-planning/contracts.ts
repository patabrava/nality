import { z } from 'zod';

export const ChapterPlanningGroupSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summarySeed: z.string().min(1),
  arc: z.enum(['origins', 'middle', 'reflection']),
  topics: z.array(z.string()).min(1),
});

export const CHAPTER_PLANNING_GROUPS = [
  {
    id: 'roots',
    title: 'Wo alles begann',
    summarySeed: 'Herkunft, Familie und die ersten Koordinaten des Lebens.',
    arc: 'origins',
    topics: ['basis_information', 'family_background'],
  },
  {
    id: 'growing_up',
    title: 'Zwischen Kindheit und Aufbruch',
    summarySeed: 'Kindheit, Jugend und die ersten prägenden Erfahrungen.',
    arc: 'origins',
    topics: ['childhood_and_youth'],
  },
  {
    id: 'finding_a_path',
    title: 'Eigene Wege finden',
    summarySeed: 'Lernen, Arbeit und die Suche nach einer eigenen Richtung.',
    arc: 'middle',
    topics: ['education_and_career', 'interests_and_passions'],
  },
  {
    id: 'bonds_and_turning_points',
    title: 'Menschen, Werte und Wendepunkte',
    summarySeed: 'Beziehungen, Haltungen und Momente, die den inneren Kurs geprägt haben.',
    arc: 'middle',
    topics: [
      'relationships_and_social_environment',
      'personal_development_and_values',
      'emotional_and_narrative_dimension',
    ],
  },
  {
    id: 'outlook_and_legacy',
    title: 'Was bleibt und was trägt',
    summarySeed: 'Blick nach vorn, Lebensphilosophie und die Frage, was weitergegeben werden soll.',
    arc: 'reflection',
    topics: [
      'life_philosophy_and_future',
      'autobiography_motivation',
      'basis_profile_and_storytelling_voice',
    ],
  },
] as const satisfies ReadonlyArray<z.infer<typeof ChapterPlanningGroupSchema>>;

export type ChapterPlanningGroup = (typeof CHAPTER_PLANNING_GROUPS)[number];

export const PlanningMemorySchema = z.object({
  id: z.string().uuid(),
  raw_transcript: z.string(),
  cleaned_content: z.string().nullable(),
  captured_at: z.string().nullable(),
  interview_topic: z.string().nullable(),
  interview_question: z.string().nullable(),
  topics: z.array(z.string()).nullable().optional(),
  chapter_id: z.string().uuid().nullable().optional(),
  processing_status: z.string().nullable().optional(),
});

export type PlanningMemory = z.infer<typeof PlanningMemorySchema>;

export const PlanningProgressRowSchema = z.object({
  question_id: z.string().min(1),
  topic_id: z.string().min(1),
  state: z.enum(['pending', 'answered', 'deferred', 'skipped']),
  answer_excerpt: z.string().nullable().optional(),
  answered_at: z.string().nullable().optional(),
  answer_memory_id: z.string().uuid().nullable().optional(),
});

export type PlanningProgressRow = z.infer<typeof PlanningProgressRowSchema>;

export const NarrativeReadinessSchema = z.object({
  ready: z.boolean(),
  coverageScore: z.number().min(0).max(1),
  corpusQualityScore: z.number().min(0).max(1),
  chronologyScore: z.number().min(0).max(1),
  thematicSpread: z.number().int().min(0),
  usableMemoryCount: z.number().int().min(0),
  answeredQuestionCount: z.number().int().min(0),
  gaps: z.array(z.string()),
  strengths: z.array(z.string()),
});

export type NarrativeReadiness = z.infer<typeof NarrativeReadinessSchema>;

export const DraftChapterCandidateSchema = z.object({
  candidateKey: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  timeRangeStart: z.string().nullable(),
  timeRangeEnd: z.string().nullable(),
  themeKeywords: z.array(z.string()).min(1),
  supportingMemoryIds: z.array(z.string().uuid()).min(1),
  supportingQuestionIds: z.array(z.string()).default([]),
  evidenceSummary: z.string().min(1),
  suggestedDisplayOrder: z.number().int().min(0),
});

export type DraftChapterCandidate = z.infer<typeof DraftChapterCandidateSchema>;

export const ChapterPlanningBasisSchema = z.object({
  candidateKey: z.string().min(1),
  readiness: NarrativeReadinessSchema,
  supportingMemoryIds: z.array(z.string().uuid()).default([]),
  supportingQuestionIds: z.array(z.string()).default([]),
  evidenceSummary: z.string().min(1),
}).passthrough();

export type ChapterPlanningBasis = z.infer<typeof ChapterPlanningBasisSchema>;

export const ChapterPlanningResponseSchema = z.object({
  ready: z.boolean(),
  readiness: NarrativeReadinessSchema,
  chapters: z.array(DraftChapterCandidateSchema),
});

export type ChapterPlanningResponse = z.infer<typeof ChapterPlanningResponseSchema>;
