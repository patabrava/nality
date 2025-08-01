-- ──────────────────────
-- Media Objects Table Migration
-- ──────────────────────

-- Create media_type enum
CREATE TYPE public.media_type AS ENUM (
  'image',
  'video',
  'audio',
  'document'
);

-- Create media_object table
CREATE TABLE IF NOT EXISTS public.media_object (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  life_event_id UUID REFERENCES public.life_event(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL CHECK (length(storage_path) > 0),
  file_name TEXT NOT NULL CHECK (length(file_name) > 0),
  file_size INTEGER NOT NULL CHECK (file_size > 0),
  mime_type TEXT NOT NULL CHECK (length(mime_type) > 0),
  media_type public.media_type NOT NULL,
  width INTEGER CHECK (width > 0),
  height INTEGER CHECK (height > 0),
  duration_seconds NUMERIC CHECK (duration_seconds > 0),
  thumbnail_path TEXT,
  alt_text TEXT,
  metadata JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_media_object_user_id ON public.media_object(user_id);
CREATE INDEX idx_media_object_life_event_id ON public.media_object(life_event_id);
CREATE INDEX idx_media_object_media_type ON public.media_object(media_type);
CREATE INDEX idx_media_object_created_at ON public.media_object(created_at DESC);

-- Enable RLS
ALTER TABLE public.media_object ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - Owner-scoped access
CREATE POLICY "Users can view own media objects" 
  ON public.media_object FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own media objects" 
  ON public.media_object FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own media objects" 
  ON public.media_object FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own media objects" 
  ON public.media_object FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER set_media_object_updated_at
  BEFORE UPDATE ON public.media_object
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
