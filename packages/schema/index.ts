// ──────────────────────
// Schema Package Entry Point
// ──────────────────────

export * from './life-event'
export * from './chapters'
export * from './user-profile'
export * from './memory'
export * from './chapter'
export * from './biography'

// Legacy Chapter Types (Static - deprecated)
export type {
  ChapterId,
  LegacyChapter,
  LegacyChapterStats,
} from './chapters'

// Re-export common types for convenience
export type {
  LifeEvent,
  LifeEventInput,
  LifeEventUpdate,
  LifeEventWithMedia,
  TimelineEvent,
  LifeEventFormData,
  MediaObject,
  MediaObjectInput,
  MediaObjectUpdate,
} from './life-event'

export type {
  UserProfile,
  UserProfileInput,
  UserProfileUpdate,
  Influence,
  InfluenceType,
  RoleModel,
  RoleModelRelationship,
} from './user-profile'

// New Memory System Types
export type {
  Memory,
  MemoryInput,
  MemoryUpdate,
  MemoryWithChapter,
  MemoryFeedItem,
  MemoriesByDate,
  InterviewSession,
  InterviewSessionInput,
  InterviewSessionUpdate,
  InterviewSessionWithMemories,
  MemoryCaptureModeType,
  MemoryProcessingStatusType,
  MemorySourceType,
  MemoryCategoryType,
} from './memory'

// New Chapter Types (Dynamic)
export type {
  Chapter,
  ChapterInput,
  ChapterUpdate,
  ChapterWithMemories,
  ChapterStats,
  ChapterStatusType,
  ChapterGenerationRequest,
  ChapterGenerationResult,
} from './chapter'

// Biography Types
export type {
  Biography,
  BiographyInput,
  BiographyUpdate,
  BiographyWithChapters,
  BiographyToneType,
  BiographyGenerationRequest,
  BiographyGenerationResult,
  BiographyVersion,
} from './biography' 