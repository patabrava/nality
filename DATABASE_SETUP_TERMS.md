# Database Setup for Terms & Conditions

## Issue Resolution ✅ FIXED

The terms acceptance error has been resolved. The application now properly handles missing database tables with graceful fallbacks.

## Root Cause Identified

The `TermsAcceptance` component was making direct Supabase database calls instead of using the utility functions with fallback logic. This caused crashes when the database table didn't exist.

## Fix Applied

✅ **Component Updated**: TermsAcceptance now uses `recordTermsAcceptance()` utility function  
✅ **Fallback Active**: localStorage used for development when database table missing  
✅ **Error Handling**: Improved error messages for development vs production  
✅ **Console Logging**: Clear feedback about fallback usage in browser console  

## Current Status

✅ **Development Mode**: The application now works without the database table using localStorage fallback  
✅ **Error Fixed**: Terms acceptance no longer crashes the application  
✅ **User Experience**: Users can continue using the application during development  

## Production Setup Required

To fully enable terms acceptance in production, apply this SQL to your Supabase database:

```sql
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First, ensure the basic users table exists
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  onboarding_complete BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create users policies
CREATE POLICY "Users can view own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Now create the terms acceptance table
CREATE TABLE IF NOT EXISTS public.user_terms_acceptance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  terms_version VARCHAR(50) NOT NULL DEFAULT '1.0',
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
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
```

## How to Apply

1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the SQL above
5. Click **Run**

## Development vs Production Behavior

### Development (Current)
- Terms acceptance stored in browser localStorage
- No database table required
- Allows continued development without schema setup

### Production (After SQL Applied)
- Terms acceptance stored in Supabase database
- Full GDPR compliance with audit trail
- Proper user data protection and RLS policies

## Testing the Fix

1. Navigate to `/login` and sign in
2. You should now be redirected to `/terms` (if not accepted) or `/dash` (if accepted via localStorage)
3. Accept terms - they will be stored in localStorage during development
4. Verify redirection to dashboard works properly

The application will automatically detect when the database table exists and switch from localStorage to database storage.
