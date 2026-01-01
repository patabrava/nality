'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import type { 
  Memory, 
  MemoryInput, 
  MemoryUpdate,
  MemoriesByDate,
} from '@nality/schema'
import { groupMemoriesByDate } from '@nality/schema'

// ──────────────────────
// Hook State Types
// ──────────────────────

interface UseMemoriesState {
  memories: Memory[]
  loading: boolean
  error: string | null
  creating: boolean
}

interface UseMemoriesActions {
  refetch: () => Promise<void>
  createMemory: (input: Partial<MemoryInput>) => Promise<Memory | null>
  getMemoriesByDate: () => MemoriesByDate
}

type UseMemoriesReturn = UseMemoriesState & UseMemoriesActions

interface UseMemoriesOptions {
  captureMode?: 'interview' | 'free_talk' | 'text'
  chapterId?: string
  limit?: number
}

// ──────────────────────
// Main Hook
// ──────────────────────

export function useMemories(options: UseMemoriesOptions = {}): UseMemoriesReturn {
  const { captureMode, chapterId, limit = 100 } = options
  const { user, isAuthenticated } = useAuth()
  
  const [state, setState] = useState<UseMemoriesState>({
    memories: [],
    loading: true,
    error: null,
    creating: false,
  })

  // Fetch memories
  const fetchMemories = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setState(prev => ({ ...prev, loading: false, memories: [] }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      let query = supabase
        .from('memories')
        .select('*')
        .eq('user_id', user.id)
        .order('captured_at', { ascending: false })
        .limit(limit)

      if (captureMode) {
        query = query.eq('capture_mode', captureMode)
      }

      if (chapterId) {
        query = query.eq('chapter_id', chapterId)
      }

      const { data, error } = await query

      if (error) throw error

      setState(prev => ({
        ...prev,
        memories: data || [],
        loading: false,
        error: null,
      }))
    } catch (error) {
      console.error('Error fetching memories:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch memories',
      }))
    }
  }, [isAuthenticated, user, captureMode, chapterId, limit])

  // Initial fetch
  useEffect(() => {
    fetchMemories()
  }, [fetchMemories])

  // Create memory
  const createMemory = useCallback(async (input: Partial<MemoryInput>): Promise<Memory | null> => {
    if (!user) return null

    setState(prev => ({ ...prev, creating: true }))

    try {
      const memoryData: MemoryInput = {
        user_id: user.id,
        raw_transcript: input.raw_transcript || '',
        cleaned_content: input.cleaned_content || null,
        captured_at: input.captured_at || new Date().toISOString(),
        capture_mode: input.capture_mode || 'free_talk',
        interview_session_id: input.interview_session_id || null,
        interview_question: input.interview_question || null,
        interview_topic: input.interview_topic || null,
        people: input.people || [],
        places: input.places || [],
        topics: input.topics || [],
        emotions: input.emotions || null,
        suggested_category: input.suggested_category || null,
        suggested_chapter_id: input.suggested_chapter_id || null,
        suggestion_confidence: input.suggestion_confidence || 0,
        source: input.source || 'voice',
        processing_status: input.processing_status || 'pending',
        processed_at: input.processed_at || null,
        chapter_id: input.chapter_id || null,
      }

      const { data, error } = await supabase
        .from('memories')
        .insert(memoryData)
        .select()
        .single()

      if (error) throw error

      // Optimistic update
      setState(prev => ({
        ...prev,
        memories: [data, ...prev.memories],
        creating: false,
      }))

      return data
    } catch (error) {
      console.error('Error creating memory:', error)
      setState(prev => ({ ...prev, creating: false }))
      return null
    }
  }, [user])

  // Get memories grouped by date
  const getMemoriesByDate = useCallback((): MemoriesByDate => {
    return groupMemoriesByDate(state.memories)
  }, [state.memories])

  return {
    ...state,
    refetch: fetchMemories,
    createMemory,
    getMemoriesByDate,
  }
}

// ──────────────────────
// Single Memory Hook
// ──────────────────────

interface UseMemoryState {
  memory: Memory | null
  loading: boolean
  error: string | null
  updating: boolean
  deleting: boolean
}

interface UseMemoryActions {
  refetch: () => Promise<void>
  updateMemory: (updates: MemoryUpdate) => Promise<Memory | null>
  deleteMemory: () => Promise<boolean>
}

type UseMemoryReturn = UseMemoryState & UseMemoryActions

export function useMemory(memoryId: string): UseMemoryReturn {
  const { user, isAuthenticated } = useAuth()
  
  const [state, setState] = useState<UseMemoryState>({
    memory: null,
    loading: true,
    error: null,
    updating: false,
    deleting: false,
  })

  // Fetch single memory
  const fetchMemory = useCallback(async () => {
    if (!isAuthenticated || !user || !memoryId) {
      setState(prev => ({ ...prev, loading: false, memory: null }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase
        .from('memories')
        .select(`
          *,
          chapters:chapter_id (
            id,
            title
          )
        `)
        .eq('id', memoryId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        memory: data,
        loading: false,
        error: null,
      }))
    } catch (error) {
      console.error('Error fetching memory:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch memory',
      }))
    }
  }, [isAuthenticated, user, memoryId])

  useEffect(() => {
    fetchMemory()
  }, [fetchMemory])

  // Update memory
  const updateMemory = useCallback(async (updates: MemoryUpdate): Promise<Memory | null> => {
    if (!user || !memoryId) return null

    setState(prev => ({ ...prev, updating: true }))

    try {
      const { data, error } = await supabase
        .from('memories')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memoryId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        memory: data,
        updating: false,
      }))

      return data
    } catch (error) {
      console.error('Error updating memory:', error)
      setState(prev => ({ ...prev, updating: false }))
      return null
    }
  }, [user, memoryId])

  // Delete memory
  const deleteMemory = useCallback(async (): Promise<boolean> => {
    if (!user || !memoryId) return false

    setState(prev => ({ ...prev, deleting: true }))

    try {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', memoryId)
        .eq('user_id', user.id)

      if (error) throw error

      setState(prev => ({
        ...prev,
        memory: null,
        deleting: false,
      }))

      return true
    } catch (error) {
      console.error('Error deleting memory:', error)
      setState(prev => ({ ...prev, deleting: false }))
      return false
    }
  }, [user, memoryId])

  return {
    ...state,
    refetch: fetchMemory,
    updateMemory,
    deleteMemory,
  }
}
