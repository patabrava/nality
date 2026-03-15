import { beforeEach, describe, expect, it, vi } from 'vitest';

const createClientMock = vi.fn();
const getAuthenticatedRequestContextMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
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

describe('Memories API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  it('returns a deterministic 401 envelope when unauthenticated', async () => {
    getAuthenticatedRequestContextMock.mockResolvedValue(null);

    const { GET } = await import('@/app/api/memories/route');
    const response = await GET(new Request('http://test.local/api/memories'));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe('AUTH_REQUIRED');
    expect(body.message).toBe('Authentication required');
    expect(body.correlationId).toBe('test-correlation');
  });

  it('rejects invalid query parameters before hitting Supabase', async () => {
    getAuthenticatedRequestContextMock.mockResolvedValue({
      user: { id: 'user-1' },
      accessToken: null,
      authSource: 'cookie',
    });

    const { GET } = await import('@/app/api/memories/route');
    const response = await GET(new Request('http://test.local/api/memories?limit=-1'));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.code).toBe('INVALID_QUERY');
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it('creates a memory with the common success envelope', async () => {
    const singleMock = vi.fn().mockResolvedValue({
      data: {
        id: 'memory-1',
        raw_transcript: 'A vivid memory from childhood.',
      },
      error: null,
    });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });

    getAuthenticatedRequestContextMock.mockResolvedValue({
      user: { id: 'user-1' },
      accessToken: null,
      authSource: 'cookie',
    });
    createClientMock.mockResolvedValue({ from: fromMock });

    const { POST } = await import('@/app/api/memories/route');
    const response = await POST(
      new Request('http://test.local/api/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw_transcript: 'A vivid memory from childhood.',
          capture_mode: 'text',
          source: 'text',
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.status).toBe(201);
    expect(body.data.id).toBe('memory-1');
    expect(body.correlationId).toBe('test-correlation');
    expect(fromMock).toHaveBeenCalledWith('memories');
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        raw_transcript: 'A vivid memory from childhood.',
      }),
    );
  });
});
