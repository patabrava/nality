import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: {
          getItem: (key: string) => {
            return cookieStore.get(key)?.value ?? null
          },
          setItem: (key: string, value: string) => {
            cookieStore.set(key, value, {
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production'
            })
          },
          removeItem: (key: string) => {
            cookieStore.set(key, '', {
              path: '/',
              sameSite: 'lax',
              expires: new Date(0)
            })
          },
        },
        autoRefreshToken: true,
        persistSession: true,
      },
    }
  )
} 