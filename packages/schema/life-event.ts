import { z } from 'zod'

// ──────────────────────
// Life Event Types
// ──────────────────────

/**
 * Life Event Category enum - matches database constraint
 */
export const LifeEventCategory = {
  PERSONAL: 'personal',
  EDUCATION: 'education', 
  CAREER: 'career',
  FAMILY: 'family',
  TRAVEL: 'travel',
  ACHIEVEMENT: 'achievement',
  HEALTH: 'health',
  RELATIONSHIP: 'relationship',
  OTHER: 'other'
} as const

export type LifeEventCategoryType = typeof LifeEventCategory[keyof typeof LifeEventCategory]

/**
 * Media Type enum - matches database constraint 
 */
export const MediaType = {
  IMAGE: 'image',
  VIDEO: 'video', 
  AUDIO: 'audio',
  DOCUMENT: 'document'
} as const

export type MediaTypeType = typeof MediaType[keyof typeof MediaType]

// ──────────────────────
// Zod Validation Schemas
// ──────────────────────

/**
 * Life Event Zod schema - validates input data
 */
export const LifeEventSchema = z.object({
  id: z.string().uuid().optional(), // Optional for create operations
  user_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional().nullable(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional().nullable(),
  is_ongoing: z.boolean().default(false).optional(),
  category: z.string().default(LifeEventCategory.PERSONAL).optional(),
  location: z.string().optional().nullable(),
  importance: z.number().min(1).max(10).default(5).optional(),
  tags: z.array(z.string()).default([]).optional(),
  metadata: z.record(z.string(), z.any()).default({}).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

/**
 * Media Object Zod schema 
 */
export const MediaObjectSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  life_event_id: z.string().uuid().optional().nullable(),
  storage_path: z.string().min(1, 'Storage path is required'),
  file_name: z.string().min(1, 'File name is required'),
  file_size: z.number().positive('File size must be positive'),
  mime_type: z.string().min(1, 'MIME type is required'),
  media_type: z.enum(['image', 'video', 'audio', 'document']),
  width: z.number().positive().optional().nullable(),
  height: z.number().positive().optional().nullable(),
  duration_seconds: z.number().positive().optional().nullable(),
  thumbnail_path: z.string().optional().nullable(),
  alt_text: z.string().optional().nullable(),
  metadata: z.record(z.string(), z.any()).default({}).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

// ──────────────────────
// TypeScript Types (inferred from Zod)
// ──────────────────────

/**
 * Life Event type - database representation
 */
export type LifeEvent = z.infer<typeof LifeEventSchema>

/**
 * Life Event input type - for create/update operations
 */
export type LifeEventInput = Omit<LifeEvent, 'id' | 'created_at' | 'updated_at'>

/**
 * Life Event update type - partial for updates
 */
export type LifeEventUpdate = Partial<Omit<LifeEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

/**
 * Media Object type - database representation
 */
export type MediaObject = z.infer<typeof MediaObjectSchema>

/**
 * Media Object input type - for create/update operations
 */
export type MediaObjectInput = Omit<MediaObject, 'id' | 'created_at' | 'updated_at'>

/**
 * Media Object update type - partial for updates
 */
export type MediaObjectUpdate = Partial<Omit<MediaObject, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

// ──────────────────────
// Extended Types for UI
// ──────────────────────

/**
 * Life Event with attached media - for timeline display
 */
export type LifeEventWithMedia = LifeEvent & {
  media_objects?: MediaObject[]
  media_count?: number
  primary_media?: MediaObject | null
}

/**
 * Timeline Event - enriched for UI display
 */
export type TimelineEvent = LifeEventWithMedia & {
  formatted_date_range: string
  is_moment: boolean // single day event
  is_duration: boolean // multi-day event
  age_at_event?: number | null
  days_duration?: number | null
}

/**
 * Form data type for creating/editing life events
 */
export type LifeEventFormData = {
  title: string
  description?: string
  start_date: string
  end_date?: string
  is_ongoing?: boolean
  category?: LifeEventCategoryType
  location?: string
  importance?: number
  tags?: string[]
}

// ──────────────────────
// Utility Functions
// ──────────────────────

/**
 * Validates life event data against schema
 */
export function validateLifeEvent(data: unknown): { success: true; data: LifeEvent } | { success: false; error: z.ZodError } {
  const result = LifeEventSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

/**
 * Validates media object data against schema
 */
export function validateMediaObject(data: unknown): { success: true; data: MediaObject } | { success: false; error: z.ZodError } {
  const result = MediaObjectSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

/**
 * Formats date range for display
 */
export function formatDateRange(startDate: string, endDate?: string | null, isOngoing?: boolean): string {
  const start = new Date(startDate)
  const startFormatted = start.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
  
  if (isOngoing) {
    return `${startFormatted} - Present`
  }
  
  if (!endDate || endDate === startDate) {
    return startFormatted
  }
  
  const end = new Date(endDate)
  const endFormatted = end.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
  
  return `${startFormatted} - ${endFormatted}`
}

/**
 * Determines if event is a single moment or duration
 */
export function getEventType(startDate: string, endDate?: string | null): 'moment' | 'duration' {
  if (!endDate || endDate === startDate) {
    return 'moment'
  }
  return 'duration'
}

/**
 * Calculates age at event given birth date
 */
export function calculateAgeAtEvent(birthDate: string, eventDate: string): number | null {
  try {
    const birth = new Date(birthDate)
    const event = new Date(eventDate)
    const age = event.getFullYear() - birth.getFullYear()
    const monthDiff = event.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && event.getDate() < birth.getDate())) {
      return age - 1
    }
    return age
  } catch {
    return null
  }
} 