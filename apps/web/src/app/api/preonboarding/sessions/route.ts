import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function normalizeSessionId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 128) return null;
  return trimmed;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const sessionId = normalizeSessionId(body?.session_id);

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    const serviceClient = await createServiceClient();
    const now = new Date().toISOString();

    const { error } = await serviceClient.from('meeting_preonboarding_sessions').upsert(
      {
        session_id: sessionId,
        current_question: 'Q1',
        status: 'in_progress',
        answers: {},
        updated_at: now,
      },
      { onConflict: 'session_id' },
    );

    if (error) {
      console.error('[preonboarding] failed to create session', error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({ session_id: sessionId, created_at: now }, { status: 201 });
  } catch (error) {
    console.error('[preonboarding] create route error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
