import { beforeEach, describe, expect, it, vi } from 'vitest';

const createServiceClientMock = vi.fn();
const getAuthenticatedRequestContextMock = vi.fn();
const prepareBiographyInterviewTurnMock = vi.fn();
const generateBiographyInterviewReplyMock = vi.fn();
const buildBiographyVoiceAgentRuntimeContextMock = vi.fn();
const getOptionalEnvMock = vi.fn();
const getRequiredEnvMock = vi.fn();

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

vi.mock('@/lib/server/logger', () => ({
  createRouteLogger: () => ({
    correlationId: 'voice-agent-test-correlation',
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('@/lib/server/env', () => ({
  getOptionalEnv: getOptionalEnvMock,
  getRequiredEnv: getRequiredEnvMock,
}));

vi.mock('@/features/biography-interview/respond', () => ({
  prepareBiographyInterviewTurn: prepareBiographyInterviewTurnMock,
  generateBiographyInterviewReply: generateBiographyInterviewReplyMock,
  buildBiographyVoiceAgentRuntimeContext: buildBiographyVoiceAgentRuntimeContextMock,
}));

function createSupabaseMock() {
  return {
    from(table: string) {
      if (table !== 'interview_sessions') {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        select: () => ({
          eq(column: string, value: string) {
            if (column !== 'id' || value !== '11111111-1111-1111-1111-111111111111') {
              throw new Error(`Unexpected interview_sessions.select eq ${column}=${value}`);
            }

            return {
              eq(innerColumn: string, innerValue: string) {
                if (innerColumn !== 'user_id' || innerValue !== '00000000-0000-0000-0000-000000000001') {
                  throw new Error(`Unexpected interview_sessions.select eq ${innerColumn}=${innerValue}`);
                }

                return {
                  maybeSingle: async () => ({
                    data: { id: value },
                    error: null,
                  }),
                };
              },
            };
          },
        }),
      };
    },
  };
}

describe('voice agent session bootstrap API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    getAuthenticatedRequestContextMock.mockResolvedValue({
      user: { id: '00000000-0000-0000-0000-000000000001' },
      accessToken: null,
      authSource: 'cookie',
    });
    createServiceClientMock.mockResolvedValue(createSupabaseMock());
    getOptionalEnvMock.mockReturnValue('https://app.example.com');
    getRequiredEnvMock.mockImplementation((name: string) => {
      if (name === 'DEEPGRAM_KEY') {
        return 'deepgram-api-key';
      }

      throw new Error(`Unexpected required env ${name}`);
    });
    prepareBiographyInterviewTurnMock.mockResolvedValue({
      ok: true,
      value: {
        systemPrompt: 'voice prompt',
        messages: [{ role: 'user', content: '__START_BIOGRAPHY_INTERVIEW__' }],
        interviewSessionId: '11111111-1111-1111-1111-111111111111',
        activeQuestionId: 'basis.birth',
        correlationId: 'voice-agent-test-correlation',
        delivery: 'voice',
      },
    });
    generateBiographyInterviewReplyMock.mockResolvedValue({
      text: 'Schön, dass Sie da sind. Welche frühe Szene fällt Ihnen sofort wieder ein?',
    });
    buildBiographyVoiceAgentRuntimeContextMock.mockResolvedValue([
      {
        role: 'assistant',
        content: 'Bisheriges Gespräch: Kindheit wurde schon angerissen.',
      },
    ]);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ key: 'deepgram-temp-token' }),
      }),
    );
  });

  it('returns German Deepgram agent settings with greeting and resume context', async () => {
    const { POST } = await import('@/app/api/voice/agent/session/route');
    const response = await POST(
      new Request('http://test.local/api/voice/agent/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewSessionId: '11111111-1111-1111-1111-111111111111',
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.deepgramToken).toBe('deepgram-temp-token');
    expect(body.data.settings.agent.greeting).toBe(
      'Schön, dass Sie da sind. Welche frühe Szene fällt Ihnen sofort wieder ein?',
    );
    expect(body.data.settings.agent.context.messages).toEqual([
      {
        role: 'assistant',
        content: 'Bisheriges Gespräch: Kindheit wurde schon angerissen.',
      },
    ]);
    expect(body.data.settings.agent.listen.provider.language).toBe('de');
    expect(body.data.settings.agent.speak.provider.model).toBe('aura-2-elara-de');
    expect(body.data.settings.agent.think.endpoint.url).toBe(
      'https://app.example.com/api/voice/agent/think',
    );
    expect(body.data.settings.agent.think.endpoint.headers['x-voice-agent-think-token']).toBeTypeOf(
      'string',
    );
  });

  it('falls back to the legacy voice transport when Deepgram token grants are forbidden', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ err_code: 'FORBIDDEN', err_msg: 'Insufficient permissions.' }),
      }),
    );

    const { POST } = await import('@/app/api/voice/agent/session/route');
    const response = await POST(
      new Request('http://test.local/api/voice/agent/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewSessionId: '11111111-1111-1111-1111-111111111111',
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.transport).toBe('legacy');
    expect(body.data.fallbackReason).toContain('cannot grant browser-safe agent tokens');
    expect(prepareBiographyInterviewTurnMock).not.toHaveBeenCalled();
    expect(generateBiographyInterviewReplyMock).not.toHaveBeenCalled();
  });
});
