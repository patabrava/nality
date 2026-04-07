-- Persist meeting pre-onboarding sessions and registration name fields.

CREATE TABLE IF NOT EXISTS public.meeting_preonboarding_sessions (
  session_id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  current_strand TEXT,
  current_question TEXT NOT NULL DEFAULT 'Q1',
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status IN ('in_progress', 'paused', 'completed')),
  CHECK (jsonb_typeof(answers) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_meeting_preonboarding_sessions_user_id
  ON public.meeting_preonboarding_sessions (user_id, updated_at DESC);

ALTER TABLE public.meeting_preonboarding_sessions ENABLE ROW LEVEL SECURITY;

-- Service-role-only table access by design (API route uses service client).
DROP POLICY IF EXISTS "Service role has full access to meeting pre-onboarding" ON public.meeting_preonboarding_sessions;
CREATE POLICY "Service role has full access to meeting pre-onboarding"
  ON public.meeting_preonboarding_sessions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE OR REPLACE FUNCTION public.update_meeting_preonboarding_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_meeting_preonboarding_sessions_updated_at ON public.meeting_preonboarding_sessions;
CREATE TRIGGER trigger_update_meeting_preonboarding_sessions_updated_at
  BEFORE UPDATE ON public.meeting_preonboarding_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_meeting_preonboarding_sessions_updated_at();

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS nickname TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT;

COMMENT ON COLUMN public.users.first_name IS 'Registration Vorname (required at signup).';
COMMENT ON COLUMN public.users.nickname IS 'Registration Spitzname (optional).';
COMMENT ON COLUMN public.users.last_name IS 'Registration Nachname (optional).';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  meta JSONB;
  meta_first_name TEXT;
  meta_nickname TEXT;
  meta_last_name TEXT;
  meta_full_name TEXT;
  meta_avatar_url TEXT;
  preonboarding_session_id TEXT;
  derived_full_name TEXT;
BEGIN
  meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  meta_first_name := NULLIF(BTRIM(meta->>'first_name'), '');
  meta_nickname := NULLIF(BTRIM(meta->>'nickname'), '');
  meta_last_name := NULLIF(BTRIM(meta->>'last_name'), '');
  meta_full_name := NULLIF(BTRIM(meta->>'full_name'), '');
  meta_avatar_url := NULLIF(BTRIM(meta->>'avatar_url'), '');
  preonboarding_session_id := NULLIF(BTRIM(meta->>'preonboarding_session_id'), '');

  derived_full_name :=
    CASE
      WHEN meta_first_name IS NOT NULL AND meta_last_name IS NOT NULL THEN meta_first_name || ' ' || meta_last_name
      WHEN meta_first_name IS NOT NULL THEN meta_first_name
      ELSE meta_full_name
    END;

  INSERT INTO public.users (id, email, full_name, avatar_url, first_name, nickname, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    derived_full_name,
    meta_avatar_url,
    meta_first_name,
    meta_nickname,
    meta_last_name
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        avatar_url = COALESCE(public.users.avatar_url, EXCLUDED.avatar_url),
        full_name = COALESCE(public.users.full_name, EXCLUDED.full_name),
        first_name = COALESCE(public.users.first_name, EXCLUDED.first_name),
        nickname = COALESCE(public.users.nickname, EXCLUDED.nickname),
        last_name = COALESCE(public.users.last_name, EXCLUDED.last_name);

  IF preonboarding_session_id IS NOT NULL THEN
    UPDATE public.meeting_preonboarding_sessions
      SET user_id = NEW.id
      WHERE session_id = preonboarding_session_id
        AND (user_id IS NULL OR user_id = NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
