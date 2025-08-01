-- =====================================================
-- NALITY DATABASE SETUP SCRIPT
-- =====================================================
-- 
-- Instructions:
-- 1. Open your Supabase dashboard
-- 2. Go to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run" to execute
-- 
-- This will create all necessary tables and policies.
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE & FUNCTIONS
-- =====================================================

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users updated_at
DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- LIFE EVENTS TABLE
-- =====================================================

-- Create life_event_category enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'life_event_category') THEN
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
  END IF;
END
$$;

-- Create life_event table
CREATE TABLE IF NOT EXISTS public.life_event (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_life_event_user_id ON public.life_event(user_id);
CREATE INDEX IF NOT EXISTS idx_life_event_start_date ON public.life_event(start_date DESC);

-- Enable RLS
ALTER TABLE public.life_event ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_life_event_updated_at ON public.life_event;
CREATE TRIGGER set_life_event_updated_at
  BEFORE UPDATE ON public.life_event
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- MEDIA OBJECTS TABLE
-- =====================================================

-- Create media_type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
    CREATE TYPE public.media_type AS ENUM (
      'image',
      'video',
      'audio',
      'document'
    );
  END IF;
END
$$;

-- Create media_object table
CREATE TABLE IF NOT EXISTS public.media_object (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_media_object_user_id ON public.media_object(user_id);
CREATE INDEX IF NOT EXISTS idx_media_object_life_event_id ON public.media_object(life_event_id);

-- Enable RLS
ALTER TABLE public.media_object ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_media_object_updated_at ON public.media_object;
CREATE TRIGGER set_media_object_updated_at
  BEFORE UPDATE ON public.media_object
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Users table policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" 
      ON public.users FOR SELECT 
      USING (auth.uid() = id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" 
      ON public.users FOR UPDATE 
      USING (auth.uid() = id);
  END IF;
END
$$;

-- Life events table policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'life_event' AND policyname = 'Users can view own life events') THEN
    CREATE POLICY "Users can view own life events" 
      ON public.life_event FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'life_event' AND policyname = 'Users can create own life events') THEN
    CREATE POLICY "Users can create own life events" 
      ON public.life_event FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'life_event' AND policyname = 'Users can update own life events') THEN
    CREATE POLICY "Users can update own life events" 
      ON public.life_event FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'life_event' AND policyname = 'Users can delete own life events') THEN
    CREATE POLICY "Users can delete own life events" 
      ON public.life_event FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Media objects table policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media_object' AND policyname = 'Users can view own media objects') THEN
    CREATE POLICY "Users can view own media objects" 
      ON public.media_object FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media_object' AND policyname = 'Users can create own media objects') THEN
    CREATE POLICY "Users can create own media objects" 
      ON public.media_object FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media_object' AND policyname = 'Users can update own media objects') THEN
    CREATE POLICY "Users can update own media objects" 
      ON public.media_object FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media_object' AND policyname = 'Users can delete own media objects') THEN
    CREATE POLICY "Users can delete own media objects" 
      ON public.media_object FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check that all tables were created successfully
SELECT 'SUCCESS: All tables created!' as message
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')
  AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'life_event')
  AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media_object');

-- Show created tables
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'life_event', 'media_object')
ORDER BY table_name;
