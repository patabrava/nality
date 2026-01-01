import { z } from 'zod'

// ──────────────────────
// Biography Types
// Generated narrative documents from chapters
// ──────────────────────

/**
 * Biography Tone enum
 */
export const BiographyTone = {
  NEUTRAL: 'neutral',
  POETIC: 'poetic',
  FORMAL: 'formal',
} as const

export type BiographyToneType = typeof BiographyTone[keyof typeof BiographyTone]

// ──────────────────────
// Zod Validation Schemas
// ──────────────────────

/**
 * Biography Zod schema - validates input data
 */
export const BiographySchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  
  // Generated content
  content: z.string().min(1, 'Content is required'),
  tone: z.enum(['neutral', 'poetic', 'formal']).default('neutral'),
  
  // Version management
  version: z.number().int().min(1).default(1),
  is_current: z.boolean().default(true),
  
  // Source chapters
  chapter_ids: z.array(z.string().uuid()).default([]).optional(),
  
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

// ──────────────────────
// TypeScript Types
// ──────────────────────

/**
 * Biography type - database representation
 */
export type Biography = z.infer<typeof BiographySchema>

/**
 * Biography input type - for create operations
 */
export type BiographyInput = Omit<Biography, 'id' | 'created_at' | 'updated_at'>

/**
 * Biography update type - partial for updates
 */
export type BiographyUpdate = Partial<Omit<Biography, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

// ──────────────────────
// Extended Types for UI
// ──────────────────────

import type { Chapter } from './chapter'

/**
 * Biography with chapters - for detailed view
 */
export type BiographyWithChapters = Biography & {
  chapters: Chapter[]
}

/**
 * Biography generation request
 */
export type BiographyGenerationRequest = {
  user_id: string
  tone?: BiographyToneType
  chapter_ids?: string[]
  regenerate?: boolean
}

/**
 * Biography generation result
 */
export type BiographyGenerationResult = {
  biography: Biography
  chapters_used: number
  word_count: number
}

/**
 * Biography version info
 */
export type BiographyVersion = {
  id: string
  version: number
  tone: BiographyToneType
  is_current: boolean
  created_at: string
  word_count: number
}

// ──────────────────────
// Utility Functions
// ──────────────────────

/**
 * Validates biography data against schema
 */
export function validateBiography(data: unknown): { success: true; data: Biography } | { success: false; error: z.ZodError } {
  const result = BiographySchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

/**
 * Gets tone display info
 */
export function getToneDisplayInfo(tone: BiographyToneType): { label: string; description: string } {
  switch (tone) {
    case 'neutral':
      return { label: 'Neutral', description: 'Clear and balanced narrative' }
    case 'poetic':
      return { label: 'Poetic', description: 'Lyrical and expressive style' }
    case 'formal':
      return { label: 'Formal', description: 'Professional and structured' }
    default:
      return { label: 'Unknown', description: '' }
  }
}

/**
 * Counts words in biography content
 */
export function countBiographyWords(content: string): number {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Gets reading time estimate in minutes
 */
export function getReadingTime(content: string, wordsPerMinute: number = 200): number {
  const wordCount = countBiographyWords(content)
  return Math.ceil(wordCount / wordsPerMinute)
}

/**
 * Checks if user can generate biography (needs chapters)
 */
export function canGenerateBiography(chapterCount: number, minRequired: number = 1): boolean {
  return chapterCount >= minRequired
}

/**
 * Exports biography to different formats
 */
export function exportBiographyAsMarkdown(biography: Biography, title?: string): string {
  const header = title ? `# ${title}\n\n` : ''
  const meta = `*Generated on ${new Date(biography.created_at || Date.now()).toLocaleDateString()}*\n\n---\n\n`
  return header + meta + biography.content
}
