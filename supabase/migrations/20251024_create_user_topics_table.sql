-- Create user_topics table for custom topic management
-- This extends the existing category system without breaking backward compatibility

CREATE TABLE IF NOT EXISTS user_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(trim(name)) >= 2 AND length(trim(name)) <= 50),
  category TEXT NULL, -- Maps to legacy categories if applicable
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure unique topic names per user
  UNIQUE(user_id, name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_topics_user_id ON user_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_topics_name ON user_topics(name);

-- Enable RLS (Row Level Security)
ALTER TABLE user_topics ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only access their own topics
CREATE POLICY "Users can view their own topics" ON user_topics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own topics" ON user_topics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topics" ON user_topics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own topics" ON user_topics
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_topics_updated_at
  BEFORE UPDATE ON user_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
