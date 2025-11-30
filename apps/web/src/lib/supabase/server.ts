import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  // Debug: Check if values are loading correctly
  console.log('🔧 Service Client Debug:')
  console.log('  - URL:', supabaseUrl)
  console.log('  - URL length:', supabaseUrl?.length || 0)
  console.log('  - Key length:', serviceKey?.length || 0)
  console.log('  - Key starts with:', serviceKey?.substring(0, 20) || 'N/A')
  console.log('  - Key ends with:', serviceKey?.substring(serviceKey.length - 10) || 'N/A')
  
  if (!supabaseUrl || !supabaseUrl.includes('supabase.co')) {
    console.error('⚠️ SUPABASE_URL appears invalid:', supabaseUrl)
  }
  
  if (!serviceKey || serviceKey.length < 100) {
    console.error('⚠️ SERVICE_KEY appears invalid, length:', serviceKey?.length || 0)
  }
  
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
} 