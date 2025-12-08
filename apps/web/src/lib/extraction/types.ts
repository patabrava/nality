/**
 * Extraction Types
 * 
 * Type definitions for the unified extraction pipeline that routes
 * onboarding answers and chapter chat content to appropriate destinations.
 */

import type { LifeEventCategoryType } from '@nality/schema';

// ──────────────────────
// Source & Destination Types
// ──────────────────────

/**
 * Source of the extraction - where the content originated
 */
export type ExtractionSource = 
  | 'onboarding'      // Q1-Q7 from onboarding flow
  | 'chapter_chat'    // Ongoing chapter conversations
  | 'manual';         // User-created events directly

/**
 * Destination for extracted data
 */
export type ExtractionDestination = 
  | 'users'           // User metadata (name, preferences, birth info)
  | 'user_profile'    // Atemporal attributes (values, influences, motto)
  | 'life_event'      // Timeline events
  | 'skip';           // No extraction needed

/**
 * Onboarding question topics (from onboarding.txt)
 */
export type OnboardingTopic = 
  | 'identity'        // Q1: name, form_of_address, language_style
  | 'origins'         // Q2: birth_date, birth_place
  | 'family'          // Q3: siblings, children
  | 'education'       // Q4: schools, degrees
  | 'career'          // Q5: jobs, roles
  | 'influences'      // Q6: authors, thinkers, role models
  | 'values';         // Q7: core values, motto

/**
 * Chapter IDs that map to life event categories
 */
export type ChapterId = 
  | 'roots'           // family
  | 'growing_up'      // personal
  | 'learning'        // education
  | 'work'            // career
  | 'love'            // relationship
  | 'moments';        // travel, other

// ──────────────────────
// Extracted Data Types
// ──────────────────────

/**
 * A structured life event extracted from content
 */
export interface ExtractedLifeEvent {
  /** Brief descriptive title */
  title: string;
  
  /** Detailed description */
  description: string;
  
  /** Start date in YYYY-MM-DD format, null if unknown */
  start_date: string | null;
  
  /** End date in YYYY-MM-DD format, optional */
  end_date?: string | null;
  
  /** Whether this is an ongoing event */
  is_ongoing?: boolean;
  
  /** Life event category */
  category: LifeEventCategoryType;
  
  /** Location if mentioned */
  location?: string;
  
  /** Confidence score 0-1 */
  confidence: number;
  
  /** Where this event was extracted from */
  source: ExtractionSource;
}

/**
 * Profile data extracted from content (values, influences, etc.)
 */
export interface ExtractedProfileData {
  /** Core life values (up to 3) */
  values?: string[];
  
  /** Life motto or guiding principle */
  motto?: string;
  
  /** People who influenced their thinking */
  influences?: Array<{
    name: string;
    type: 'author' | 'philosopher' | 'person' | 'mentor' | 'public_figure' | 'historical' | 'other';
    why?: string;
  }>;
  
  /** Personal role models */
  role_models?: Array<{
    name: string;
    relationship?: string;
    traits?: string[];
  }>;
  
  /** Favorite authors (subset of influences) */
  favorite_authors?: string[];
}

/**
 * User metadata extracted from content (identity, preferences)
 */
export interface ExtractedUserData {
  /** Full name */
  full_name?: string;
  
  /** Form of address preference */
  form_of_address?: 'du' | 'sie';
  
  /** Language/writing style preference */
  language_style?: 'prosa' | 'fachlich' | 'locker';
  
  /** Birth date in YYYY-MM-DD format */
  birth_date?: string;
  
  /** Birth place */
  birth_place?: string;
}

// ──────────────────────
// Extraction Result Types
// ──────────────────────

/**
 * Result of an extraction operation
 */
export interface ExtractionResult {
  /** Where the data should be stored */
  destination: ExtractionDestination;
  
  /** Extracted life events (if destination is 'life_event') */
  events?: ExtractedLifeEvent[];
  
  /** Extracted profile data (if destination is 'user_profile') */
  profileData?: ExtractedProfileData;
  
  /** Extracted user data (if destination is 'users') */
  userData?: ExtractedUserData;
  
  /** Original content that was processed */
  rawContent: string;
  
  /** Overall confidence in the extraction */
  confidence: number;
  
  /** Any errors or warnings during extraction */
  warnings?: string[];
}

/**
 * Request to the extraction API
 */
export interface ExtractionRequest {
  /** Content to extract from */
  content: string;
  
  /** Source of the content */
  source: ExtractionSource;
  
  /** Onboarding topic (for onboarding source) */
  topic?: OnboardingTopic;
  
  /** Chapter ID (for chapter_chat source) */
  chapterId?: ChapterId;
  
  /** User ID for persistence */
  userId?: string;
  
  /** Access token for authentication */
  accessToken?: string;
}

/**
 * Response from the extraction API
 */
export interface ExtractionResponse extends ExtractionResult {
  /** Whether the operation succeeded */
  success: boolean;
  
  /** Persistence result */
  persisted?: {
    success: boolean;
    ids?: string[];
    error?: string;
  };
  
  /** Error message if failed */
  error?: string;
}

// ──────────────────────
// Persistence Types
// ──────────────────────

/**
 * Result of persisting extracted data
 */
export interface PersistenceResult {
  success: boolean;
  ids?: string[];
  error?: string;
}
