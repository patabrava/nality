'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import type { 
  Chapter, 
  ChapterInput, 
  ChapterUpdate,
  ChapterWithMemories,
} from '@nality/schema'

// ──────────────────────
// Hook State Types
// ──────────────────────

interface UseChaptersState {
  chapters: Chapter[]
  loading: boolean
  error: string | null
  generating: boolean
}

interface UseChaptersActions {
  refetch: () => Promise<void>
  createChapter: (input: Partial<ChapterInput>) => Promise<Chapter | null>
  updateChapter: (id: string, updates: ChapterUpdate) => Promise<Chapter | null>
  deleteChapter: (id: string) => Promise<boolean>
  generateChapters: (forceRegenerate?: boolean) => Promise<boolean>
  canGenerateChapters: boolean
}

type UseChaptersReturn = UseChaptersState & UseChaptersActions

interface UseChaptersOptions {
  status?: 'draft' | 'published'
}

// ──────────────────────
// Main Hook
// ──────────────────────

export function useChapters(options: UseChaptersOptions = {}): UseChaptersReturn {
  const { status } = options
  const { user, isAuthenticated } = useAuth()
  
  const [state, setState] = useState<UseChaptersState>({
    chapters: [],
    loading: true,
    error: null,
    generating: false,
  })

  const [memoryCount, setMemoryCount] = useState(0)

  // Fetch chapters
  const fetchChapters = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setState(prev => ({ ...prev, loading: false, chapters: [] }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      let query = supabase
        .from('chapters')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error

      // Also get memory count for canGenerateChapters
      const { count } = await supabase
        .from('memories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      setMemoryCount(count || 0)

      setState(prev => ({
        ...prev,
        chapters: data || [],
        loading: false,
        error: null,
      }))
    } catch (error) {
      console.error('Error fetching chapters:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch chapters',
      }))
    }
  }, [isAuthenticated, user, status])

  useEffect(() => {
    fetchChapters()
  }, [fetchChapters])

  // Create chapter
  const createChapter = useCallback(async (input: Partial<ChapterInput>): Promise<Chapter | null> => {
    if (!user) return null

    try {
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      const result = await response.json()

      if (!result.success) throw new Error(result.error)

      // Optimistic update
      setState(prev => ({
        ...prev,
        chapters: [...prev.chapters, result.data],
      }))

      return result.data
    } catch (error) {
      console.error('Error creating chapter:', error)
      return null
    }
  }, [user])

  // Update chapter
  const updateChapter = useCallback(async (id: string, updates: ChapterUpdate): Promise<Chapter | null> => {
    if (!user) return null

    try {
      const response = await fetch(`/api/chapters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const result = await response.json()

      if (!result.success) throw new Error(result.error)

      // Update in state
      setState(prev => ({
        ...prev,
        chapters: prev.chapters.map(ch => ch.id === id ? result.data : ch),
      }))

      return result.data
    } catch (error) {
      console.error('Error updating chapter:', error)
      return null
    }
  }, [user])

  // Delete chapter
  const deleteChapter = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false

    try {
      const response = await fetch(`/api/chapters/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.success) throw new Error(result.error)

      // Remove from state
      setState(prev => ({
        ...prev,
        chapters: prev.chapters.filter(ch => ch.id !== id),
      }))

      return true
    } catch (error) {
      console.error('Error deleting chapter:', error)
      return false
    }
  }, [user])

  // Generate chapters using AI
  const generateChapters = useCallback(async (forceRegenerate: boolean = false): Promise<boolean> => {
    if (!user) return false

    setState(prev => ({ ...prev, generating: true }))

    try {
      const response = await fetch('/api/chapters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force_regenerate: forceRegenerate }),
      })

      const result = await response.json()

      if (!result.success) throw new Error(result.error)

      // Refresh chapters
      await fetchChapters()

      setState(prev => ({ ...prev, generating: false }))
      return true
    } catch (error) {
      console.error('Error generating chapters:', error)
      setState(prev => ({ ...prev, generating: false }))
      return false
    }
  }, [user, fetchChapters])

  // Check if we can generate chapters (need at least 5 memories)
  const canGenerateChapters = memoryCount >= 5 && state.chapters.length === 0

  return {
    ...state,
    refetch: fetchChapters,
    createChapter,
    updateChapter,
    deleteChapter,
    generateChapters,
    canGenerateChapters,
  }
}

// ──────────────────────
// Single Chapter Hook
// ──────────────────────

interface UseChapterState {
  chapter: ChapterWithMemories | null
  loading: boolean
  error: string | null
}

interface UseChapterActions {
  refetch: () => Promise<void>
  updateChapter: (updates: ChapterUpdate) => Promise<Chapter | null>
}

type UseChapterReturn = UseChapterState & UseChapterActions

export function useChapter(chapterId: string): UseChapterReturn {
  const { user, isAuthenticated } = useAuth()
  
  const [state, setState] = useState<UseChapterState>({
    chapter: null,
    loading: true,
    error: null,
  })

  const fetchChapter = useCallback(async () => {
    if (!isAuthenticated || !user || !chapterId) {
      setState(prev => ({ ...prev, loading: false, chapter: null }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch(`/api/chapters/${chapterId}`)
      const result = await response.json()

      if (!result.success) throw new Error(result.error)

      setState(prev => ({
        ...prev,
        chapter: result.data,
        loading: false,
        error: null,
      }))
    } catch (error) {
      console.error('Error fetching chapter:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch chapter',
      }))
    }
  }, [isAuthenticated, user, chapterId])

  useEffect(() => {
    fetchChapter()
  }, [fetchChapter])

  const updateChapter = useCallback(async (updates: ChapterUpdate): Promise<Chapter | null> => {
    if (!user || !chapterId) return null

    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const result = await response.json()

      if (!result.success) throw new Error(result.error)

      setState(prev => ({
        ...prev,
        chapter: prev.chapter ? { ...prev.chapter, ...result.data } : null,
      }))

      return result.data
    } catch (error) {
      console.error('Error updating chapter:', error)
      return null
    }
  }, [user, chapterId])

  return {
    ...state,
    refetch: fetchChapter,
    updateChapter,
  }
}
