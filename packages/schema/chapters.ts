// Chapter system types for Nality autobiography app

import type { LifeEventCategoryType } from './life-event';

export type ChapterId = 
  | 'roots' 
  | 'growing_up' 
  | 'learning' 
  | 'work' 
  | 'love' 
  | 'moments';

export interface Chapter {
  id: ChapterId;
  name: string;
  subtitle: string;
  icon: string;
  primaryCategory: LifeEventCategoryType;
  categories: LifeEventCategoryType[];
  promptFile: string;
  displayOrder: number;
}

export interface ChapterStats {
  chapterId: ChapterId;
  chapterName: string;
  eventCount: number;
}
