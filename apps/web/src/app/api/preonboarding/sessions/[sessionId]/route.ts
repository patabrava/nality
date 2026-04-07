import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type RequestPayload = {
  current_strand?: string | null;
  current_question?: string;
  answers?: Record<string, unknown>;
  status?: 'in_progress' | 'paused' | 'completed';
};

function normalizeSessionId(value: string): string | null {
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

export async function GET(_: Request, context: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await context.params;
    const normalizedSessionId = normalizeSessionId(sessionId);

    if (!normalizedSessionId) {
      return NextResponse.json({ error: 'Invalid session id' }, { status: 400 });
    }

    const serviceClient = await createServiceClient();
    const { data, error } = await serviceClient
      .from('meeting_preonboarding_sessions')
      .select('session_id, current_strand, current_question, answers, status, updated_at')
      .eq('session_id', normalizedSessionId)
      .maybeSingle();

    if (error) {
      console.error('[preonboarding] failed to fetch session', error);
      return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[preonboarding] get route error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await context.params;
    const normalizedSessionId = normalizeSessionId(sessionId);

    if (!normalizedSessionId) {
      return NextResponse.json({ error: 'Invalid session id' }, { status: 400 });
    }

    const body = (await request.json().catch(() => null)) as RequestPayload | null;
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const userId = await getAuthenticatedUserId();
    const serviceClient = await createServiceClient();
    const now = new Date().toISOString();

    const { data: existing } = await serviceClient
      .from('meeting_preonboarding_sessions')
      .select('user_id')
      .eq('session_id', normalizedSessionId)
      .maybeSingle();

    const resolvedUserId = existing?.user_id ?? userId ?? null;

    const { error } = await serviceClient.from('meeting_preonboarding_sessions').upsert(
      {
        session_id: normalizedSessionId,
        user_id: resolvedUserId,
        current_strand: body.current_strand ?? null,
        current_question: body.current_question ?? 'Q1',
        answers: body.answers ?? {},
        status: body.status ?? 'in_progress',
        updated_at: now,
      },
      { onConflict: 'session_id' },
    );

    if (error) {
      console.error('[preonboarding] failed to upsert session', error);
      return NextResponse.json({ error: 'Failed to persist session' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, session_id: normalizedSessionId, updated_at: now });
  } catch (error) {
    console.error('[preonboarding] put route error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
