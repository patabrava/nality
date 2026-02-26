-- Store private pre-registration onboarding answers on users table.
-- Constraint: this payload is backend/profile-tab only and must not be rendered on public profile pages.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS alt_onboarding_private JSONB;

COMMENT ON COLUMN users.alt_onboarding_private IS 'Private alt onboarding payload (pre-registration wizard). Do not expose on public profile UI.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_alt_onboarding_private_is_object'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_alt_onboarding_private_is_object
      CHECK (
        alt_onboarding_private IS NULL
        OR jsonb_typeof(alt_onboarding_private) = 'object'
      );
  END IF;
END;
$$;
