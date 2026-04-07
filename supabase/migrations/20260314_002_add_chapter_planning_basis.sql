ALTER TABLE public.chapters
  ADD COLUMN IF NOT EXISTS planning_basis JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.chapters.planning_basis IS 'Draft chapter planning evidence and readiness metadata used before user confirmation.';
