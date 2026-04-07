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
  const session: {
    id: string;
    user_id: string;
    topics_covered: string[];
    memory_count: number;
    processing_status: string;
    catalog_version: string;
    active_question_id: string | null;
    ended_at: string | null;
    updated_at: string;
  } = {
    id: '11111111-1111-1111-1111-111111111111',
    user_id: '00000000-0000-0000-0000-000000000001',
    topics_covered: [],
    memory_count: 0,
    processing_status: 'processing',
    catalog_version: '2026-03-14-v1',
    active_question_id: null,
    ended_at: null,
    updated_at: '2026-03-15T10:00:00.000Z',
  };
  const sessions: typeof session[] = [session];

  return {
    progressRows,
    session,
    sessions,
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
              if (column === 'id') {
                if (value !== session.id) {
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
              }

              return {
                order(orderColumn: string, options?: { ascending?: boolean }) {
                  if (column !== 'user_id' || value !== session.user_id) {
                    throw new Error(`Unexpected interview_sessions.select eq ${column}=${value}`);
                  }

                  if (orderColumn !== 'updated_at' || options?.ascending !== false) {
                    throw new Error(`Unexpected interview_sessions.select order ${orderColumn}`);
                  }

                  return {
                    limit: async (count: number) => ({
                      data: sessions
                        .filter((candidate) => candidate.user_id === value)
                        .sort((left, right) => (left.updated_at < right.updated_at ? 1 : -1))
                        .slice(0, count),
                      error: null,
                    }),
                  };
                },
                is(innerColumn: string, innerValue: null) {
                  if (column !== 'user_id' || value !== session.user_id) {
                    throw new Error(`Unexpected interview_sessions.select eq ${column}=${value}`);
                  }

                  return {
                    in(statusColumn: string, statuses: string[]) {
                      if (innerColumn !== 'ended_at' || innerValue !== null) {
                        throw new Error(`Unexpected interview_sessions.select is ${innerColumn}=${innerValue}`);
                      }

                      if (statusColumn !== 'processing_status') {
                        throw new Error(`Unexpected interview_sessions.select in ${statusColumn}`);
                      }

                      return {
                        order(orderColumn: string, options?: { ascending?: boolean }) {
                          if (orderColumn !== 'updated_at' || options?.ascending !== false) {
                            throw new Error(`Unexpected interview_sessions.select order ${orderColumn}`);
                          }

                          return {
                            limit: async (count: number) => ({
                              data: sessions
                                .filter(
                                  (candidate) =>
                                    candidate.user_id === value &&
                                    candidate.ended_at === null &&
                                    statuses.includes(candidate.processing_status),
                                )
                                .sort((left, right) => (left.updated_at < right.updated_at ? 1 : -1))
                                .slice(0, count),
                              error: null,
                            }),
                          };
                        },
                      };
                    },
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
              if (column !== 'interview_session_id') {
                throw new Error(`Unexpected progress.select eq ${column}=${value}`);
              }

              return {
                eq(innerColumn: string, innerValue: string) {
                  if (innerColumn !== 'user_id' || innerValue !== session.user_id) {
                    throw new Error(`Unexpected progress.select eq ${innerColumn}=${innerValue}`);
                  }

                  return {
                    order: async () => ({
                      data: progressRows.filter((row) => row.interview_session_id === value),
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

  it('returns the latest session that still has unanswered required questions when active=true', async () => {
    const supabase = createSupabaseMock();
    const olderActiveSession = {
      ...supabase.session,
      id: '22222222-2222-2222-2222-222222222222',
      updated_at: '2026-03-14T08:00:00.000Z',
      active_question_id: 'basis.birth',
    };
    const incorrectlyCompletedSession = {
      ...supabase.session,
      id: '33333333-3333-3333-3333-333333333333',
      updated_at: '2026-03-17T08:00:00.000Z',
      processing_status: 'complete',
      ended_at: '2026-03-17T08:10:00.000Z',
      active_question_id: 'basis.home',
    };
    const completedSession = {
      ...supabase.session,
      id: '44444444-4444-4444-4444-444444444444',
      updated_at: '2026-03-18T08:00:00.000Z',
      processing_status: 'complete',
      ended_at: '2026-03-18T08:10:00.000Z',
    };

    supabase.sessions.splice(
      0,
      supabase.sessions.length,
      olderActiveSession,
      incorrectlyCompletedSession,
      completedSession,
    );
    supabase.progressRows.push(
      ...biographyInterviewCatalog.map((question) => ({
        interview_session_id: incorrectlyCompletedSession.id,
        user_id: incorrectlyCompletedSession.user_id,
        question_id: question.id,
        topic_id: question.topicId,
        state: question.id === 'basis.birth' ? 'answered' : 'pending',
        asked_count: question.id === 'basis.home' ? 1 : 0,
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
      new Request('http://test.local/api/interview-sessions?active=true'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.session.id).toBe(incorrectlyCompletedSession.id);
    expect(body.data.progressSummary.activeQuestionId).toBe('basis.home');
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
