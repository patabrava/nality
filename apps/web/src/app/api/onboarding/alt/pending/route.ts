import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const RegistrationSchema = z.object({
  firstNameOrNickname: z.string().min(1),
  lastName: z.string().optional().default(''),
  email: z.string().email(),
  method: z.enum(['password', 'google']),
});

const PendingPayloadSchema = z.object({
  registration: RegistrationSchema,
  addressPreference: z.enum(['du', 'sie']).nullable().optional(),
  entry: z
    .object({
      answerId: z.string(),
      path: z.enum(['A', 'B', 'C']),
    })
    .nullable(),
  path: z.enum(['A', 'B', 'C']).nullable(),
  responses: z.record(z.string(), z.unknown()),
  neutralBlockVisited: z.boolean(),
});

const PENDING_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = PendingPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const serviceClient = await createServiceClient();
    const now = new Date();
    const nowIso = now.toISOString();
    const expiresAt = new Date(now.getTime() + PENDING_TTL_MS).toISOString();
    const token = crypto.randomUUID();
    const email = parsed.data.registration.email.trim().toLowerCase();

    const pendingPayload = {
      registration: {
        firstNameOrNickname: parsed.data.registration.firstNameOrNickname,
        lastName: parsed.data.registration.lastName,
        email,
        method: parsed.data.registration.method,
      },
      addressPreference: parsed.data.addressPreference ?? null,
      entry: parsed.data.entry,
      path: parsed.data.path,
      responses: parsed.data.responses,
      neutralBlockVisited: parsed.data.neutralBlockVisited,
    };

    const { error: expireOlderError } = await serviceClient
      .from('alt_onboarding_pending')
      .update({ consumed_at: nowIso })
      .eq('email', email)
      .is('consumed_at', null);

    if (expireOlderError) {
      console.error('[alt-onboarding] failed to expire pending payloads', expireOlderError);
      return NextResponse.json({ error: 'Failed to store onboarding link' }, { status: 500 });
    }

    const { error: insertError } = await serviceClient.from('alt_onboarding_pending').insert({
      token,
      email,
      payload: pendingPayload,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error('[alt-onboarding] failed to insert pending payload', insertError);
      return NextResponse.json({ error: 'Failed to store onboarding link' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      token,
      expiresAt,
    });
  } catch (error) {
    console.error('[alt-onboarding] pending endpoint error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
