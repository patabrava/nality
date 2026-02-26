import { beforeEach, describe, expect, it, vi } from 'vitest';

const createClientMock = vi.fn();
const createServiceClientMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
  createServiceClient: createServiceClientMock,
}));

describe('POST /api/onboarding/alt/complete', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 401 for unauthenticated requests', async () => {
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });

    const { POST } = await import('@/app/api/onboarding/alt/complete/route');
    const request = new Request('http://localhost/api/onboarding/alt/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Authentication required');
  });

  it('returns 400 for invalid payloads', async () => {
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
    });

    const { POST } = await import('@/app/api/onboarding/alt/complete/route');
    const request = new Request('http://localhost/api/onboarding/alt/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration: { email: 'invalid' } }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid payload');
  });

  it('stores onboarding payload and marks user complete', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
    const fromMock = vi.fn().mockReturnValue({ update: updateMock });

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
    });
    createServiceClientMock.mockResolvedValue({ from: fromMock });

    const { POST } = await import('@/app/api/onboarding/alt/complete/route');
    const request = new Request('http://localhost/api/onboarding/alt/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registration: {
          firstNameOrNickname: 'Max',
          lastName: 'Mustermann',
          email: 'max@example.com',
          method: 'password',
        },
        addressPreference: 'du',
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

    expect(fromMock).toHaveBeenCalledWith('users');
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(eqMock).toHaveBeenCalledWith('id', 'user-1');
  });

  it('finalizes onboarding from pending token and consumes token', async () => {
    const usersEqMock = vi.fn().mockResolvedValue({ error: null });
    const usersUpdateMock = vi.fn().mockReturnValue({ eq: usersEqMock });

    const pendingSelectMaybeSingleMock = vi.fn().mockResolvedValue({
      data: {
        email: 'max@example.com',
        expires_at: '2999-01-01T00:00:00.000Z',
        consumed_at: null,
        payload: {
          registration: {
            firstNameOrNickname: 'Max',
            lastName: 'Mustermann',
            email: 'max@example.com',
            method: 'password',
          },
          addressPreference: null,
          entry: { answerId: 'entry_2', path: 'B' },
          path: 'B',
          responses: { B1: 'guided_questions' },
          neutralBlockVisited: false,
        },
      },
      error: null,
    });
    const pendingSelectEqMock = vi.fn().mockReturnValue({ maybeSingle: pendingSelectMaybeSingleMock });
    const pendingSelectMock = vi.fn().mockReturnValue({ eq: pendingSelectEqMock });

    const pendingConsumeIsMock = vi.fn().mockResolvedValue({ error: null });
    const pendingConsumeEqMock = vi.fn().mockReturnValue({ is: pendingConsumeIsMock });
    const pendingUpdateMock = vi.fn().mockReturnValue({ eq: pendingConsumeEqMock });

    const fromMock = vi.fn((table: string) => {
      if (table === 'users') {
        return { update: usersUpdateMock };
      }

      if (table === 'alt_onboarding_pending') {
        return {
          select: pendingSelectMock,
          update: pendingUpdateMock,
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'max@example.com' } },
          error: null,
        }),
      },
    });
    createServiceClientMock.mockResolvedValue({ from: fromMock });

    const { POST } = await import('@/app/api/onboarding/alt/complete/route');
    const request = new Request('http://localhost/api/onboarding/alt/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pendingToken: 'pending-token-123',
        addressPreference: 'du',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    expect(usersUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        onboarding_complete: true,
        form_of_address: 'du',
      }),
    );
    expect(usersEqMock).toHaveBeenCalledWith('id', 'user-1');
    expect(pendingConsumeEqMock).toHaveBeenCalledWith('token', 'pending-token-123');
    expect(pendingConsumeIsMock).toHaveBeenCalledWith('consumed_at', null);
  });
});
