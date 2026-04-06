import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import type { PreOnboardingAnswersMap } from '@/lib/profile/preOnboardingProfile';

export const dynamic = 'force-dynamic';
const SESSION_COOKIE = 'meeting_preonboarding_session_id';

type UpdatePayload = {
  answers?: Record<string, unknown>;
};

type SessionRow = {
  session_id: string;
  status: 'in_progress' | 'paused' | 'completed';
  current_question: string;
  answers: Record<string, unknown>;
  updated_at: string | null;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeAnswers(answers: unknown): PreOnboardingAnswersMap {
  if (!isPlainObject(answers)) return {};

  const result: PreOnboardingAnswersMap = {};

  for (const [questionId, value] of Object.entries(answers)) {
    if (!questionId || questionId.length > 16 || !isPlainObject(value)) continue;

    const selected = Array.isArray(value.selected)
      ? value.selected.filter((item): item is string => typeof item === 'string' && item.length > 0 && item.length <= 64).slice(0, 1)
      : undefined;

    const birthDecade = typeof value.birth_decade === 'string' && value.birth_decade.length <= 64 ? value.birth_decade : undefined;
    const genderIdentity =
      typeof value.gender_identity === 'string' && value.gender_identity.length <= 64 ? value.gender_identity : undefined;

    const answeredAt =
      typeof value.answered_at === 'string' && !Number.isNaN(Date.parse(value.answered_at))
        ? value.answered_at
        : new Date().toISOString();

    if (selected && selected.length > 0) {
      result[questionId] = { selected, answered_at: answeredAt };
      continue;
    }

    if (birthDecade && genderIdentity) {
      result[questionId] = {
        birth_decade: birthDecade,
        gender_identity: genderIdentity,
        answered_at: answeredAt,
      };
    }
  }

  return result;
}

function normalizeSessionId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 128) return null;
  return trimmed;
}

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function resolveLinkedSession(
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
  userId: string,
  sessionIdHint: string | null,
): Promise<SessionRow | null> {
  const { data: linkedSession, error: linkedError } = await serviceClient
    .from('meeting_preonboarding_sessions')
    .select('session_id, status, current_question, answers, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (linkedError) {
    throw linkedError;
  }

  if (linkedSession?.session_id) {
    return linkedSession as SessionRow;
  }

  if (!sessionIdHint) {
    return null;
  }

  const { data: hintedSession, error: hintedError } = await serviceClient
    .from('meeting_preonboarding_sessions')
    .select('session_id, user_id, status, current_question, answers, updated_at')
    .eq('session_id', sessionIdHint)
    .maybeSingle();

  if (hintedError) {
    throw hintedError;
  }

  if (!hintedSession?.session_id) {
    return null;
  }

  if (!hintedSession.user_id || hintedSession.user_id === userId) {
    const { error: linkError } = await serviceClient
      .from('meeting_preonboarding_sessions')
      .update({ user_id: userId, updated_at: new Date().toISOString() })
      .eq('session_id', hintedSession.session_id)
      .or(`user_id.is.null,user_id.eq.${userId}`);

    if (linkError) {
      throw linkError;
    }
  }

  if (hintedSession.user_id && hintedSession.user_id !== userId) {
    return null;
  }

  return {
    session_id: hintedSession.session_id,
    status: hintedSession.status,
    current_question: hintedSession.current_question,
    answers: hintedSession.answers,
    updated_at: hintedSession.updated_at,
  } as SessionRow;
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = await createServiceClient();
    const sessionIdHint = normalizeSessionId((await cookies()).get(SESSION_COOKIE)?.value);
    const data = await resolveLinkedSession(serviceClient, userId, sessionIdHint);

    if (!data) {
      return NextResponse.json({ session: null });
    }

    if (!data.session_id) {
      console.error('[preonboarding-profile] failed to fetch linked session', { userId, sessionIdHint });
      return NextResponse.json({ error: 'Failed to load pre-onboarding profile data' }, { status: 500 });
    }

    return NextResponse.json({
      session: {
        session_id: data.session_id,
        status: data.status,
        current_question: data.current_question,
        answers: sanitizeAnswers(data.answers),
        updated_at: data.updated_at,
      },
    });
  } catch (error) {
    console.error('[preonboarding-profile] get route error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as UpdatePayload | null;
    if (!body || !isPlainObject(body)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const answers = sanitizeAnswers(body.answers);

    const serviceClient = await createServiceClient();
    const sessionIdHint = normalizeSessionId((await cookies()).get(SESSION_COOKIE)?.value);
    const existingSession = await resolveLinkedSession(serviceClient, userId, sessionIdHint);

    if (!existingSession?.session_id) {
      return NextResponse.json({ error: 'No linked pre-onboarding session found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const { error: updateError } = await serviceClient
      .from('meeting_preonboarding_sessions')
      .update({ answers, updated_at: now })
      .eq('session_id', existingSession.session_id)
      .eq('user_id', userId);

    if (updateError) {
      console.error('[preonboarding-profile] failed to update linked session', updateError);
      return NextResponse.json({ error: 'Failed to update pre-onboarding profile data' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, updated_at: now });
  } catch (error) {
    console.error('[preonboarding-profile] put route error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
