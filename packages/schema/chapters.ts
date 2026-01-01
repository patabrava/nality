// Chapter system types for Nality autobiography app
// This file contains LEGACY static chapter types - being deprecated
// New dynamic chapters are defined in ./chapter.ts

import type { LifeEventCategoryType } from './life-event';

/**
 * @deprecated Use dynamic chapters from ./chapter.ts instead
 * Static chapter IDs from the old UX
 */
export type ChapterId = 
  | 'roots' 
  | 'growing_up' 
  | 'learning' 
  | 'work' 
  | 'love' 
  | 'moments';

/**
 * @deprecated Use Chapter from ./chapter.ts instead
 * Legacy static chapter interface from the old UX
 */
export interface LegacyChapter {
  id: ChapterId;
  name: string;
  subtitle: string;
  icon: string;
  primaryCategory: LifeEventCategoryType;
  categories: LifeEventCategoryType[];
  promptFile: string;
  displayOrder: number;
}

/**
 * @deprecated Use ChapterStats from ./chapter.ts instead
 */
export interface LegacyChapterStats {
  chapterId: ChapterId;
  chapterName: string;
  eventCount: number;
}
