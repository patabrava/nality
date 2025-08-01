'use client'

import { useState } from 'react'

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

-- Create users policies
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

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
  ),
  CONSTRAINT valid_ongoing_logic CHECK (
    (is_ongoing = FALSE AND end_date IS NOT NULL) OR
    (is_ongoing = TRUE) OR
    (is_ongoing = FALSE AND end_date IS NULL)
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_life_event_user_id ON public.life_event(user_id);
CREATE INDEX IF NOT EXISTS idx_life_event_start_date ON public.life_event(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_life_event_category ON public.life_event(category);
CREATE INDEX IF NOT EXISTS idx_life_event_importance ON public.life_event(importance DESC);

-- Enable RLS
ALTER TABLE public.life_event ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - Owner-scoped access
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
CREATE INDEX IF NOT EXISTS idx_media_object_media_type ON public.media_object(media_type);
CREATE INDEX IF NOT EXISTS idx_media_object_created_at ON public.media_object(created_at DESC);

-- Enable RLS
ALTER TABLE public.media_object ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - Owner-scoped access
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

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_media_object_updated_at ON public.media_object;
CREATE TRIGGER set_media_object_updated_at
  BEFORE UPDATE ON public.media_object
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();`
  }
]

export default function DatabaseSetupPage() {
  const [status, setStatus] = useState<Record<string, 'pending' | 'running' | 'success' | 'error'>>({})
  const [logs, setLogs] = useState<string[]>([])
  const [databaseStatus, setDatabaseStatus] = useState<{
    ready: boolean
    tables: string[]
    error?: string
  }>({ ready: false, tables: [] })

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const checkDatabaseStatus = async () => {
    addLog('🔍 Checking database status...')
    try {
      const response = await fetch('/api/migrate')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setDatabaseStatus({
          ready: result.database_ready,
          tables: result.tables
        })
        addLog(`✅ Database check completed. Ready: ${result.database_ready}`)
        addLog(`📊 Found tables: ${result.tables.join(', ') || 'none'}`)
      } else {
        setDatabaseStatus({
          ready: false,
          tables: [],
          error: result.error
        })
        addLog(`❌ Database check failed: ${result.error}`)
      }
    } catch (error: any) {
      addLog(`❌ Database check failed: ${error.message}`)
      setDatabaseStatus({
        ready: false,
        tables: [],
        error: error.message
      })
    }
  }

  const openSupabaseDashboard = () => {
    window.open('https://supabase.com/dashboard/project/kjtpqfylijhbetpguntr/sql/new', '_blank')
  }

  const copySetupScript = async () => {
    try {
      const response = await fetch('/database_setup.sql')
      const sqlScript = await response.text()
      
      await navigator.clipboard.writeText(sqlScript)
      addLog('📋 Setup script copied to clipboard!')
    } catch (error) {
      addLog('❌ Failed to copy setup script')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Database Setup & Migration
          </h1>
          <p className="text-gray-600 mb-8">
            Initialize your Nality database with the required tables and policies.
          </p>
          
          {/* Status Card */}
          <div className={`mb-6 p-4 rounded-lg border-2 ${
            databaseStatus.ready 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">
                {databaseStatus.ready ? '✅' : '⚠️'}
              </span>
              <h2 className="text-lg font-semibold">
                Database Status: {databaseStatus.ready ? 'Ready' : 'Needs Setup'}
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              {databaseStatus.ready 
                ? `Found ${databaseStatus.tables.length} tables: ${databaseStatus.tables.join(', ')}`
                : 'The life_event table and related schema need to be created.'
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={checkDatabaseStatus}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              🔍 Check Database Status
            </button>
            
            <button
              onClick={openSupabaseDashboard}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              🚀 Open Supabase SQL Editor
            </button>
            
            <button
              onClick={copySetupScript}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              📋 Copy Setup Script
            </button>
          </div>

          {/* Instructions */}
          {!databaseStatus.ready && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                🔧 Setup Instructions
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Click "Open Supabase SQL Editor" above to open your dashboard</li>
                <li>Click "Copy Setup Script" to copy the database setup SQL</li>
                <li>Paste the SQL script in the Supabase SQL Editor</li>
                <li>Click "Run" to execute the script</li>
                <li>Return here and click "Check Database Status" to verify</li>
              </ol>
            </div>
          )}

          {/* Success Message */}
          {databaseStatus.ready && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                🎉 Database Ready!
              </h3>
              <p className="text-green-800">
                Your database is properly configured. You can now use the timeline feature.
              </p>
              <a 
                href="/timeline" 
                className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Go to Timeline →
              </a>
            </div>
          )}

          {/* Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Setup Progress</h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))}
                {logs.length === 0 && (
                  <div className="text-gray-500">Click "Check Database Status" to start...</div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">What Gets Created</h2>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                  <strong>users table</strong><br/>
                  User profiles linked to Supabase auth
                </div>
                <div className="p-3 bg-gray-50 rounded border-l-4 border-green-500">
                  <strong>life_event table</strong><br/>
                  Core timeline events with dates, categories, and metadata
                </div>
                <div className="p-3 bg-gray-50 rounded border-l-4 border-purple-500">
                  <strong>media_object table</strong><br/>
                  Images, videos, and documents linked to events
                </div>
                <div className="p-3 bg-gray-50 rounded border-l-4 border-yellow-500">
                  <strong>RLS Policies</strong><br/>
                  Row-level security ensuring users only see their own data
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
