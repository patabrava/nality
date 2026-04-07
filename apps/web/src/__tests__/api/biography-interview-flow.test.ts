import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BIOGRAPHY_INTERVIEW_START_TOKEN, shouldPersistInterviewMemory } from '@/lib/biography/interview';
import { biographyInterviewCatalog } from '@/features/biography-interview/catalog';
import { createSeedProgressRows } from '@/features/biography-interview/planner';

const createServiceClientMock = vi.fn();
const getAuthenticatedRequestContextMock = vi.fn();
const streamTextMock = vi.fn();
const googleMock = vi.fn();
const getServerConfigMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: createServiceClientMock,
}));

vi.mock('@/lib/server/auth', () => ({
  getAuthenticatedRequestContext: getAuthenticatedRequestContextMock,
  authenticationRequiredResponse: () =>
    Response.json(
      {
        status: 401,
        code: 'AUTH_REQUIRED',
        message: 'Authentication required',
      },
      { status: 401 },
    ),
}));

vi.mock('@/lib/server/env', () => ({
  getServerConfig: getServerConfigMock,
}));

vi.mock('@/lib/server/logger', () => ({
  createRouteLogger: () => ({
    correlationId: 'biography-test-correlation',
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('@ai-sdk/google', () => ({
  google: googleMock,
}));

vi.mock('ai', () => ({
  streamText: streamTextMock,
}));

type State = {
  userProfile: {
    full_name: string;
    alt_onboarding_private: unknown;
  };
  session: {
    id: string;
    user_id: string;
    memory_count: number;
    topics_covered: string[];
    active_question_id: string | null;
    catalog_version: string | null;
    processing_status?: string;
    summary?: string | null;
  };
  progressRows: ReturnType<typeof createSeedProgressRows>;
  memories: Array<Record<string, unknown>>;
};

function createSupabaseState(): State {
  return {
    userProfile: {
      full_name: 'Max Mustermann',
      alt_onboarding_private: {
        entry: { answerId: 'entry_2', path: 'B' },
        path: 'B',
        addressPreference: 'du',
        registration: { firstNameOrNickname: 'Max' },
        steps: {
          B1: 'guided_questions',
          B2: 'light',
        },
      },
    },
    session: {
      id: '11111111-1111-1111-1111-111111111111',
      user_id: '00000000-0000-0000-0000-000000000001',
      memory_count: 0,
      topics_covered: [],
      active_question_id: null,
      catalog_version: null,
      processing_status: 'processing',
      summary: null,
    },
    progressRows: createSeedProgressRows({
      interviewSessionId: '11111111-1111-1111-1111-111111111111',
      userId: '00000000-0000-0000-0000-000000000001',
    }),
    memories: [],
  };
}

function createSupabaseMock(state: State) {
  return {
    from(table: string) {
      if (table === 'users') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: state.userProfile, error: null }),
            }),
          }),
        };
      }

      if (table === 'memories') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => ({
                  limit: async () => ({ data: state.memories, error: null }),
                }),
              }),
            }),
          }),
          insert(payload: Record<string, unknown>) {
            return {
              select: () => ({
                single: async () => {
                  const inserted = {
                    id: `memory-${state.memories.length + 1}`,
                    ...payload,
                  };
                  state.memories.unshift(inserted);
                  return {
                    data: { id: inserted.id },
                    error: null,
                  };
                },
              }),
            };
          },
        };
      }

      if (table === 'interview_sessions') {
        return {
          select: () => ({
            eq(column: string, value: string) {
              if (column === 'id' && value === state.session.id) {
                return {
                  eq(innerColumn: string, innerValue: string) {
                    if (innerColumn === 'user_id' && innerValue === state.session.user_id) {
                      return {
                        maybeSingle: async () => ({ data: state.session, error: null }),
                      };
                    }

                    return {
                      maybeSingle: async () => ({ data: null, error: null }),
                    };
                  },
                };
              }

              return {
                maybeSingle: async () => ({ data: null, error: null }),
              };
            },
          }),
          update(payload: Record<string, unknown>) {
            return {
              eq(column: string, value: string) {
                if (column !== 'id' || value !== state.session.id) {
                  throw new Error(`Unexpected interview_sessions.update eq ${column}=${value}`);
                }

                return {
                  eq(innerColumn: string, innerValue: string) {
                    if (innerColumn !== 'user_id' || innerValue !== state.session.user_id) {
                      throw new Error(`Unexpected interview_sessions.update eq ${innerColumn}=${innerValue}`);
                    }

                    state.session = {
                      ...state.session,
                      ...payload,
                    };

                    return Promise.resolve({ data: state.session, error: null });
                  },
                };
              },
            };
          },
        };
      }

      if (table === 'interview_question_progress') {
        return {
          select: () => ({
            eq(column: string, value: string) {
              if (column !== 'interview_session_id' || value !== state.session.id) {
                throw new Error(`Unexpected progress select eq ${column}=${value}`);
              }

              return {
                eq(innerColumn: string, innerValue: string) {
                  if (innerColumn !== 'user_id' || innerValue !== state.session.user_id) {
                    throw new Error(`Unexpected progress select eq ${innerColumn}=${innerValue}`);
                  }

                  return {
                    order: async () => ({ data: state.progressRows, error: null }),
                    eq(lastColumn: string, lastValue: string) {
                      if (lastColumn !== 'question_id') {
                        throw new Error(`Unexpected progress select eq ${lastColumn}=${lastValue}`);
                      }

                      return {
                        maybeSingle: async () => ({
                          data: state.progressRows.find((row) => row.question_id === lastValue) ?? null,
                          error: null,
                        }),
                      };
                    },
                  };
                },
              };
            },
          }),
          insert(rows: typeof state.progressRows) {
            state.progressRows = rows;
            return Promise.resolve({ error: null });
          },
          update(payload: Record<string, unknown>) {
            return {
              eq(column: string, value: string) {
                if (column !== 'interview_session_id' || value !== state.session.id) {
                  throw new Error(`Unexpected progress update eq ${column}=${value}`);
                }

                return {
                  eq(innerColumn: string, innerValue: string) {
                    if (innerColumn !== 'user_id' || innerValue !== state.session.user_id) {
                      throw new Error(`Unexpected progress update eq ${innerColumn}=${innerValue}`);
                    }

                    return {
                      eq(lastColumn: string, lastValue: string) {
                        if (lastColumn !== 'question_id') {
                          throw new Error(`Unexpected progress update eq ${lastColumn}=${lastValue}`);
                        }

                        const target = state.progressRows.find((row) => row.question_id === lastValue);
                        if (target) {
                          Object.assign(target, payload);
                        }

                        return Promise.resolve({ error: null });
                      },
                      in(lastColumn: string, questionIds: string[]) {
                        if (lastColumn !== 'question_id') {
                          throw new Error(`Unexpected progress update in ${lastColumn}`);
                        }

                        for (const target of state.progressRows) {
                          if (questionIds.includes(target.question_id)) {
                            Object.assign(target, payload);
                          }
                        }

                        return Promise.resolve({ error: null });
                      },
                    };
                  },
                };
              },
            };
          },
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
  };
}

describe('biography interview flow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    getAuthenticatedRequestContextMock.mockResolvedValue({
      user: { id: '00000000-0000-0000-0000-000000000001' },
      accessToken: null,
      authSource: 'cookie',
    });
    getServerConfigMock.mockReturnValue({
      geminiApiKey: 'test-gemini-key',
    });
    googleMock.mockReturnValue('mock-model');
    streamTextMock.mockResolvedValue({
      toDataStreamResponse: () =>
        new Response('stream', {
          status: 200,
          headers: { 'content-type': 'text/plain' },
        }),
    });
  });

  it('uses pre-onboarding context and the first canonical question on bootstrap', async () => {
    const state = createSupabaseState();
    createServiceClientMock.mockResolvedValue(createSupabaseMock(state));

    const { POST } = await import('@/app/api/chat/biography/route');
    const response = await POST(
      new Request('http://test.local/api/chat/biography', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'assistant', content: 'Ich bin dein Biografie-Assistent.' },
            { role: 'user', content: BIOGRAPHY_INTERVIEW_START_TOKEN },
          ],
          interviewSessionId: state.session.id,
          source: 'text',
        }),
      }),
    );

    expect(response.status).toBe(200);
    const streamInput = streamTextMock.mock.calls[0]?.[0];
    expect(streamInput.system).toContain('Private Pre-Onboarding-Zusammenfassung');
    expect(streamInput.system).toContain('Wie möchtest du deine Erlebnisse, Erfahrungen, Gedanken am liebsten festhalten?');
    expect(streamInput.system).toContain('Aktive Leitfrage-ID: basis.birth');
    expect(state.session.active_question_id).toBe('basis.birth');
    expect(state.session.catalog_version).toBe('2026-03-14-v1');
    expect(state.progressRows.find((row) => row.question_id === 'basis.birth')?.asked_count).toBe(1);
  });

  it('stores a sufficient answer, marks the current question answered, and advances to the next one', async () => {
    const state = createSupabaseState();
    state.session.active_question_id = 'basis.birth';
    const activeProgress = state.progressRows.find((row) => row.question_id === 'basis.birth');
    if (!activeProgress) {
      throw new Error('Missing basis.birth progress row');
    }
    activeProgress.asked_count = 1;
    activeProgress.prompt_snapshot = biographyInterviewCatalog[0]?.promptIntent ?? null;

    createServiceClientMock.mockResolvedValue(createSupabaseMock(state));

    const { POST } = await import('@/app/api/chat/biography/route');
    const response = await POST(
      new Request('http://test.local/api/chat/biography', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'assistant', content: 'Wenn du magst, fangen wir ganz am Anfang an: Wann und wo wurdest du geboren?' },
            { role: 'user', content: 'Ich wurde 1978 in Medellin geboren, in einem Krankenhaus nahe dem Stadtzentrum.' },
          ],
          interviewSessionId: state.session.id,
          source: 'text',
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(state.memories).toHaveLength(1);
    expect(state.memories[0]).toEqual(
      expect.objectContaining({
        interview_session_id: state.session.id,
        interview_topic: 'basis_information',
        cleaned_content: 'Ich wurde 1978 in Medellin geboren, in einem Krankenhaus nahe dem Stadtzentrum.',
      }),
    );
    expect(state.progressRows.find((row) => row.question_id === 'basis.birth')?.state).toBe('answered');
    expect(state.progressRows.find((row) => row.question_id === 'basis.birth')?.answer_memory_id).toBe('memory-1');
    expect(state.session.memory_count).toBe(1);
    expect(state.session.active_question_id).toBe('basis.home');

    const streamInput = streamTextMock.mock.calls[0]?.[0];
    expect(streamInput.system).toContain('Aktive Leitfrage-ID: basis.home');
  });

  it('marks declined questions as skipped and keeps them from blocking progress', async () => {
    const state = createSupabaseState();
    state.session.active_question_id = 'basis.religion_identity';
    const religionProgress = state.progressRows.find((row) => row.question_id === 'basis.religion_identity');
    if (!religionProgress) {
      throw new Error('Missing basis.religion_identity progress row');
    }
    religionProgress.asked_count = 1;

    createServiceClientMock.mockResolvedValue(createSupabaseMock(state));

    const { POST } = await import('@/app/api/chat/biography/route');
    await POST(
      new Request('http://test.local/api/chat/biography', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'assistant', content: 'Wenn es fuer dich passt: Identifizierst du dich mit einer Religion?' },
            { role: 'user', content: 'Darueber moechte ich lieber nicht sprechen.' },
          ],
          interviewSessionId: state.session.id,
          source: 'text',
        }),
      }),
    );

    expect(state.progressRows.find((row) => row.question_id === 'basis.religion_identity')?.state).toBe('skipped');
    expect(state.progressRows.find((row) => row.question_id === 'basis.religion_type')?.state).toBe('skipped');
    expect(state.progressRows.find((row) => row.question_id === 'basis.religion_importance')?.state).toBe('skipped');
  });

  it('keeps the same question active when the answer is too thin', async () => {
    const state = createSupabaseState();
    state.session.active_question_id = 'family.describe';
    const activeProgress = state.progressRows.find((row) => row.question_id === 'family.describe');
    if (!activeProgress) {
      throw new Error('Missing family.describe progress row');
    }
    activeProgress.asked_count = 1;

    createServiceClientMock.mockResolvedValue(createSupabaseMock(state));

    const { POST } = await import('@/app/api/chat/biography/route');
    const response = await POST(
      new Request('http://test.local/api/chat/biography', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'assistant', content: 'Wie würdest du deine Familie beschreiben?' },
            { role: 'user', content: 'Chaotisch.' },
          ],
          interviewSessionId: state.session.id,
          source: 'text',
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(state.progressRows.find((row) => row.question_id === 'family.describe')?.state).toBe('pending');
    expect(state.session.active_question_id).toBe('family.describe');
    expect(state.memories).toHaveLength(0);

    const streamInput = streamTextMock.mock.calls[0]?.[0];
    expect(streamInput.system).toContain('Aktive Leitfrage-ID: family.describe');
  });

  it('marks not-now answers as deferred without persisting a memory', async () => {
    const state = createSupabaseState();
    state.session.active_question_id = 'relationships.special_bonds';
    const activeProgress = state.progressRows.find((row) => row.question_id === 'relationships.special_bonds');
    if (!activeProgress) {
      throw new Error('Missing relationships.special_bonds progress row');
    }
    activeProgress.asked_count = 1;
    for (const row of state.progressRows) {
      if (row.question_id !== 'relationships.special_bonds') {
        row.state = 'answered';
      }
    }

    createServiceClientMock.mockResolvedValue(createSupabaseMock(state));

    const { POST } = await import('@/app/api/chat/biography/route');
    const response = await POST(
      new Request('http://test.local/api/chat/biography', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'assistant', content: 'Gibt es besondere Freundschaften oder Begegnungen, die dich geprägt haben?' },
            { role: 'user', content: 'Vielleicht später, nicht jetzt.' },
          ],
          interviewSessionId: state.session.id,
          source: 'text',
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(state.progressRows.find((row) => row.question_id === 'relationships.special_bonds')?.state).toBe('deferred');
    expect(state.session.active_question_id).toBe('relationships.special_bonds');
    expect(state.memories).toHaveLength(0);
  });

  it('resumes an already active question instead of jumping ahead', async () => {
    const state = createSupabaseState();
    state.session.active_question_id = 'basis.home';
    const activeProgress = state.progressRows.find((row) => row.question_id === 'basis.home');
    if (!activeProgress) {
      throw new Error('Missing basis.home progress row');
    }
    activeProgress.asked_count = 1;
    state.progressRows.find((row) => row.question_id === 'basis.birth')!.state = 'answered';

    createServiceClientMock.mockResolvedValue(createSupabaseMock(state));

    const { POST } = await import('@/app/api/chat/biography/route');
    const response = await POST(
      new Request('http://test.local/api/chat/biography', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'assistant', content: 'Ich bin dein Biografie-Assistent.' },
            { role: 'user', content: BIOGRAPHY_INTERVIEW_START_TOKEN },
          ],
          interviewSessionId: state.session.id,
          source: 'text',
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(state.session.active_question_id).toBe('basis.home');

    const streamInput = streamTextMock.mock.calls[0]?.[0];
    expect(streamInput.system).toContain('Aktive Leitfrage-ID: basis.home');
  });

  it('does not persist trivial acknowledgements as memories', () => {
    expect(shouldPersistInterviewMemory('Ja')).toBe(false);
    expect(shouldPersistInterviewMemory('Weiter')).toBe(false);
    expect(
      shouldPersistInterviewMemory(
        'Ich erinnere mich noch genau an den Geruch in der Werkstatt meines Vaters.',
      ),
    ).toBe(true);
  });
});
