import { beforeEach, describe, expect, it, vi } from 'vitest';

const getAuthenticatedRequestContextMock = vi.fn();
const streamTextMock = vi.fn();
const googleMock = vi.fn();

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

vi.mock('@ai-sdk/google', () => ({
  google: googleMock,
}));

vi.mock('ai', () => ({
  streamText: streamTextMock,
}));

describe('chapter chat route', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    googleMock.mockReturnValue('gemini-model');
    process.env.GEMINI_API_KEY = 'test-gemini-key';
  });

  it('derives the extraction URL from the request origin when saving memories', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true }),
    });

    vi.stubGlobal('fetch', fetchMock);

    getAuthenticatedRequestContextMock.mockResolvedValue({
      user: { id: '00000000-0000-0000-0000-000000000001' },
      accessToken: 'chapter-access-token',
    });

    streamTextMock.mockImplementation(async (input: { onFinish?: (payload: { text: string }) => Promise<void> | void }) => {
      await input.onFinish?.({
        text: 'Antwort mit [SAVE_MEMORY]\nTitle: Erinnerung\n[/SAVE_MEMORY]',
      });

      return {
        toDataStreamResponse: () => new Response('stream ok', { status: 200 }),
      };
    });

    const { POST } = await import('@/app/api/chat/chapter/route');
    const response = await POST(
      new Request('http://test.local/api/chat/chapter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterId: 'growing_up',
          messages: [
            {
              role: 'user',
              content: 'Ich erinnere mich an meine Schulzeit.',
            },
          ],
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [calledUrl, calledInit] = fetchMock.mock.calls[0] ?? [];
    expect(String(calledUrl)).toBe('http://test.local/api/events/extract');
    expect(calledInit).toMatchObject({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer chapter-access-token',
      },
    });
  });
});
