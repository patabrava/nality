import { z } from 'zod'

// ──────────────────────
// Chapter Types (New Dynamic Chapters)
// Emergent chapters generated from memory clusters
// ──────────────────────

/**
 * Chapter Status enum
 */
export const ChapterStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const

export type ChapterStatusType = typeof ChapterStatus[keyof typeof ChapterStatus]

// ──────────────────────
// Zod Validation Schemas
// ──────────────────────

/**
 * Chapter Zod schema - validates input data
 */
export const ChapterSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  
  // AI-generated content
  title: z.string().min(1, 'Title is required'),
  summary: z.string().optional().nullable(),
  
  // Time boundaries
  time_range_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().nullable(),
  time_range_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().nullable(),
  
  // State management
  status: z.enum(['draft', 'published']).default('draft'),
  
  // Clustering metadata
  theme_keywords: z.array(z.string()).default([]).optional(),
  memory_count: z.number().int().min(0).default(0).optional(),
  
  // Display order
  display_order: z.number().int().default(0).optional(),
  
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

// ──────────────────────
// TypeScript Types
// ──────────────────────

/**
 * Chapter type - database representation
 */
export type Chapter = z.infer<typeof ChapterSchema>

/**
 * Chapter input type - for create operations
 */
export type ChapterInput = Omit<Chapter, 'id' | 'created_at' | 'updated_at'>

/**
 * Chapter update type - partial for updates
 */
export type ChapterUpdate = Partial<Omit<Chapter, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

// ──────────────────────
// Extended Types for UI
// ──────────────────────

import type { Memory } from './memory'

/**
 * Chapter with memories - for chapter detail view
 */
export type ChapterWithMemories = Chapter & {
  memories: Memory[]
}

/**
 * Chapter stats for display
 */
export type ChapterStats = {
  id: string
  title: string
  memory_count: number
  status: ChapterStatusType
  time_range?: string
}

/**
 * Chapter generation request
 */
export type ChapterGenerationRequest = {
  user_id: string
  min_memories?: number
  force_regenerate?: boolean
}

/**
 * Chapter generation result
 */
export type ChapterGenerationResult = {
  chapters_created: number
  chapters: Chapter[]
  memories_assigned: number
}

// ──────────────────────
// Utility Functions
// ──────────────────────

/**
 * Validates chapter data against schema
 */
export function validateChapter(data: unknown): { success: true; data: Chapter } | { success: false; error: z.ZodError } {
  const result = ChapterSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

/**
 * Formats chapter time range for display
 */
export function formatChapterTimeRange(chapter: Chapter): string {
  if (!chapter.time_range_start) {
    return 'Time range pending'
  }
  
  const start = new Date(chapter.time_range_start)
  const startFormatted = start.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
  
  if (!chapter.time_range_end || chapter.time_range_end === chapter.time_range_start) {
    return startFormatted
  }
  
  const end = new Date(chapter.time_range_end)
  const endFormatted = end.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
  
  return `${startFormatted} - ${endFormatted}`
}

/**
 * Gets status badge info for chapter
 */
export function getChapterStatusInfo(status: ChapterStatusType): { label: string; color: string } {
  switch (status) {
    case 'draft':
      return { label: 'Draft', color: 'gold' }
    case 'published':
      return { label: 'Published', color: 'green' }
    default:
      return { label: 'Unknown', color: 'gray' }
  }
}

/**
 * Checks if user has enough memories to generate chapters
 */
export function canGenerateChapters(memoryCount: number, minRequired: number = 5): boolean {
  return memoryCount >= minRequired
}
