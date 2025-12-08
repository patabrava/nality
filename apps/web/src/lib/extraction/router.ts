/**
 * Extraction Router
 * 
 * Routes extraction requests to appropriate destinations based on
 * topic (onboarding) or chapter (chapter chat).
 */

import type { 
  OnboardingTopic, 
  ExtractionDestination, 
  ChapterId 
} from './types';
import type { LifeEventCategoryType } from '@nality/schema';

// ──────────────────────
// Topic → Destination Routing
// ──────────────────────

/**
 * Maps onboarding topics to their storage destination
 */
export const TOPIC_ROUTING: Record<OnboardingTopic, ExtractionDestination> = {
  identity: 'users',           // Q1: name, form_of_address, language_style → users table
  origins: 'users',            // Q2: birth_date, birth_place → users table
  family: 'life_event',        // Q3: siblings, children → life events (split)
  education: 'life_event',     // Q4: schools, degrees → life events (split)
  career: 'life_event',        // Q5: jobs, roles → life events (split)
  influences: 'user_profile',  // Q6: authors, thinkers → user_profile
  values: 'user_profile',      // Q7: core values, motto → user_profile
};

/**
 * Maps chapter IDs to life event categories
 */
export const CHAPTER_TO_CATEGORY: Record<ChapterId, LifeEventCategoryType> = {
  roots: 'family',
  growing_up: 'personal',
  learning: 'education',
  work: 'career',
  love: 'relationship',
  moments: 'travel',
};

// ──────────────────────
// Topic Classification
// ──────────────────────

/**
 * Topics that should NEVER become life events
 * These contain atemporal data about WHO the user is
 */
export const PROFILE_ONLY_TOPICS: OnboardingTopic[] = ['influences', 'values'];

/**
 * Topics that should go to users table (not life events)
 * These contain user metadata and preferences
 */
export const USER_ONLY_TOPICS: OnboardingTopic[] = ['identity', 'origins'];

/**
 * Topics that typically contain composite answers needing LLM splitting
 * e.g., "I worked at A, then B, now C" → 3 separate events
 */
export const NEEDS_SPLITTING: OnboardingTopic[] = ['education', 'career', 'family'];

/**
 * Topics that map to life events
 */
export const LIFE_EVENT_TOPICS: OnboardingTopic[] = ['family', 'education', 'career'];

// ──────────────────────
// Routing Functions
// ──────────────────────

/**
 * Get the destination for an onboarding topic
 */
export function getDestination(topic: string): ExtractionDestination {
  const normalized = topic.toLowerCase() as OnboardingTopic;
  
  // Check if topic exists in routing table
  if (normalized in TOPIC_ROUTING) {
    return TOPIC_ROUTING[normalized];
  }
  
  // Unknown topics default to skip
  console.warn(`[router] Unknown topic: ${topic}, defaulting to skip`);
  return 'skip';
}

/**
 * Check if a topic needs LLM-based splitting
 */
export function needsSplitting(topic: string): boolean {
  return NEEDS_SPLITTING.includes(topic.toLowerCase() as OnboardingTopic);
}

/**
 * Check if a topic should be stored in user_profile
 */
export function isProfileTopic(topic: string): boolean {
  return PROFILE_ONLY_TOPICS.includes(topic.toLowerCase() as OnboardingTopic);
}

/**
 * Check if a topic should be stored in users table
 */
export function isUserTopic(topic: string): boolean {
  return USER_ONLY_TOPICS.includes(topic.toLowerCase() as OnboardingTopic);
}

/**
 * Check if a topic should create life events
 */
export function isLifeEventTopic(topic: string): boolean {
  return LIFE_EVENT_TOPICS.includes(topic.toLowerCase() as OnboardingTopic);
}

/**
 * Get the life event category for a chapter
 */
export function getCategoryForChapter(chapterId: string): LifeEventCategoryType {
  const normalized = chapterId.toLowerCase() as ChapterId;
  return CHAPTER_TO_CATEGORY[normalized] || 'other';
}

/**
 * Get the life event category for an onboarding topic
 */
export function getCategoryForTopic(topic: string): LifeEventCategoryType {
  const normalized = topic.toLowerCase();
  
  switch (normalized) {
    case 'family':
      return 'family';
    case 'education':
      return 'education';
    case 'career':
      return 'career';
    default:
      return 'personal';
  }
}

/**
 * Validate that a topic is a known onboarding topic
 */
export function isValidTopic(topic: string): topic is OnboardingTopic {
  return topic.toLowerCase() in TOPIC_ROUTING;
}

/**
 * Validate that a chapter ID is valid
 */
export function isValidChapter(chapterId: string): chapterId is ChapterId {
  return chapterId.toLowerCase() in CHAPTER_TO_CATEGORY;
}
