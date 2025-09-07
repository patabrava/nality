-- Create user_terms_acceptance table
CREATE TABLE IF NOT EXISTS public.user_terms_acceptance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  terms_version varchar(50) NOT NULL DEFAULT '1.0',
  accepted_at timestamp with time zone DEFAULT now() NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  -- Ensure one acceptance record per user per terms version
  UNIQUE(user_id, terms_version)
);

-- Enable RLS
ALTER TABLE public.user_terms_acceptance ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see and insert their own terms acceptance
CREATE POLICY "Users can view own terms acceptance" ON public.user_terms_acceptance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own terms acceptance" ON public.user_terms_acceptance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_terms_acceptance_user_id ON public.user_terms_acceptance(user_id);
CREATE INDEX IF NOT EXISTS idx_user_terms_acceptance_user_version ON public.user_terms_acceptance(user_id, terms_version);

-- Grant permissions
GRANT SELECT, INSERT ON public.user_terms_acceptance TO authenticated;
GRANT USAGE ON SEQUENCE user_terms_acceptance_id_seq TO authenticated;
