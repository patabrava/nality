import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const createServiceClientMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: createServiceClientMock,
}));

describe('POST /api/onboarding/alt/pending', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 400 for invalid payloads', async () => {
    const { POST } = await import('@/app/api/onboarding/alt/pending/route');
    const request = new Request('http://localhost/api/onboarding/alt/pending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration: { email: 'invalid' } }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid payload');
    expect(createServiceClientMock).not.toHaveBeenCalled();
  });

  it('stores a pending payload and returns token', async () => {
    const randomUuidSpy = vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('pending-token-123');

    const expireIsMock = vi.fn().mockResolvedValue({ error: null });
    const expireEqMock = vi.fn().mockReturnValue({ is: expireIsMock });
    const updateMock = vi.fn().mockReturnValue({ eq: expireEqMock });
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    const fromMock = vi.fn().mockReturnValue({
      update: updateMock,
      insert: insertMock,
    });

    createServiceClientMock.mockResolvedValue({ from: fromMock });

    const { POST } = await import('@/app/api/onboarding/alt/pending/route');
    const request = new Request('http://localhost/api/onboarding/alt/pending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registration: {
          firstNameOrNickname: 'Max',
          lastName: 'Mustermann',
          email: 'MAX@example.com',
          method: 'password',
        },
        addressPreference: null,
        entry: { answerId: 'entry_2', path: 'B' },
        path: 'B',
        responses: { B1: 'guided_questions' },
        neutralBlockVisited: false,
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.token).toBe('pending-token-123');
    expect(body.expiresAt).toBeTypeOf('string');

    expect(fromMock).toHaveBeenCalledWith('alt_onboarding_pending');
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'pending-token-123',
        email: 'max@example.com',
      }),
    );

    randomUuidSpy.mockRestore();
  });
});
