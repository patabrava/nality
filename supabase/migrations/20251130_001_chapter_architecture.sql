-- ============================================================================
-- CHAPTER ARCHITECTURE MIGRATION
-- Nality Autobiography App - Full Chapter System
-- 
-- This migration:
-- 1. Drops duplicate/unused tables (life_events, media_objects, leads)
-- 2. Extends users table with onboarding profile fields
-- 3. Adds chapter_category to chat_sessions for chapter-specific chats
-- 4. Fixes FK references to use life_event (singular)
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP DUPLICATE/UNUSED TABLES
-- ============================================================================

-- Drop foreign key constraints first
ALTER TABLE IF EXISTS media_objects DROP CONSTRAINT IF EXISTS media_objects_user_id_fkey;
ALTER TABLE IF EXISTS media_objects DROP CONSTRAINT IF EXISTS media_objects_life_event_id_fkey;
ALTER TABLE IF EXISTS life_events DROP CONSTRAINT IF EXISTS life_events_user_id_fkey;

-- Drop the duplicate tables (0 rows, unused)
DROP TABLE IF EXISTS media_objects CASCADE;
DROP TABLE IF EXISTS life_events CASCADE;

-- Drop unrelated leads table
DROP TABLE IF EXISTS leads CASCADE;

-- ============================================================================
-- STEP 2: EXTEND USERS TABLE WITH ONBOARDING PROFILE FIELDS
-- ============================================================================

-- Add form of address enum if not exists
DO $$ BEGIN
  CREATE TYPE form_of_address AS ENUM ('du', 'sie');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add language style enum if not exists  
DO $$ BEGIN
  CREATE TYPE language_style AS ENUM ('prosa', 'fachlich', 'locker');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add onboarding profile columns to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS form_of_address form_of_address,
  ADD COLUMN IF NOT EXISTS language_style language_style DEFAULT 'prosa',
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS birth_place TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Add index for onboarding status queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding_complete ON users(onboarding_complete);

COMMENT ON COLUMN users.form_of_address IS 'User preference for formal (sie) or informal (du) address';
COMMENT ON COLUMN users.language_style IS 'User preference for writing style: prosa (prose), fachlich (formal), locker (casual)';
COMMENT ON COLUMN users.onboarding_complete IS 'Whether user has completed the initial onboarding chat';

-- ============================================================================
-- STEP 3: EXTEND CHAT_SESSIONS FOR CHAPTER CONTEXT
-- ============================================================================

-- Update type check constraint to include 'chapter' type
ALTER TABLE chat_sessions 
  DROP CONSTRAINT IF EXISTS chat_sessions_type_check;

ALTER TABLE chat_sessions 
  ADD CONSTRAINT chat_sessions_type_check 
  CHECK (type IN ('onboarding', 'general', 'chapter'));

-- Add chapter_category column for chapter-specific chat sessions
ALTER TABLE chat_sessions 
  ADD COLUMN IF NOT EXISTS chapter_category life_event_category;

-- Add index for chapter queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_chapter_category ON chat_sessions(chapter_category);

COMMENT ON COLUMN chat_sessions.chapter_category IS 'Category filter for chapter-specific memory chats (null for onboarding/general)';

-- ============================================================================
-- STEP 4: FIX CHAT_EXTRACTED_EVENTS FK REFERENCE
-- ============================================================================

-- The original migration referenced life_events (plural) but the actual table is life_event (singular)
-- Drop the incorrect FK and add the correct one
ALTER TABLE chat_extracted_events 
  DROP CONSTRAINT IF EXISTS chat_extracted_events_created_life_event_id_fkey;

-- Re-add with correct reference to life_event (singular)
ALTER TABLE chat_extracted_events 
  ADD CONSTRAINT chat_extracted_events_created_life_event_id_fkey 
  FOREIGN KEY (created_life_event_id) REFERENCES life_event(id) ON DELETE SET NULL;

-- ============================================================================
-- STEP 5: ADD CHAPTER CONFIGURATION VIEW (Virtual Chapters)
-- ============================================================================

-- Drop view if exists to recreate
DROP VIEW IF EXISTS v_chapters;

-- Create a view that maps categories to user-friendly chapter names
CREATE VIEW v_chapters AS
SELECT 
  'roots'::text AS chapter_id,
  'Roots'::text AS chapter_name,
  'Where I come from'::text AS chapter_subtitle,
  'family'::life_event_category AS primary_category,
  ARRAY['family']::life_event_category[] AS categories,
  1 AS display_order,
  '🌳'::text AS icon
UNION ALL
SELECT 
  'growing_up'::text, 
  'Growing Up'::text, 
  'Who I became'::text,
  'personal'::life_event_category,
  ARRAY['personal']::life_event_category[],
  2,
  '🌅'::text
UNION ALL
SELECT 
  'learning'::text, 
  'Learning'::text, 
  'What shaped my mind'::text,
  'education'::life_event_category,
  ARRAY['education']::life_event_category[],
  3,
  '📚'::text
UNION ALL
SELECT 
  'work'::text, 
  'Work & Purpose'::text, 
  'What I built'::text,
  'career'::life_event_category,
  ARRAY['career', 'achievement']::life_event_category[],
  4,
  '🎯'::text
UNION ALL
SELECT 
  'love'::text, 
  'Love & Bonds'::text, 
  'Who I loved'::text,
  'relationship'::life_event_category,
  ARRAY['relationship']::life_event_category[],
  5,
  '💫'::text
UNION ALL
SELECT 
  'moments'::text, 
  'Life Moments'::text, 
  'What I experienced'::text,
  'travel'::life_event_category,
  ARRAY['travel', 'health', 'other']::life_event_category[],
  6,
  '✨'::text;

COMMENT ON VIEW v_chapters IS 'Virtual chapter configuration mapping life_event categories to user-friendly chapter names';

-- ============================================================================
-- STEP 6: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Drop functions if exist to recreate
DROP FUNCTION IF EXISTS get_chapter_events(UUID, TEXT);
DROP FUNCTION IF EXISTS get_chapter_stats(UUID);

-- Function to get events for a chapter
CREATE OR REPLACE FUNCTION get_chapter_events(
  p_user_id UUID,
  p_chapter_id TEXT
)
RETURNS SETOF life_event AS $$
BEGIN
  RETURN QUERY
  SELECT le.*
  FROM life_event le
  JOIN v_chapters vc ON le.category = ANY(vc.categories)
  WHERE le.user_id = p_user_id
    AND vc.chapter_id = p_chapter_id
  ORDER BY le.start_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count events per chapter for a user
CREATE OR REPLACE FUNCTION get_chapter_stats(p_user_id UUID)
RETURNS TABLE (
  chapter_id TEXT,
  chapter_name TEXT,
  event_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vc.chapter_id,
    vc.chapter_name,
    COALESCE(COUNT(le.id), 0)::BIGINT AS event_count
  FROM v_chapters vc
  LEFT JOIN life_event le ON le.category = ANY(vc.categories) 
    AND (p_user_id IS NULL OR le.user_id = p_user_id)
  GROUP BY vc.chapter_id, vc.chapter_name, vc.display_order
  ORDER BY vc.display_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_chapter_events(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_chapter_stats(UUID) TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
