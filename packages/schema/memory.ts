import { z } from 'zod'

// ──────────────────────
// Memory System Types
// New UX: Voice-first atomic memories
// ──────────────────────

/**
 * Memory Capture Mode enum - determines preprocessing strategy
 */
export const MemoryCaptureMode = {
  INTERVIEW: 'interview',
  FREE_TALK: 'free_talk',
  TEXT: 'text',
} as const

export type MemoryCaptureModeType = typeof MemoryCaptureMode[keyof typeof MemoryCaptureMode]

/**
 * Memory Processing Status enum
 */
export const MemoryProcessingStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETE: 'complete',
  FAILED: 'failed',
} as const

export type MemoryProcessingStatusType = typeof MemoryProcessingStatus[keyof typeof MemoryProcessingStatus]

/**
 * Memory Source enum
 */
export const MemorySource = {
  VOICE: 'voice',
  TEXT: 'text',
} as const

export type MemorySourceType = typeof MemorySource[keyof typeof MemorySource]

// ──────────────────────
// Zod Validation Schemas
// ──────────────────────

/**
 * Emotions schema for memory metadata
 */
export const EmotionsSchema = z.object({
  valence: z.number().min(-1).max(1).optional(),
  arousal: z.number().min(0).max(1).optional(),
  confidence: z.number().min(0).max(1).optional(),
}).passthrough()

/**
 * Memory Zod schema - validates input data
 */
export const MemorySchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  
  // Core content
  raw_transcript: z.string().min(1, 'Transcript is required'),
  cleaned_content: z.string().optional().nullable(),
  
  // Temporal organization
  captured_at: z.string().datetime().optional(),
  
  // Capture mode
  capture_mode: z.enum(['interview', 'free_talk', 'text']).default('free_talk'),
  
  // Interview-specific fields
  interview_session_id: z.string().uuid().optional().nullable(),
  interview_question: z.string().optional().nullable(),
  interview_topic: z.string().optional().nullable(),
  
  // System-inferred metadata
  people: z.array(z.string()).default([]).optional(),
  places: z.array(z.string()).default([]).optional(),
  topics: z.array(z.string()).default([]).optional(),
  emotions: EmotionsSchema.optional().nullable(),
  
  // Suggested destinations
  suggested_category: z.string().optional().nullable(),
  suggested_chapter_id: z.string().uuid().optional().nullable(),
  suggestion_confidence: z.number().min(0).max(1).default(0).optional(),
  
  // Capture source
  source: z.enum(['voice', 'text']).default('voice'),
  
  // Processing state
  processing_status: z.enum(['pending', 'processing', 'complete', 'failed']).default('pending'),
  processed_at: z.string().datetime().optional().nullable(),
  
  // Chapter assignment
  chapter_id: z.string().uuid().optional().nullable(),
  
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

/**
 * Interview Session Zod schema
 */
export const InterviewSessionSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  
  started_at: z.string().datetime().optional(),
  ended_at: z.string().datetime().optional().nullable(),
  
  topics_covered: z.array(z.string()).default([]).optional(),
  memory_count: z.number().int().min(0).default(0).optional(),
  
  processing_status: z.enum(['pending', 'processing', 'complete', 'failed']).default('pending'),
  summary: z.string().optional().nullable(),
  
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

// ──────────────────────
// TypeScript Types
// ──────────────────────

/**
 * Memory type - database representation
 */
export type Memory = z.infer<typeof MemorySchema>

/**
 * Memory input type - for create operations
 */
export type MemoryInput = Omit<Memory, 'id' | 'created_at' | 'updated_at'>

/**
 * Memory update type - partial for updates
 */
export type MemoryUpdate = Partial<Omit<Memory, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

/**
 * Interview Session type - database representation
 */
export type InterviewSession = z.infer<typeof InterviewSessionSchema>

/**
 * Interview Session input type
 */
export type InterviewSessionInput = Omit<InterviewSession, 'id' | 'created_at' | 'updated_at'>

/**
 * Interview Session update type
 */
export type InterviewSessionUpdate = Partial<Omit<InterviewSession, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

// ──────────────────────
// Extended Types for UI
// ──────────────────────

/**
 * Memory with chapter info - for feed display
 */
export type MemoryWithChapter = Memory & {
  chapter_title?: string | null
}

/**
 * Memory feed item - enriched for UI display
 */
export type MemoryFeedItem = MemoryWithChapter & {
  formatted_time: string
  excerpt: string
  mode_label: string
}

/**
 * Grouped memories by date for feed
 */
export type MemoriesByDate = Record<string, Memory[]>

/**
 * Interview session with memories
 */
export type InterviewSessionWithMemories = InterviewSession & {
  memories: Memory[]
}

// ──────────────────────
// Memory Categories
// ──────────────────────

export const MemoryCategory = {
  FAMILY: 'family',
  CAREER: 'career',
  EDUCATION: 'education',
  RELATIONSHIP: 'relationship',
  PERSONAL: 'personal',
  TRAVEL: 'travel',
  HEALTH: 'health',
  OTHER: 'other',
} as const

export type MemoryCategoryType = typeof MemoryCategory[keyof typeof MemoryCategory]

// ──────────────────────
// Utility Functions
// ──────────────────────

/**
 * Validates memory data against schema
 */
export function validateMemory(data: unknown): { success: true; data: Memory } | { success: false; error: z.ZodError } {
  const result = MemorySchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

/**
 * Validates interview session data against schema
 */
export function validateInterviewSession(data: unknown): { success: true; data: InterviewSession } | { success: false; error: z.ZodError } {
  const result = InterviewSessionSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

/**
 * Groups memories by date for feed display
 */
export function groupMemoriesByDate(memories: Memory[]): MemoriesByDate {
  return memories.reduce((groups, memory) => {
    const dateStr = memory.captured_at || memory.created_at || new Date().toISOString()
    const date = new Date(dateStr)
    const dateKey = date.toISOString().split('T')[0] || 'unknown'
    
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey]!.push(memory)
    
    return groups
  }, {} as MemoriesByDate)
}

/**
 * Formats date header for feed display
 */
export function formatDateHeader(dateKey: string): string {
  const date = new Date(dateKey)
  const today = new Date()
  const yesterday = new Date(today.getTime())
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (dateKey === today.toISOString().split('T')[0]) {
    return 'Today'
  }
  if (dateKey === yesterday.toISOString().split('T')[0]) {
    return 'Yesterday'
  }
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
}

/**
 * Gets excerpt from memory content
 */
export function getMemoryExcerpt(memory: Memory, maxLength: number = 100): string {
  const content = memory.cleaned_content || memory.raw_transcript
  if (content.length <= maxLength) {
    return content
  }
  return content.slice(0, maxLength).trim() + '...'
}

/**
 * Gets mode label for display
 */
export function getMemoryModeLabel(mode: MemoryCaptureModeType): string {
  switch (mode) {
    case 'interview':
      return 'Interview'
    case 'free_talk':
      return 'Free Talk'
    case 'text':
      return 'Written'
    default:
      return 'Memory'
  }
}
