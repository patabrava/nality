import { beforeEach, describe, expect, it, vi } from 'vitest';
import { biographyInterviewCatalog } from '@/features/biography-interview/catalog';

const createServiceClientMock = vi.fn();
const getAuthenticatedRequestContextMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: createServiceClientMock,
}));

vi.mock('@/lib/server/auth', () => ({
  getAuthenticatedRequestContext: getAuthenticatedRequestContextMock,
  authenticationRequiredResponse: (request?: Request) =>
    Response.json(
      {
        status: 401,
        code: 'AUTH_REQUIRED',
        message: 'Authentication required',
        correlationId: request?.headers.get('x-correlation-id') ?? 'test-correlation',
      },
      { status: 401 },
    ),
}));

vi.mock('@/lib/server/logger', () => ({
  createRouteLogger: () => ({
    correlationId: 'test-correlation',
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

function createSupabaseMock() {
  const progressRows: Array<Record<string, unknown>> = [];
  const session = {
    id: '11111111-1111-1111-1111-111111111111',
    user_id: '00000000-0000-0000-0000-000000000001',
    topics_covered: [],
    memory_count: 0,
    processing_status: 'processing',
    catalog_version: '2026-03-14-v1',
    active_question_id: null,
  };

  return {
    progressRows,
    session,
    from(table: string) {
      if (table === 'interview_sessions') {
        return {
          insert(payload: Record<string, unknown>) {
            Object.assign(session, payload);
            return {
              select: () => ({
                single: async () => ({ data: session, error: null }),
              }),
            };
          },
          select: () => ({
            eq(column: string, value: string) {
              if (column !== 'id' || value !== session.id) {
                throw new Error(`Unexpected interview_sessions.select eq ${column}=${value}`);
              }

              return {
                eq(innerColumn: string, innerValue: string) {
                  if (innerColumn !== 'user_id' || innerValue !== session.user_id) {
                    throw new Error(`Unexpected interview_sessions.select eq ${innerColumn}=${innerValue}`);
                  }

                  return {
                    maybeSingle: async () => ({ data: session, error: null }),
                  };
                },
              };
            },
          }),
          update(payload: Record<string, unknown>) {
            return {
              eq(column: string, value: string) {
                if (column !== 'id' || value !== session.id) {
                  throw new Error(`Unexpected interview_sessions.update eq ${column}=${value}`);
                }

                return {
                  eq(innerColumn: string, innerValue: string) {
                    if (innerColumn !== 'user_id' || innerValue !== session.user_id) {
                      throw new Error(`Unexpected interview_sessions.update eq ${innerColumn}=${innerValue}`);
                    }

                    Object.assign(session, payload);
                    return Promise.resolve({
                      data: session,
                      error: null,
                    });
                  },
                };
              },
            };
          },
        };
      }

      if (table === 'interview_question_progress') {
        return {
          insert(rows: Array<Record<string, unknown>>) {
            progressRows.push(...rows);
            return Promise.resolve({ error: null });
          },
          select: () => ({
            eq(column: string, value: string) {
              if (column !== 'interview_session_id' || value !== session.id) {
                throw new Error(`Unexpected progress.select eq ${column}=${value}`);
              }

              return {
                eq(innerColumn: string, innerValue: string) {
                  if (innerColumn !== 'user_id' || innerValue !== session.user_id) {
                    throw new Error(`Unexpected progress.select eq ${innerColumn}=${innerValue}`);
                  }

                  return {
                    order: async () => ({
                      data: progressRows,
                      error: null,
                    }),
                  };
                },
              };
            },
          }),
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
  };
}

describe('Interview Sessions API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    getAuthenticatedRequestContextMock.mockResolvedValue({
      user: { id: '00000000-0000-0000-0000-000000000001' },
      accessToken: null,
      authSource: 'cookie',
    });
  });

  it('creates a session, seeds question progress, and returns a summary envelope', async () => {
    const supabase = createSupabaseMock();
    createServiceClientMock.mockResolvedValue({ from: supabase.from });

    const { POST } = await import('@/app/api/interview-sessions/route');
    const response = await POST(
      new Request('http://test.local/api/interview-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topics_covered: [],
          memory_count: 0,
          processing_status: 'processing',
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.status).toBe(201);
    expect(body.data.id).toBe(supabase.session.id);
    expect(body.data.progressSummary.counts.pending).toBe(biographyInterviewCatalog.length);
    expect(supabase.progressRows).toHaveLength(biographyInterviewCatalog.length);
  });

  it('returns progress summary for a single session lookup', async () => {
    const supabase = createSupabaseMock();
    supabase.progressRows.push(
      ...biographyInterviewCatalog.map((question, index) => ({
        interview_session_id: supabase.session.id,
        user_id: supabase.session.user_id,
        question_id: question.id,
        topic_id: question.topicId,
        state: index === 0 ? 'answered' : 'pending',
        asked_count: 0,
        asked_at: null,
        answered_at: null,
        deferred_at: null,
        skipped_at: null,
        answer_memory_id: null,
        prompt_snapshot: null,
        evaluator_summary: null,
        answer_excerpt: null,
      })),
    );
    createServiceClientMock.mockResolvedValue({ from: supabase.from });

    const { GET } = await import('@/app/api/interview-sessions/route');
    const response = await GET(
      new Request(`http://test.local/api/interview-sessions?sessionId=${supabase.session.id}`),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.session.id).toBe(supabase.session.id);
    expect(body.data.progressSummary.counts.answered).toBe(1);
    expect(body.data.progressSummary.counts.pending).toBe(biographyInterviewCatalog.length - 1);
  });

  it('rejects PATCH requests without sessionId', async () => {
    const { PATCH } = await import('@/app/api/interview-sessions/route');
    const response = await PATCH(
      new Request('http://test.local/api/interview-sessions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          processing_status: 'complete',
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.code).toBe('SESSION_ID_REQUIRED');
  });
});
