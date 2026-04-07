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
  exporting: boolean
}

interface UseBiographyActions {
  refetch: () => Promise<void>
  generate: (tone?: BiographyToneType, chapterIds?: string[]) => Promise<boolean>
  regenerate: (tone?: BiographyToneType) => Promise<boolean>
  updateTone: (tone: BiographyToneType) => Promise<boolean>
  exportPdf: () => Promise<boolean>
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
    exporting: false,
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
      const chaptersResponse = await fetch('/api/chapters?status=published')
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
        error: error instanceof Error ? error.message : 'Die Biografie konnte nicht geladen werden',
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

  const exportPdf = useCallback(async (): Promise<boolean> => {
    if (!user || !state.biography) return false

    setState(prev => ({ ...prev, exporting: true, error: null }))

    try {
      const response = await fetch('/api/biography/export', {
        method: 'GET',
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || 'Die Biografie konnte nicht exportiert werden')
      }

      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition') || ''
      const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition)
      const filename = filenameMatch?.[1] || `nality-biography-v${state.biography.version}.pdf`
      const downloadUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = downloadUrl
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)

      setState(prev => ({ ...prev, exporting: false }))
      return true
    } catch (error) {
      console.error('Error exporting biography:', error)
      setState(prev => ({
        ...prev,
        exporting: false,
        error: error instanceof Error ? error.message : 'Die Biografie konnte nicht exportiert werden',
      }))
      return false
    }
  }, [user, state.biography])

  // Check if we can generate (need at least 1 chapter)
  const canGenerate = chapterCount >= 1

  return {
    ...state,
    refetch: fetchBiography,
    generate,
    regenerate,
    updateTone,
    exportPdf,
    canGenerate,
  }
}
