import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Type helper for database operations
export type Database = Record<string, unknown> // Will be replaced with generated types later

// Utility: Fetch current user's profile (including onboarding_complete)
export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, onboarding_complete')
    .eq('id', userId)
    .single()
  if (error) {
    console.error('❌ Error fetching user profile:', error)
    return null
  }
  return data
} 