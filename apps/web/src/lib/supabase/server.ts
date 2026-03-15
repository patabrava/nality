import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getRequiredEnv } from '@/lib/server/env'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

/**
 * Create a service role client that bypasses RLS
 * Use only for server-side operations where user is already validated
 */
export async function createServiceClient() {
  const { createClient } = await import('@supabase/supabase-js')
  
  const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
  
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
} 
