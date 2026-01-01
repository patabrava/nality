-- ══════════════════════════════════════════════════════════════════════════════
-- MEMORY SYSTEM MIGRATION
-- New UX: Voice-first memory capture with atomic memories
-- ══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE public.memory_capture_mode AS ENUM ('interview', 'free_talk', 'text');
CREATE TYPE public.memory_processing_status AS ENUM ('pending', 'processing', 'complete', 'failed');
CREATE TYPE public.chapter_status AS ENUM ('draft', 'published');
CREATE TYPE public.biography_tone AS ENUM ('neutral', 'poetic', 'formal');

-- ─────────────────────────────────────────────────────────────────────────────
-- CHAPTERS TABLE (must be created first for FK references)
-- Emergent chapters generated from memory clusters
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- AI-generated content
  title TEXT NOT NULL,
  summary TEXT,
  
  -- Time boundaries (inferred from memories)
  time_range_start DATE,
  time_range_end DATE,
  
  -- State management
  status public.chapter_status DEFAULT 'draft' NOT NULL,
  
  -- Clustering metadata
  theme_keywords TEXT[] DEFAULT '{}',
  memory_count INTEGER DEFAULT 0,
  
  -- Display order for UI
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_chapters_user ON public.chapters(user_id, display_order);
CREATE INDEX idx_chapters_status ON public.chapters(user_id, status);

-- Enable RLS
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own chapters" 
  ON public.chapters FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chapters" 
  ON public.chapters FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chapters" 
  ON public.chapters FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chapters" 
  ON public.chapters FOR DELETE 
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER set_chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- INTERVIEW SESSIONS TABLE
-- Groups related Q&A exchanges from interview mode
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session metadata
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  
  -- Topics covered in this interview
  topics_covered TEXT[] DEFAULT '{}',
  
  -- Total Q&A pairs captured
  memory_count INTEGER DEFAULT 0,
  
  -- Processing status for the entire session
  processing_status public.memory_processing_status DEFAULT 'pending' NOT NULL,
  
  -- Session summary (generated after processing)
  summary TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_interview_sessions_user ON public.interview_sessions(user_id, started_at DESC);
CREATE INDEX idx_interview_sessions_status ON public.interview_sessions(user_id, processing_status);

-- Enable RLS
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own interview sessions" 
  ON public.interview_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own interview sessions" 
  ON public.interview_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interview sessions" 
  ON public.interview_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interview sessions" 
  ON public.interview_sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER set_interview_sessions_updated_at
  BEFORE UPDATE ON public.interview_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- MEMORIES TABLE
-- Atomic memory units - core of the new UX
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core content
  raw_transcript TEXT NOT NULL,
  cleaned_content TEXT,
  
  -- Temporal organization (primary organizer for feed)
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Capture mode (determines preprocessing strategy)
  capture_mode public.memory_capture_mode NOT NULL DEFAULT 'free_talk',
  
  -- Interview-specific fields (populated only for interview mode)
  interview_session_id UUID REFERENCES public.interview_sessions(id) ON DELETE SET NULL,
  interview_question TEXT,
  interview_topic TEXT,
  
  -- System-inferred metadata (extracted async during preprocessing)
  people TEXT[] DEFAULT '{}',
  places TEXT[] DEFAULT '{}',
  topics TEXT[] DEFAULT '{}',
  emotions JSONB DEFAULT '{}',
  
  -- Suggested destinations (from preprocessing)
  suggested_category TEXT,
  suggested_chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  suggestion_confidence FLOAT DEFAULT 0.0 CHECK (suggestion_confidence >= 0.0 AND suggestion_confidence <= 1.0),
  
  -- Capture source
  source TEXT NOT NULL DEFAULT 'voice' CHECK (source IN ('voice', 'text')),
  
  -- Processing state
  processing_status public.memory_processing_status DEFAULT 'pending' NOT NULL,
  processed_at TIMESTAMPTZ,
  
  -- Final chapter assignment (nullable until chapters exist or user confirms)
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for feed performance
CREATE INDEX idx_memories_user_captured ON public.memories(user_id, captured_at DESC);
CREATE INDEX idx_memories_processing ON public.memories(user_id, processing_status) WHERE processing_status != 'complete';
CREATE INDEX idx_memories_interview_session ON public.memories(interview_session_id) WHERE interview_session_id IS NOT NULL;
CREATE INDEX idx_memories_capture_mode ON public.memories(user_id, capture_mode);
CREATE INDEX idx_memories_chapter ON public.memories(chapter_id) WHERE chapter_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own memories" 
  ON public.memories FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own memories" 
  ON public.memories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories" 
  ON public.memories FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories" 
  ON public.memories FOR DELETE 
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER set_memories_updated_at
  BEFORE UPDATE ON public.memories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- BIOGRAPHIES TABLE
-- Generated narrative documents from chapters
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.biographies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Generated content
  content TEXT NOT NULL,
  tone public.biography_tone DEFAULT 'neutral' NOT NULL,
  
  -- Version management
  version INTEGER DEFAULT 1 NOT NULL,
  is_current BOOLEAN DEFAULT true NOT NULL,
  
  -- Source chapters used
  chapter_ids UUID[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_biographies_user ON public.biographies(user_id, is_current, version DESC);
CREATE INDEX idx_biographies_current ON public.biographies(user_id) WHERE is_current = true;

-- Enable RLS
ALTER TABLE public.biographies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own biographies" 
  ON public.biographies FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own biographies" 
  ON public.biographies FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own biographies" 
  ON public.biographies FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own biographies" 
  ON public.biographies FOR DELETE 
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER set_biographies_updated_at
  BEFORE UPDATE ON public.biographies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Function to update chapter memory count
CREATE OR REPLACE FUNCTION public.update_chapter_memory_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old chapter if changing assignment
  IF TG_OP = 'UPDATE' AND OLD.chapter_id IS DISTINCT FROM NEW.chapter_id THEN
    IF OLD.chapter_id IS NOT NULL THEN
      UPDATE public.chapters 
      SET memory_count = (
        SELECT COUNT(*) FROM public.memories WHERE chapter_id = OLD.chapter_id
      )
      WHERE id = OLD.chapter_id;
    END IF;
  END IF;
  
  -- Update new chapter
  IF NEW.chapter_id IS NOT NULL THEN
    UPDATE public.chapters 
    SET memory_count = (
      SELECT COUNT(*) FROM public.memories WHERE chapter_id = NEW.chapter_id
    )
    WHERE id = NEW.chapter_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for memory count updates
CREATE TRIGGER update_chapter_memory_count_trigger
  AFTER INSERT OR UPDATE OF chapter_id ON public.memories
  FOR EACH ROW EXECUTE FUNCTION public.update_chapter_memory_count();

-- Function to update interview session memory count
CREATE OR REPLACE FUNCTION public.update_interview_session_memory_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.interview_session_id IS NOT NULL THEN
    UPDATE public.interview_sessions 
    SET memory_count = (
      SELECT COUNT(*) FROM public.memories WHERE interview_session_id = NEW.interview_session_id
    )
    WHERE id = NEW.interview_session_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for interview session memory count
CREATE TRIGGER update_interview_session_memory_count_trigger
  AFTER INSERT ON public.memories
  FOR EACH ROW 
  WHEN (NEW.interview_session_id IS NOT NULL)
  EXECUTE FUNCTION public.update_interview_session_memory_count();

-- ─────────────────────────────────────────────────────────────────────────────
-- COMMENTS
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON TABLE public.memories IS 'Atomic memory units - raw voice/text captures with minimal structure. Core of the new voice-first UX.';
COMMENT ON TABLE public.chapters IS 'Emergent chapters generated from memory clusters based on time, semantic similarity, and emotional tone.';
COMMENT ON TABLE public.interview_sessions IS 'Groups related Q&A exchanges from interview mode capture sessions.';
COMMENT ON TABLE public.biographies IS 'Generated narrative documents created from chapters. Supports versioning and tone selection.';

COMMENT ON COLUMN public.memories.capture_mode IS 'interview: structured Q&A, free_talk: unstructured voice, text: written input';
COMMENT ON COLUMN public.memories.processing_status IS 'pending: awaiting NLP processing, processing: in progress, complete: done, failed: error';
COMMENT ON COLUMN public.memories.suggested_category IS 'AI-inferred category (family, career, education, etc.) from preprocessing';
COMMENT ON COLUMN public.chapters.status IS 'draft: system-generated awaiting review, published: user-confirmed';
