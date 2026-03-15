import { AdminOverviewQuerySchema, getWindowStart } from '@/app/api/admin/contracts';
import { jsonFailure, jsonSuccess, zodErrorDetails } from '@/lib/server/api';
import { requireAdminRequestContext } from '@/lib/server/admin';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function buildDateBuckets(days: number) {
  const buckets: Record<string, number> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let index = days - 1; index >= 0; index -= 1) {
    const cursor = new Date(today);
    cursor.setDate(cursor.getDate() - index);
    const key = cursor.toISOString().slice(0, 10);
    buckets[key] = 0;
  }

  return buckets;
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

  const parsedQuery = AdminOverviewQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams.entries()),
  );

  if (!parsedQuery.success) {
    return jsonFailure(request, {
      status: 400,
      code: 'INVALID_QUERY',
      message: 'Invalid admin overview query',
      details: zodErrorDetails(parsedQuery.error),
    });
  }

  const { window: windowValue } = parsedQuery.data;
  const startDate = getWindowStart(windowValue);
  const days = windowValue === '7d' ? 7 : windowValue === '90d' ? 90 : 30;

  const serviceClient = await createServiceClient();

  const [
    { count: totalUsers },
    { count: onboardedUsers },
    { count: currentBiographies },
    { data: createdUsers, error: createdUsersError },
    { data: recentMemories, error: memoriesError },
    { data: recentSessions, error: sessionsError },
  ] = await Promise.all([
    serviceClient.from('users').select('id', { count: 'exact', head: true }),
    serviceClient
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('onboarding_complete', true),
    serviceClient
      .from('biographies')
      .select('id', { count: 'exact', head: true })
      .eq('is_current', true),
    serviceClient.from('users').select('created_at').gte('created_at', startDate),
    serviceClient
      .from('memories')
      .select('user_id, capture_mode, interview_topic, captured_at')
      .gte('captured_at', startDate)
      .order('captured_at', { ascending: false }),
    serviceClient
      .from('interview_sessions')
      .select('memory_count, started_at')
      .gte('started_at', startDate)
      .order('started_at', { ascending: false }),
  ]);

  if (createdUsersError || memoriesError || sessionsError) {
    return jsonFailure(request, {
      status: 500,
      code: 'ADMIN_OVERVIEW_QUERY_FAILED',
      message: 'Failed to load admin overview metrics',
    });
  }

  const activeUsers = new Set((recentMemories ?? []).map((memory) => memory.user_id)).size;
  const averageMemoriesPerInterview =
    recentSessions && recentSessions.length > 0
      ? recentSessions.reduce((total, session) => total + (session.memory_count ?? 0), 0) /
        recentSessions.length
      : 0;

  const userGrowthBuckets = buildDateBuckets(days);
  for (const row of createdUsers ?? []) {
    const key = String(row.created_at).slice(0, 10);
    if (userGrowthBuckets[key] !== undefined) {
      userGrowthBuckets[key] += 1;
    }
  }

  const memoryTrendBuckets = buildDateBuckets(days);
  const captureModes = {
    interview: 0,
    free_talk: 0,
    text: 0,
  };
  const topicCounts = new Map<string, number>();

  for (const memory of recentMemories ?? []) {
    const key = String(memory.captured_at).slice(0, 10);
    if (memoryTrendBuckets[key] !== undefined) {
      memoryTrendBuckets[key] += 1;
    }

    if (memory.capture_mode in captureModes) {
      captureModes[memory.capture_mode as keyof typeof captureModes] += 1;
    }

    const topic = memory.interview_topic?.trim();
    if (topic) {
      topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
    }
  }

  return jsonSuccess(
    {
      filters: {
        window: windowValue,
      },
      summary: {
        totalUsers: totalUsers ?? 0,
        onboardedUsers: onboardedUsers ?? 0,
        activeUsers,
        currentBiographies: currentBiographies ?? 0,
        interviewSessions: recentSessions?.length ?? 0,
        averageMemoriesPerInterview: Number(averageMemoriesPerInterview.toFixed(1)),
      },
      charts: {
        userGrowth: Object.entries(userGrowthBuckets).map(([label, value]) => ({ label, value })),
        memoryTrend: Object.entries(memoryTrendBuckets).map(([label, value]) => ({ label, value })),
        captureModes: Object.entries(captureModes).map(([label, value]) => ({ label, value })),
        topTopics: Array.from(topicCounts.entries())
          .sort((left, right) => right[1] - left[1])
          .slice(0, 8)
          .map(([label, value]) => ({ label, value })),
      },
    },
    request,
  );
}
