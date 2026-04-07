import { beforeEach, describe, expect, it, vi } from 'vitest';

const createServiceClientMock = vi.fn();
const requireAdminRequestContextMock = vi.fn();

vi.mock('@/lib/server/admin', () => ({
  requireAdminRequestContext: requireAdminRequestContextMock,
}));

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: createServiceClientMock,
}));

vi.mock('@/lib/server/logger', () => ({
  createRouteLogger: () => ({
    correlationId: 'admin-test-correlation',
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('Admin API routes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  it('returns the admin access payload for authenticated staff users', async () => {
    requireAdminRequestContextMock.mockResolvedValue({
      auth: {
        user: {
          email: 'admin@example.com',
        },
      },
      isAdmin: true,
    });

    const { GET } = await import('@/app/api/admin/access/route');
    const response = await GET(new Request('http://test.local/api/admin/access'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.isAdmin).toBe(true);
    expect(body.data.email).toBe('admin@example.com');
  });

  it('blocks the overview route for non-admin users with a 403 envelope', async () => {
    requireAdminRequestContextMock.mockResolvedValue({
      auth: {
        user: {
          email: 'member@example.com',
        },
      },
      isAdmin: false,
    });

    const { GET } = await import('@/app/api/admin/overview/route');
    const response = await GET(new Request('http://test.local/api/admin/overview'));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.code).toBe('ADMIN_FORBIDDEN');
  });

  it('rejects invalid admin user search queries before any database work', async () => {
    requireAdminRequestContextMock.mockResolvedValue({
      auth: {
        user: {
          email: 'admin@example.com',
        },
      },
      isAdmin: true,
    });

    const { GET } = await import('@/app/api/admin/users/route');
    const response = await GET(new Request('http://test.local/api/admin/users?limit=999'));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.code).toBe('INVALID_QUERY');
    expect(createServiceClientMock).not.toHaveBeenCalled();
  });

  it('finalizes an admin interview session for the selected target user', async () => {
    const maybeSingleMock = vi.fn().mockResolvedValue({
      data: {
        id: '11111111-1111-1111-1111-111111111111',
        user_id: '00000000-0000-0000-0000-000000000001',
        ended_at: '2026-03-14T12:00:00.000Z',
        processing_status: 'complete',
        summary: null,
      },
      error: null,
    });
    const selectMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
    const secondEqMock = vi.fn().mockReturnValue({ select: selectMock });
    const firstEqMock = vi.fn().mockReturnValue({ eq: secondEqMock });
    const updateMock = vi.fn().mockReturnValue({ eq: firstEqMock });
    const fromMock = vi.fn().mockReturnValue({ update: updateMock });

    requireAdminRequestContextMock.mockResolvedValue({
      auth: {
        user: {
          email: 'admin@example.com',
        },
      },
      isAdmin: true,
    });
    createServiceClientMock.mockResolvedValue({ from: fromMock });

    const { PATCH } = await import('@/app/api/admin/users/[id]/interview/route');
    const response = await PATCH(
      new Request('http://test.local/api/admin/users/00000000-0000-0000-0000-000000000001/interview', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewSessionId: '11111111-1111-1111-1111-111111111111',
          endedAt: '2026-03-14T12:00:00.000Z',
          processingStatus: 'complete',
        }),
      }),
      {
        params: Promise.resolve({
          id: '00000000-0000-0000-0000-000000000001',
        }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.session.id).toBe('11111111-1111-1111-1111-111111111111');
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        processing_status: 'complete',
      }),
    );
    expect(fromMock).toHaveBeenCalledWith('interview_sessions');
  });
});
