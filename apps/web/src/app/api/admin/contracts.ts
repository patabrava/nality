import { z } from 'zod';

export const AdminOverviewQuerySchema = z.object({
  window: z.enum(['7d', '30d', '90d']).default('30d'),
});

export const AdminUserSearchQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: z.enum(['all', 'onboarded', 'incomplete', 'with_memories']).default('all'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const AdminUserIdSchema = z.object({
  id: z.string().uuid(),
});

export const AdminInterviewBodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    }),
  ),
});

export const AdminInterviewSessionPatchSchema = z.object({
  interviewSessionId: z.string().uuid(),
  endedAt: z.string().datetime().optional(),
  processingStatus: z.enum(['pending', 'processing', 'complete', 'failed']).default('complete'),
  summary: z.string().trim().max(4000).nullable().optional(),
});

export function getWindowStart(windowValue: z.infer<typeof AdminOverviewQuerySchema>['window']) {
  const now = new Date();
  const days = windowValue === '7d' ? 7 : windowValue === '90d' ? 90 : 30;
  const start = new Date(now);
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}
