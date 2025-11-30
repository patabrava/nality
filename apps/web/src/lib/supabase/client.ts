import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Explicit Error Handling - Fail Fast, Fail Loud
if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL is required')
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
}

// Use createBrowserClient from @supabase/ssr for proper cookie-based session management
// This ensures client and server share the same session via cookies
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Type helper for database operations
export type Database = Record<string, unknown> // Will be replaced with generated types later

// Utility: Fetch current user's profile (including onboarding_complete)
export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, onboarding_complete')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    // PostgREST returns PGRST116 when no rows match – treat as "needs onboarding" instead of an error
    if (error.code === 'PGRST116' || error.message?.toLowerCase().includes('no rows')) {
      console.info('ℹ️ User profile not found yet, treating as not onboarded:', { userId });
      return null;
    }

    console.error('❌ Error fetching user profile:', error);
    return null;
  }

  return data;
}