import { z } from 'zod';

export const InterviewQuestionStateSchema = z.enum([
  'pending',
  'answered',
  'deferred',
  'skipped',
]);

export type InterviewQuestionState = z.infer<typeof InterviewQuestionStateSchema>;

export const InterviewAnswerTypeSchema = z.enum([
  'free_text',
  'single_choice',
  'multi_choice',
  'date',
  'place',
]);

export type InterviewAnswerType = z.infer<typeof InterviewAnswerTypeSchema>;

export const InterviewCompletionRuleSchema = z.enum(['sufficient_answer']);

export const InterviewConditionSchema = z.object({
  questionId: z.string().min(1),
  anyKeywords: z.array(z.string()).default([]),
  noneKeywords: z.array(z.string()).default([]),
});

export type InterviewCondition = z.infer<typeof InterviewConditionSchema>;

export const CatalogQuestionSchema = z.object({
  id: z.string().min(1),
  topicId: z.string().min(1),
  topicLabel: z.string().min(1),
  order: z.number().int().min(0),
  promptIntent: z.string().min(1),
  required: z.boolean(),
  sensitive: z.boolean().default(false),
  answerType: InterviewAnswerTypeSchema,
  completionRule: InterviewCompletionRuleSchema.default('sufficient_answer'),
  skipOnDecline: z.boolean().default(true),
  dependsOn: z.array(InterviewConditionSchema).default([]),
});

export type CatalogQuestion = z.infer<typeof CatalogQuestionSchema>;

export const InterviewQuestionProgressSchema = z.object({
  id: z.string().uuid().optional(),
  interview_session_id: z.string().uuid(),
  user_id: z.string().uuid(),
  question_id: z.string().min(1),
  topic_id: z.string().min(1),
  state: InterviewQuestionStateSchema.default('pending'),
  asked_count: z.number().int().min(0).default(0),
  asked_at: z.string().datetime().nullable().optional(),
  answered_at: z.string().datetime().nullable().optional(),
  deferred_at: z.string().datetime().nullable().optional(),
  skipped_at: z.string().datetime().nullable().optional(),
  answer_memory_id: z.string().uuid().nullable().optional(),
  prompt_snapshot: z.string().nullable().optional(),
  evaluator_summary: z.string().nullable().optional(),
  answer_excerpt: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type InterviewQuestionProgress = z.infer<typeof InterviewQuestionProgressSchema>;

export const ProgressCountsSchema = z.object({
  pending: z.number().int().min(0),
  answered: z.number().int().min(0),
  deferred: z.number().int().min(0),
  skipped: z.number().int().min(0),
  total: z.number().int().min(0),
  remainingRequired: z.number().int().min(0),
});

export type ProgressCounts = z.infer<typeof ProgressCountsSchema>;

export type ProgressSummary = {
  counts: ProgressCounts;
  activeQuestionId: string | null;
  activeQuestionLabel: string | null;
  activeTopicLabel: string | null;
  catalogVersion: string | null;
};

export type ProgressRowInsert = Omit<
  InterviewQuestionProgress,
  'id' | 'created_at' | 'updated_at'
>;

export type EvaluatedAnswer =
  | {
      outcome: 'answered';
      summary: string;
      answerExcerpt: string;
      shouldPersistMemory: boolean;
    }
  | {
      outcome: 'skipped' | 'deferred';
      summary: string;
      answerExcerpt: string;
      shouldPersistMemory: false;
    }
  | {
      outcome: 'pending_followup';
      summary: string;
      answerExcerpt: string;
      shouldPersistMemory: boolean;
    };
