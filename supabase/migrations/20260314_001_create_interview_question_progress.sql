CREATE TYPE public.interview_question_state AS ENUM (
  'pending',
  'answered',
  'deferred',
  'skipped'
);

ALTER TABLE public.interview_sessions
  ADD COLUMN IF NOT EXISTS catalog_version TEXT,
  ADD COLUMN IF NOT EXISTS active_question_id TEXT;

CREATE TABLE IF NOT EXISTS public.interview_question_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  state public.interview_question_state NOT NULL DEFAULT 'pending',
  asked_count INTEGER NOT NULL DEFAULT 0 CHECK (asked_count >= 0),
  asked_at TIMESTAMPTZ,
  answered_at TIMESTAMPTZ,
  deferred_at TIMESTAMPTZ,
  skipped_at TIMESTAMPTZ,
  answer_memory_id UUID REFERENCES public.memories(id) ON DELETE SET NULL,
  prompt_snapshot TEXT,
  evaluator_summary TEXT,
  answer_excerpt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (interview_session_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_interview_question_progress_session
  ON public.interview_question_progress(interview_session_id, state, question_id);

CREATE INDEX IF NOT EXISTS idx_interview_question_progress_user
  ON public.interview_question_progress(user_id, state, updated_at DESC);

ALTER TABLE public.interview_question_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interview question progress"
  ON public.interview_question_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own interview question progress"
  ON public.interview_question_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interview question progress"
  ON public.interview_question_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interview question progress"
  ON public.interview_question_progress FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER set_interview_question_progress_updated_at
  BEFORE UPDATE ON public.interview_question_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
