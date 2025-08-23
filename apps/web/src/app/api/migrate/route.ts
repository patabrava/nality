import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Ensure this route is always dynamic and runs on Node.js runtime
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
  return createClient(url, key)
}

const migrations = [
  {
    name: 'create_users',
    sql: `-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();`
  },
  {
    name: 'create_life_events', 
    sql: `-- Create life_event_category enum
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
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();`
  },
  {
    name: 'create_media_objects',
    sql: `-- Create media_type enum
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
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();`
  },
  {
    name: 'create_rls_policies',
    sql: `-- Users table policies
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
$$;`
  }
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'run_all') {
      // For now, return instructions since direct SQL execution isn't available via client
      return NextResponse.json({ 
        success: false,
        error: 'Direct migration execution not supported via web client. Please use the MCP server or Supabase dashboard to run migrations.',
        instructions: 'Run the following SQL commands in your Supabase SQL editor:\n\n' + 
                     migrations.map(m => `-- ${m.name}\n${m.sql}`).join('\n\n---\n\n'),
        migrations: migrations.map(m => ({ name: m.name, status: 'pending' }))
      })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid action' 
    }, { status: 400 })
    
  } catch (error: any) {
    console.error('Migration API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    // Test connection and return database info
    const { data, error } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        hint: 'Connection failed. Check service role key and database permissions.'
      }, { status: 500 })
    }
    
    const tableNames = data?.map(t => t.table_name) || []
    const hasLifeEvent = tableNames.includes('life_event')
    
    return NextResponse.json({ 
      success: true, 
      tables: tableNames,
      migrations: migrations.map(m => m.name),
      database_ready: hasLifeEvent,
      instructions: hasLifeEvent 
        ? 'Database is ready!' 
        : 'Database needs setup. Run migrations in Supabase SQL editor or use MCP server.'
    })
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
