-- Chat Module Database Schema
-- Creates tables for persistent chat sessions and messages
-- Compatible with AI SDK message structure and chat_tasks.md requirements

-- Chat sessions to group related conversations
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  type TEXT NOT NULL DEFAULT 'onboarding' CHECK (type IN ('onboarding', 'general')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata for session context
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Chat messages compatible with AI SDK CoreMessage structure
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  
  -- Core message fields compatible with AI SDK
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Additional metadata for enhanced features
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Life events extracted from chat conversations
CREATE TABLE chat_extracted_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Extracted event data (will be used to create life_events)
  suggested_title TEXT NOT NULL,
  suggested_description TEXT,
  suggested_date DATE,
  suggested_category TEXT,
  confidence_score FLOAT DEFAULT 0.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_life_event_id UUID REFERENCES life_events(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_type ON chat_sessions(type);
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_role ON chat_messages(role);

CREATE INDEX idx_chat_extracted_events_session_id ON chat_extracted_events(session_id);
CREATE INDEX idx_chat_extracted_events_user_id ON chat_extracted_events(user_id);
CREATE INDEX idx_chat_extracted_events_status ON chat_extracted_events(status);

-- RLS policies for security
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_extracted_events ENABLE ROW LEVEL SECURITY;

-- Chat sessions: users can only see their own sessions
CREATE POLICY "Users can view their own chat sessions"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
  ON chat_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions"
  ON chat_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Chat messages: users can only see messages from their sessions
CREATE POLICY "Users can view messages from their sessions"
  ON chat_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND chat_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can create messages in their sessions"
  ON chat_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND chat_sessions.user_id = auth.uid()
  ));

-- Chat extracted events: users can only see their own extracted events
CREATE POLICY "Users can view their own extracted events"
  ON chat_extracted_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own extracted events"
  ON chat_extracted_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own extracted events"
  ON chat_extracted_events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger for chat_sessions
CREATE OR REPLACE FUNCTION update_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_sessions_updated_at();

-- Function to automatically update session timestamp when messages are added
CREATE OR REPLACE FUNCTION update_session_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions 
  SET updated_at = NOW() 
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_on_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_session_on_message();

-- Comments for documentation
COMMENT ON TABLE chat_sessions IS 'Chat sessions grouping related conversations between users and AI';
COMMENT ON TABLE chat_messages IS 'Individual messages within chat sessions, compatible with AI SDK CoreMessage structure';
COMMENT ON TABLE chat_extracted_events IS 'Life events extracted from chat conversations for timeline integration';

COMMENT ON COLUMN chat_sessions.type IS 'Type of chat session: onboarding for guided timeline creation, general for open conversation';
COMMENT ON COLUMN chat_messages.role IS 'Message role compatible with AI SDK: user, assistant, system, tool';
COMMENT ON COLUMN chat_extracted_events.confidence_score IS 'AI confidence in the extracted event (0.0 to 1.0)';
COMMENT ON COLUMN chat_extracted_events.status IS 'Processing status: pending (awaiting user review), accepted (added to timeline), rejected (dismissed)';
