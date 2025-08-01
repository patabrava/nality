-- ──────────────────────
-- Life Events Table Migration
-- ──────────────────────

-- Create life_event_category enum
CREATE TYPE public.life_event_category AS ENUM (
  'personal',
  'education', 
  'career',
  'family',
  'travel',
  'achievement',
  'health',
  'relationship',
  'other'
);

-- Create life_event table
CREATE TABLE IF NOT EXISTS public.life_event (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL CHECK (length(title) > 0 AND length(title) <= 200),
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_ongoing BOOLEAN DEFAULT FALSE NOT NULL,
  category public.life_event_category DEFAULT 'personal' NOT NULL,
  location TEXT,
  importance INTEGER DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (
    (end_date IS NULL) OR 
    (is_ongoing = TRUE) OR 
    (end_date >= start_date)
  ),
  CONSTRAINT valid_ongoing_logic CHECK (
    (is_ongoing = FALSE AND end_date IS NOT NULL) OR
    (is_ongoing = TRUE) OR
    (is_ongoing = FALSE AND end_date IS NULL)
  )
);

-- Create indexes for performance
CREATE INDEX idx_life_event_user_id ON public.life_event(user_id);
CREATE INDEX idx_life_event_start_date ON public.life_event(start_date DESC);
CREATE INDEX idx_life_event_category ON public.life_event(category);
CREATE INDEX idx_life_event_importance ON public.life_event(importance DESC);

-- Enable RLS
ALTER TABLE public.life_event ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - Owner-scoped access
CREATE POLICY "Users can view own life events" 
  ON public.life_event FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own life events" 
  ON public.life_event FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own life events" 
  ON public.life_event FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own life events" 
  ON public.life_event FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER set_life_event_updated_at
  BEFORE UPDATE ON public.life_event
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
