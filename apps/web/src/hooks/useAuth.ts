'use client'

import { useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: AuthError | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        setState({
          user: session?.user ?? null,
          session,
          loading: false,
          error
        })
      } catch (error) {
        setState({
          user: null,
          session: null,
          loading: false,
          error: error as AuthError
        })
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null
        })
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithEmail = async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        setState(prev => ({ ...prev, loading: false, error }))
        return { error }
      }
      
      setState(prev => ({ ...prev, loading: false }))
      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      setState(prev => ({ ...prev, loading: false, error: authError }))
      return { error: authError }
    }
  }

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setState(prev => ({ ...prev, loading: false, error }))
        return { error }
      }
      
      setState({
        user: null,
        session: null,
        loading: false,
        error: null
      })
      
      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      setState(prev => ({ ...prev, loading: false, error: authError }))
      return { error: authError }
    }
  }

  return {
    ...state,
    signInWithEmail,
    signOut,
    isAuthenticated: !!state.user
  }
} 