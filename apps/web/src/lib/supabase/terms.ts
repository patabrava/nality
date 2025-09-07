import { supabase } from '@/lib/supabase/client'

export interface TermsAcceptanceStatus {
  hasAccepted: boolean
  acceptedAt?: Date
  termsVersion?: string
}

/**
 * Check if the current user has accepted the terms and conditions
 * @param userId - The user ID to check
 * @param requiredVersion - The minimum terms version required (defaults to '1.0')
 * @returns Promise with acceptance status
 */
export async function checkTermsAcceptance(
  userId: string,
  requiredVersion: string = '1.0'
): Promise<TermsAcceptanceStatus> {
  try {
    const { data, error } = await supabase
      .from('user_terms_acceptance')
      .select('accepted_at, terms_version')
      .eq('user_id', userId)
      .eq('terms_version', requiredVersion)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No record found - user hasn't accepted terms
        return { hasAccepted: false }
      }
      // If table doesn't exist (42P01) or other database errors, 
      // check localStorage fallback for development
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('Terms acceptance table not found - checking localStorage fallback')
        
        // Check localStorage for development fallback
        if (typeof window !== 'undefined') {
          const storageKey = `terms_accepted_${userId}_${requiredVersion}`
          const stored = localStorage.getItem(storageKey)
          if (stored) {
            try {
              const parsedData = JSON.parse(stored)
              return {
                hasAccepted: true,
                acceptedAt: new Date(parsedData.accepted_at),
                termsVersion: parsedData.terms_version
              }
            } catch (parseError) {
              console.warn('Failed to parse stored terms data:', parseError)
            }
          }
        }
        
        return { hasAccepted: false }
      }
      throw error
    }

    return {
      hasAccepted: true,
      acceptedAt: new Date(data.accepted_at),
      termsVersion: data.terms_version
    }
  } catch (error) {
    console.error('Error checking terms acceptance:', error)
    // Check localStorage fallback for development
    if (typeof window !== 'undefined') {
      const storageKey = `terms_accepted_${userId}_${requiredVersion}`
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        try {
          const parsedData = JSON.parse(stored)
          return {
            hasAccepted: true,
            acceptedAt: new Date(parsedData.accepted_at),
            termsVersion: parsedData.terms_version
          }
        } catch (parseError) {
          console.warn('Failed to parse stored terms data:', parseError)
        }
      }
    }
    return { hasAccepted: false }
  }
}

/**
 * Record terms acceptance for a user
 * @param userId - The user ID
 * @param termsVersion - The terms version being accepted
 * @param metadata - Additional metadata (IP, user agent, etc.)
 */
export async function recordTermsAcceptance(
  userId: string,
  termsVersion: string = '1.0',
  metadata?: {
    ipAddress?: string
    userAgent?: string
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_terms_acceptance')
      .insert({
        user_id: userId,
        terms_version: termsVersion,
        ip_address: metadata?.ipAddress || null,
        user_agent: metadata?.userAgent || null
      })

    if (error) {
      // If table doesn't exist, simulate success for development
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('📋 Terms acceptance table not found - development mode: using localStorage fallback')
        // Store in localStorage as temporary fallback for development
        const storageKey = `terms_accepted_${userId}_${termsVersion}`
        localStorage.setItem(storageKey, JSON.stringify({
          accepted_at: new Date().toISOString(),
          terms_version: termsVersion,
          user_agent: metadata?.userAgent || null
        }))
        console.log('✅ Terms acceptance stored in localStorage for development')
        return true
      }
      console.error('Error recording terms acceptance:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error recording terms acceptance:', error)
    // Fallback: store in localStorage for development
    try {
      const storageKey = `terms_accepted_${userId}_${termsVersion}`
      localStorage.setItem(storageKey, JSON.stringify({
        accepted_at: new Date().toISOString(),
        terms_version: termsVersion
      }))
      console.warn('Stored terms acceptance in localStorage as fallback')
      return true
    } catch (storageError) {
      console.error('Failed to store terms acceptance:', storageError)
      return false
    }
  }
}
