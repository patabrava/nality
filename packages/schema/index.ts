// ──────────────────────
// Schema Package Entry Point
// ──────────────────────

export * from './life-event'
export * from './chapters'

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