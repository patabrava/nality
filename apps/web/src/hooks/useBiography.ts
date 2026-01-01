'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import type { 
  Biography, 
  BiographyToneType,
} from '@nality/schema'

// ──────────────────────
// Hook State Types
// ──────────────────────

interface UseBiographyState {
  biography: Biography | null
  versions: Biography[]
  loading: boolean
  error: string | null
  generating: boolean
}

interface UseBiographyActions {
  refetch: () => Promise<void>
  generate: (tone?: BiographyToneType, chapterIds?: string[]) => Promise<boolean>
  regenerate: (tone?: BiographyToneType) => Promise<boolean>
  updateTone: (tone: BiographyToneType) => Promise<boolean>
  canGenerate: boolean
}

type UseBiographyReturn = UseBiographyState & UseBiographyActions

// ──────────────────────
// Main Hook
// ──────────────────────

export function useBiography(): UseBiographyReturn {
  const { user, isAuthenticated } = useAuth()
  
  const [state, setState] = useState<UseBiographyState>({
    biography: null,
    versions: [],
    loading: true,
    error: null,
    generating: false,
  })

  const [chapterCount, setChapterCount] = useState(0)

  // Fetch current biography
  const fetchBiography = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setState(prev => ({ ...prev, loading: false, biography: null }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Fetch current biography
      const response = await fetch('/api/biography')
      const result = await response.json()

      if (!result.success && response.status !== 200) {
        throw new Error(result.error)
      }

      // Fetch all versions
      const versionsResponse = await fetch('/api/biography?all=true')
      const versionsResult = await versionsResponse.json()

      // Get chapter count to determine if we can generate
      const chaptersResponse = await fetch('/api/chapters')
      const chaptersResult = await chaptersResponse.json()
      setChapterCount(chaptersResult.data?.length || 0)

      setState(prev => ({
        ...prev,
        biography: result.data || null,
        versions: versionsResult.data || [],
        loading: false,
        error: null,
      }))
    } catch (error) {
      console.error('Error fetching biography:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch biography',
      }))
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    fetchBiography()
  }, [fetchBiography])

  // Generate new biography
  const generate = useCallback(async (
    tone: BiographyToneType = 'neutral',
    chapterIds?: string[]
  ): Promise<boolean> => {
    if (!user) return false

    setState(prev => ({ ...prev, generating: true }))

    try {
      const response = await fetch('/api/biography/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tone,
          chapter_ids: chapterIds,
        }),
      })

      const result = await response.json()

      if (!result.success) throw new Error(result.error)

      // Refresh biography
      await fetchBiography()

      setState(prev => ({ ...prev, generating: false }))
      return true
    } catch (error) {
      console.error('Error generating biography:', error)
      setState(prev => ({ ...prev, generating: false }))
      return false
    }
  }, [user, fetchBiography])

  // Regenerate biography with same or different tone
  const regenerate = useCallback(async (tone?: BiographyToneType): Promise<boolean> => {
    if (!user) return false

    setState(prev => ({ ...prev, generating: true }))

    try {
      const response = await fetch('/api/biography/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tone: tone || state.biography?.tone || 'neutral',
          regenerate: true,
        }),
      })

      const result = await response.json()

      if (!result.success) throw new Error(result.error)

      // Refresh biography
      await fetchBiography()

      setState(prev => ({ ...prev, generating: false }))
      return true
    } catch (error) {
      console.error('Error regenerating biography:', error)
      setState(prev => ({ ...prev, generating: false }))
      return false
    }
  }, [user, state.biography?.tone, fetchBiography])

  // Update tone (regenerate with new tone)
  const updateTone = useCallback(async (tone: BiographyToneType): Promise<boolean> => {
    return regenerate(tone)
  }, [regenerate])

  // Check if we can generate (need at least 1 chapter)
  const canGenerate = chapterCount >= 1

  return {
    ...state,
    refetch: fetchBiography,
    generate,
    regenerate,
    updateTone,
    canGenerate,
  }
}
