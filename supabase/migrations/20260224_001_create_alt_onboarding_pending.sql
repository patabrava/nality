-- Persist pre-auth alt-onboarding payloads for cross-device verification flows.

CREATE TABLE IF NOT EXISTS public.alt_onboarding_pending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  payload JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consumed_at TIMESTAMPTZ,
  consumed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.alt_onboarding_pending IS 'Private pre-auth payload cache for alt onboarding completion after auth callback.';
COMMENT ON COLUMN public.alt_onboarding_pending.payload IS 'Contains onboarding responses and registration metadata. Never expose in public profile DTOs.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'alt_onboarding_pending_payload_is_object'
  ) THEN
    ALTER TABLE public.alt_onboarding_pending
      ADD CONSTRAINT alt_onboarding_pending_payload_is_object
      CHECK (jsonb_typeof(payload) = 'object');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_alt_onboarding_pending_expires_at
  ON public.alt_onboarding_pending (expires_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_alt_onboarding_pending_active_email
  ON public.alt_onboarding_pending (lower(email))
  WHERE consumed_at IS NULL;

ALTER TABLE public.alt_onboarding_pending ENABLE ROW LEVEL SECURITY;
