'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import { evaluateNarrativeReadiness } from '@/features/chapter-planning/readiness'
import type { NarrativeReadiness } from '@/features/chapter-planning/contracts'
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
  draftChapters: Chapter[]
  publishedChapters: Chapter[]
  readiness: NarrativeReadiness | null
  loading: boolean
  error: string | null
  generating: boolean
  confirming: boolean
}

interface UseChaptersActions {
  refetch: () => Promise<void>
  createChapter: (input: Partial<ChapterInput>) => Promise<Chapter | null>
  updateChapter: (id: string, updates: ChapterUpdate) => Promise<Chapter | null>
  deleteChapter: (id: string) => Promise<boolean>
  generateChapters: (forceRegenerate?: boolean) => Promise<boolean>
  confirmDraftChapters: (chapterIds?: string[]) => Promise<boolean>
  canGenerateChapters: boolean
  hasDraftChapters: boolean
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
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  
  const [state, setState] = useState<UseChaptersState>({
    chapters: [],
    draftChapters: [],
    publishedChapters: [],
    readiness: null,
    loading: true,
    error: null,
    generating: false,
    confirming: false,
  })

  // Fetch chapters
  const fetchChapters = useCallback(async () => {
    if (authLoading) {
      return
    }

    if (!isAuthenticated || !user) {
      setState(prev => ({
        ...prev,
        chapters: [],
        draftChapters: [],
        publishedChapters: [],
        readiness: null,
        loading: false,
      }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const [
        { data: allChapters, error: chaptersError },
        { data: memories, error: memoriesError },
        { data: progressRows, error: progressError },
      ] = await Promise.all([
        supabase
          .from('chapters')
          .select('*')
          .eq('user_id', user.id)
          .order('display_order', { ascending: true }),
        supabase
          .from('memories')
          .select(
            'id, raw_transcript, cleaned_content, captured_at, interview_topic, interview_question, topics, chapter_id, processing_status',
          )
          .eq('user_id', user.id)
          .order('captured_at', { ascending: true }),
        supabase
          .from('interview_question_progress')
          .select('question_id, topic_id, state, answer_excerpt, answered_at, answer_memory_id')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: true }),
      ])

      if (chaptersError) throw chaptersError
      if (memoriesError) throw memoriesError
      if (progressError) throw progressError

      const chapters = (allChapters || []) as Chapter[]
      const draftChapters = chapters.filter(chapter => chapter.status === 'draft')
      const publishedChapters = chapters.filter(chapter => chapter.status === 'published')
      const visibleChapters = status
        ? chapters.filter(chapter => chapter.status === status)
        : chapters
      const readiness = evaluateNarrativeReadiness(progressRows || [], memories || [])

      setState(prev => ({
        ...prev,
        chapters: visibleChapters,
        draftChapters,
        publishedChapters,
        readiness,
        loading: false,
        error: null,
      }))
    } catch (error) {
      console.error('Error fetching chapters:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Die Kapitel konnten nicht geladen werden',
      }))
    }
  }, [authLoading, isAuthenticated, user, status])

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

    setState(prev => ({ ...prev, generating: true, error: null }))

    try {
      const response = await fetch('/api/chapters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force_regenerate: forceRegenerate }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) throw new Error(result.error || 'Die Kapitel konnten nicht erstellt werden')

      await fetchChapters()

      setState(prev => ({ ...prev, generating: false }))
      return Boolean(result.data?.ready)
    } catch (error) {
      console.error('Error generating chapters:', error)
      setState(prev => ({
        ...prev,
        generating: false,
        error: error instanceof Error ? error.message : 'Die Kapitel konnten nicht erstellt werden',
      }))
      return false
    }
  }, [user, fetchChapters])

  const confirmDraftChapters = useCallback(async (chapterIds?: string[]): Promise<boolean> => {
    if (!user) return false

    setState(prev => ({ ...prev, confirming: true, error: null }))

    try {
      const response = await fetch('/api/chapters/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapter_ids: chapterIds,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Die Kapitel konnten nicht bestätigt werden')
      }

      await fetchChapters()

      setState(prev => ({ ...prev, confirming: false }))
      return true
    } catch (error) {
      console.error('Error confirming chapters:', error)
      setState(prev => ({
        ...prev,
        confirming: false,
        error: error instanceof Error ? error.message : 'Die Kapitel konnten nicht bestätigt werden',
      }))
      return false
    }
  }, [user, fetchChapters])

  const canGenerateChapters =
    (state.readiness?.ready ?? false) &&
    state.publishedChapters.length === 0 &&
    !state.generating &&
    !state.confirming
  const hasDraftChapters = state.draftChapters.length > 0

  return {
    ...state,
    refetch: fetchChapters,
    createChapter,
    updateChapter,
    deleteChapter,
    generateChapters,
    confirmDraftChapters,
    canGenerateChapters,
    hasDraftChapters,
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
        error: error instanceof Error ? error.message : 'Kapitel konnte nicht geladen werden',
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
