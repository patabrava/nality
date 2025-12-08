// ──────────────────────
// Schema Package Entry Point
// ──────────────────────

export * from './life-event'
export * from './chapters'
export * from './user-profile'

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