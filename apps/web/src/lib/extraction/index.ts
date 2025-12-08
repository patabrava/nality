/**
 * Extraction Module
 * 
 * Unified extraction pipeline for converting onboarding answers and
 * chapter chat content into structured data (life events, profile, user data).
 */

// Types
export type {
  ExtractionSource,
  ExtractionDestination,
  OnboardingTopic,
  ChapterId,
  ExtractedLifeEvent,
  ExtractedProfileData,
  ExtractedUserData,
  ExtractionResult,
  ExtractionRequest,
  ExtractionResponse,
  PersistenceResult,
} from './types';

// Router
export {
  TOPIC_ROUTING,
  CHAPTER_TO_CATEGORY,
  PROFILE_ONLY_TOPICS,
  USER_ONLY_TOPICS,
  NEEDS_SPLITTING,
  LIFE_EVENT_TOPICS,
  getDestination,
  needsSplitting,
  isProfileTopic,
  isUserTopic,
  isLifeEventTopic,
  getCategoryForChapter,
  getCategoryForTopic,
  isValidTopic,
  isValidChapter,
} from './router';

// Parser
export {
  hasSaveMemoryBlock,
  parseSaveMemoryBlocks,
  parseDate,
  sanitizeTitle,
  sanitizeDescription,
  indicatesSaveIntent,
} from './parser';

// User Extractor
export {
  extractUserData,
  extractBirthData,
} from './user-extractor';

// Profile Extractor
export {
  extractProfileData,
  extractInfluencesSimple,
  extractValuesSimple,
} from './profile-extractor';

// LLM Splitter
export {
  splitCompositeAnswer,
} from './llm-splitter';
