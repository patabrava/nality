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

  const signInWithPassword = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
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

  const signUpWithPassword = async (
    email: string,
    password: string,
    options?: {
      redirectTo?: string
      data?: Record<string, unknown>
    }
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const signUpOptions: {
        emailRedirectTo: string
        data?: Record<string, unknown>
      } = {
        emailRedirectTo: options?.redirectTo ?? `${window.location.origin}/auth/callback`
      }

      if (options?.data) {
        signUpOptions.data = options.data
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: signUpOptions
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

  const signInWithGoogle = async (options?: { redirectTo?: string; queryParams?: Record<string, string> }) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const oauthOptions: {
        redirectTo: string
        queryParams?: Record<string, string>
      } = {
        redirectTo: options?.redirectTo ?? `${window.location.origin}/auth/callback`
      }

      if (options?.queryParams) {
        oauthOptions.queryParams = options.queryParams
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: oauthOptions
      })
      
      if (error) {
        setState(prev => ({ ...prev, loading: false, error }))
        return { error }
      }
      
      // OAuth will redirect, so we don't set loading to false here
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
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!state.user
  }
} 
