import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const AddressPreferenceSchema = z.enum(['du', 'sie']);

const EntrySchema = z
  .object({
    answerId: z.string(),
    path: z.enum(['A', 'B', 'C']),
  })
  .nullable();

const RegistrationSchema = z.object({
  firstNameOrNickname: z.string().min(1),
  lastName: z.string().optional().default(''),
  email: z.string().email(),
  method: z.enum(['password', 'google']),
});

const DirectFinalizeSchema = z.object({
  registration: RegistrationSchema,
  addressPreference: AddressPreferenceSchema,
  entry: EntrySchema,
  path: z.enum(['A', 'B', 'C']).nullable(),
  responses: z.record(z.string(), z.unknown()),
  neutralBlockVisited: z.boolean(),
});

const PendingFinalizeSchema = z.object({
  pendingToken: z.string().min(1),
  addressPreference: AddressPreferenceSchema.optional(),
});

const PendingStoredPayloadSchema = z.object({
  registration: RegistrationSchema,
  addressPreference: AddressPreferenceSchema.nullable().optional(),
  entry: EntrySchema,
  path: z.enum(['A', 'B', 'C']).nullable(),
  responses: z.record(z.string(), z.unknown()),
  neutralBlockVisited: z.boolean(),
});

const FinalizeRequestSchema = z.union([DirectFinalizeSchema, PendingFinalizeSchema]);

type FinalizePayload = z.infer<typeof DirectFinalizeSchema>;

function buildFullName(firstNameOrNickname: string, lastName: string): string {
  const first = firstNameOrNickname.trim();
  const last = lastName.trim();
  if (!last) return first;
  return `${first} ${last}`;
}

function buildPrivatePayload(finalizePayload: FinalizePayload, completedAt: string) {
  // Privacy boundary: onboarding answers are persisted only in users.alt_onboarding_private.
  // They must never be added to public/profile-facing select lists or DTO responses.
  return {
    version: 'alt-onboarding-v1',
    entry: finalizePayload.entry,
    path: finalizePayload.path,
    steps: finalizePayload.responses,
    neutralBlockVisited: finalizePayload.neutralBlockVisited,
    registration: {
      firstNameOrNickname: finalizePayload.registration.firstNameOrNickname,
      lastName: finalizePayload.registration.lastName,
      email: finalizePayload.registration.email,
      method: finalizePayload.registration.method,
    },
    addressPreference: finalizePayload.addressPreference,
    completedAt,
  };
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = FinalizeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const serviceClient = await createServiceClient();
    const now = new Date().toISOString();
    let finalizePayload: FinalizePayload;
    let pendingTokenToConsume: string | null = null;

    if ('pendingToken' in parsed.data) {
      pendingTokenToConsume = parsed.data.pendingToken;

      const { data: pendingRecord, error: pendingFetchError } = await serviceClient
        .from('alt_onboarding_pending')
        .select('email, payload, expires_at, consumed_at')
        .eq('token', parsed.data.pendingToken)
        .maybeSingle();

      if (pendingFetchError) {
        console.error('[alt-onboarding] failed to load pending payload', pendingFetchError);
        return NextResponse.json({ error: 'Failed to resolve onboarding link' }, { status: 500 });
      }

      if (!pendingRecord || pendingRecord.consumed_at) {
        return NextResponse.json({ error: 'Onboarding link is invalid or already used' }, { status: 400 });
      }

      const expiresAtMs = Date.parse(pendingRecord.expires_at);
      if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
        return NextResponse.json({ error: 'Onboarding link has expired' }, { status: 400 });
      }

      const pendingPayloadParsed = PendingStoredPayloadSchema.safeParse(pendingRecord.payload);
      if (!pendingPayloadParsed.success) {
        return NextResponse.json({ error: 'Stored onboarding payload is invalid' }, { status: 400 });
      }

      const userEmail = user.email?.trim().toLowerCase() ?? null;
      const pendingEmail = typeof pendingRecord.email === 'string' ? pendingRecord.email.trim().toLowerCase() : null;

      if (userEmail && pendingEmail && userEmail !== pendingEmail) {
        return NextResponse.json(
          { error: 'Onboarding link belongs to a different account' },
          { status: 403 },
        );
      }

      const resolvedAddressPreference =
        parsed.data.addressPreference ?? pendingPayloadParsed.data.addressPreference ?? null;

      if (!resolvedAddressPreference) {
        return NextResponse.json(
          { error: 'Address preference required to finalize onboarding' },
          { status: 400 },
        );
      }

      finalizePayload = {
        registration: pendingPayloadParsed.data.registration,
        entry: pendingPayloadParsed.data.entry,
        path: pendingPayloadParsed.data.path,
        responses: pendingPayloadParsed.data.responses,
        neutralBlockVisited: pendingPayloadParsed.data.neutralBlockVisited,
        addressPreference: resolvedAddressPreference,
      };
    } else {
      finalizePayload = parsed.data;
    }

    const fullName = buildFullName(
      finalizePayload.registration.firstNameOrNickname,
      finalizePayload.registration.lastName,
    );
    const privatePayload = buildPrivatePayload(finalizePayload, now);

    const { error: updateError } = await serviceClient
      .from('users')
      .update({
        full_name: fullName,
        form_of_address: finalizePayload.addressPreference,
        onboarding_complete: true,
        onboarding_completed_at: now,
        alt_onboarding_private: privatePayload,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[alt-onboarding] failed to update user', updateError);
      return NextResponse.json({ error: 'Failed to store onboarding data' }, { status: 500 });
    }

    if (pendingTokenToConsume) {
      const { error: consumeError } = await serviceClient
        .from('alt_onboarding_pending')
        .update({
          consumed_at: now,
          consumed_by: user.id,
        })
        .eq('token', pendingTokenToConsume)
        .is('consumed_at', null);

      if (consumeError) {
        console.error('[alt-onboarding] failed to consume pending token', consumeError);
      }
    }

    // Return only minimal metadata; do not expose private onboarding payload.
    return NextResponse.json({
      success: true,
      userId: user.id,
      completedAt: now,
    });
  } catch (error) {
    console.error('[alt-onboarding] finalize endpoint error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
