'use client'

import { useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { normalizeSignUpError } from '@/hooks/useAuthErrors'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: AuthError | null
}

function buildAuthError(message: string, code: string, status = 400): AuthError {
  return new AuthError(message, status, code)
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

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: signUpOptions
      })
      
      if (error) {
        const normalizedError = normalizeSignUpError(error)
        console.error('Sign-up failed', {
          code: (normalizedError as { code?: string }).code,
          status: (normalizedError as { status?: number }).status,
          message: normalizedError.message,
          emailRedirectTo: signUpOptions.emailRedirectTo,
        })
        setState(prev => ({ ...prev, loading: false, error: normalizedError }))
        return { error: normalizedError }
      }

      const hasIdentities = Array.isArray(data.user?.identities) && data.user.identities.length > 0
      if (!data.session && !hasIdentities) {
        const existingAccountError = buildAuthError(
          'Für diese E-Mail existiert bereits ein Konto oder eine ausstehende Registrierung. Bitte einloggen oder Passwort zurücksetzen.',
          'signup_existing_or_obfuscated',
          409
        )
        console.warn('Sign-up returned obfuscated/no-identity user response', {
          code: (existingAccountError as { code?: string }).code,
          emailRedirectTo: signUpOptions.emailRedirectTo,
        })
        setState(prev => ({ ...prev, loading: false, error: existingAccountError }))
        return { error: existingAccountError }
      }
      
      setState(prev => ({ ...prev, loading: false }))
      return { error: null }
    } catch (error) {
      const authError = normalizeSignUpError(error as AuthError)
      console.error('Sign-up exception', {
        code: (authError as { code?: string }).code,
        status: (authError as { status?: number }).status,
        message: authError.message,
      })
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
