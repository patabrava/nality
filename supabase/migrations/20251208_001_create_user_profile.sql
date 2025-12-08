-- Migration: Create user_profile table for atemporal attributes
-- Purpose: Store values, influences, motto - data that describes WHO the user is (not timeline events)

-- Create user_profile table
CREATE TABLE IF NOT EXISTS user_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core Values (from Q7 - up to 3 values)
  values text[] DEFAULT ARRAY[]::text[],
  
  -- Life motto or guiding principle (from Q7)
  motto text,
  
  -- Influences - people who shaped their thinking (from Q6)
  -- Structure: [{ "name": "Plato", "type": "philosopher", "why": "..." }]
  influences jsonb DEFAULT '[]'::jsonb,
  
  -- Favorite authors (from Q6)
  favorite_authors text[] DEFAULT ARRAY[]::text[],
  
  -- Role models with traits (from Q6)
  -- Structure: [{ "name": "Grandmother", "relationship": "family", "traits": ["wisdom"] }]
  role_models jsonb DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Ensure one profile per user
  CONSTRAINT user_profile_user_id_unique UNIQUE (user_id)
);

-- Add comment for documentation
COMMENT ON TABLE user_profile IS 'Stores atemporal user attributes like values, influences, and motto - data that describes WHO the user is rather than WHAT happened (life events)';
COMMENT ON COLUMN user_profile.values IS 'Core life values, up to 3 items (e.g., ["Authenticity", "Curiosity", "Empathy"])';
COMMENT ON COLUMN user_profile.motto IS 'Life motto or guiding principle';
COMMENT ON COLUMN user_profile.influences IS 'People who shaped their thinking - JSONB array with name, type, and optional why';
COMMENT ON COLUMN user_profile.role_models IS 'Personal role models - JSONB array with name, relationship, and traits';

-- Index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_user_profile_user_id ON user_profile(user_id);

-- Enable Row Level Security
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own profile
CREATE POLICY "Users can read own profile" 
  ON user_profile 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
  ON user_profile 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON user_profile 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" 
  ON user_profile 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Service role bypass for server-side operations
CREATE POLICY "Service role has full access" 
  ON user_profile 
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profile_updated_at_trigger
  BEFORE UPDATE ON user_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile_updated_at();

-- Validation function for influences JSONB structure
CREATE OR REPLACE FUNCTION validate_influences_structure(influences jsonb)
RETURNS boolean AS $$
BEGIN
  -- Allow empty array
  IF influences = '[]'::jsonb THEN
    RETURN true;
  END IF;
  
  -- Check each element has required 'name' field
  RETURN NOT EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(influences) AS elem
    WHERE elem->>'name' IS NULL OR elem->>'name' = ''
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add check constraint for influences structure
ALTER TABLE user_profile 
  ADD CONSTRAINT user_profile_influences_valid 
  CHECK (validate_influences_structure(influences));

-- Validation function for role_models JSONB structure
CREATE OR REPLACE FUNCTION validate_role_models_structure(role_models jsonb)
RETURNS boolean AS $$
BEGIN
  -- Allow empty array
  IF role_models = '[]'::jsonb THEN
    RETURN true;
  END IF;
  
  -- Check each element has required 'name' field
  RETURN NOT EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(role_models) AS elem
    WHERE elem->>'name' IS NULL OR elem->>'name' = ''
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add check constraint for role_models structure
ALTER TABLE user_profile 
  ADD CONSTRAINT user_profile_role_models_valid 
  CHECK (validate_role_models_structure(role_models));
