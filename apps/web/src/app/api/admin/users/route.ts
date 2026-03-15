import { AdminUserSearchQuerySchema } from '@/app/api/admin/contracts';
import { jsonFailure, jsonSuccess, zodErrorDetails } from '@/lib/server/api';
import { requireAdminRequestContext } from '@/lib/server/admin';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

export async function GET(request: Request) {
  const { auth, isAdmin } = await requireAdminRequestContext(request);

  if (!auth) {
    return jsonFailure(request, {
      status: 401,
      code: 'AUTH_REQUIRED',
      message: 'Authentication required',
    });
  }

  if (!isAdmin) {
    return jsonFailure(request, {
      status: 403,
      code: 'ADMIN_FORBIDDEN',
      message: 'Admin access required',
    });
  }

  const parsedQuery = AdminUserSearchQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams.entries()),
  );

  if (!parsedQuery.success) {
    return jsonFailure(request, {
      status: 400,
      code: 'INVALID_QUERY',
      message: 'Invalid admin user search query',
      details: zodErrorDetails(parsedQuery.error),
    });
  }

  const { limit, q, status } = parsedQuery.data;
  const serviceClient = await createServiceClient();

  let userQuery = serviceClient
    .from('users')
    .select('id, email, full_name, onboarding_complete, created_at, updated_at, birth_date, birth_place')
    .order('created_at', { ascending: false })
    .limit(status === 'with_memories' ? Math.max(limit * 3, 30) : limit);

  if (status === 'onboarded') {
    userQuery = userQuery.eq('onboarding_complete', true);
  }

  if (status === 'incomplete') {
    userQuery = userQuery.eq('onboarding_complete', false);
  }

  if (q) {
    const escaped = q.replace(/[%_]/g, '');
    userQuery = userQuery.or(`full_name.ilike.%${escaped}%,email.ilike.%${escaped}%`);
  }

  const { data: users, error: usersError } = await userQuery;

  if (usersError) {
    return jsonFailure(request, {
      status: 500,
      code: 'ADMIN_USER_SEARCH_FAILED',
      message: 'Failed to load admin user list',
    });
  }

  const userIds = (users ?? []).map((user) => user.id);

  if (userIds.length === 0) {
    return jsonSuccess(
      {
        items: [],
      },
      request,
    );
  }

  const [
    { data: memories, error: memoriesError },
    { data: chapters, error: chaptersError },
    { data: biographies, error: biographiesError },
    { data: sessions, error: sessionsError },
  ] = await Promise.all([
    serviceClient
      .from('memories')
      .select('user_id, captured_at')
      .in('user_id', userIds),
    serviceClient.from('chapters').select('user_id').in('user_id', userIds),
    serviceClient
      .from('biographies')
      .select('user_id')
      .in('user_id', userIds)
      .eq('is_current', true),
    serviceClient.from('interview_sessions').select('user_id').in('user_id', userIds),
  ]);

  if (memoriesError || chaptersError || biographiesError || sessionsError) {
    return jsonFailure(request, {
      status: 500,
      code: 'ADMIN_USER_STATS_FAILED',
      message: 'Failed to load admin user stats',
    });
  }

  const memoryCounts = new Map<string, number>();
  const chapterCounts = new Map<string, number>();
  const interviewCounts = new Map<string, number>();
  const biographyUsers = new Set<string>();
  const lastMemoryAt = new Map<string, string>();

  for (const memory of memories ?? []) {
    increment(memoryCounts, memory.user_id);
    const existing = lastMemoryAt.get(memory.user_id);
    if (!existing || String(memory.captured_at) > existing) {
      lastMemoryAt.set(memory.user_id, String(memory.captured_at));
    }
  }

  for (const chapter of chapters ?? []) {
    increment(chapterCounts, chapter.user_id);
  }

  for (const session of sessions ?? []) {
    increment(interviewCounts, session.user_id);
  }

  for (const biography of biographies ?? []) {
    biographyUsers.add(biography.user_id);
  }

  const items = (users ?? [])
    .filter((user) => (status === 'with_memories' ? (memoryCounts.get(user.id) ?? 0) > 0 : true))
    .slice(0, limit)
    .map((user) => ({
      ...user,
      stats: {
        memories: memoryCounts.get(user.id) ?? 0,
        chapters: chapterCounts.get(user.id) ?? 0,
        interviews: interviewCounts.get(user.id) ?? 0,
        hasBiography: biographyUsers.has(user.id),
        lastMemoryAt: lastMemoryAt.get(user.id) ?? null,
      },
    }));

  return jsonSuccess({ items }, request);
}
