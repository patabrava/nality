import type { LegacyChapter, ChapterId } from '@nality/schema';

export const CHAPTERS: Record<ChapterId, LegacyChapter> = {
  roots: {
    id: 'roots',
    name: 'Roots',
    subtitle: 'Where I come from',
    icon: 'TreePine',
    primaryCategory: 'family',
    categories: ['family'],
    promptFile: 'roots.txt',
    displayOrder: 1,
  },
  growing_up: {
    id: 'growing_up',
    name: 'Growing Up',
    subtitle: 'Who I became',
    icon: 'Sunrise',
    primaryCategory: 'personal',
    categories: ['personal'],
    promptFile: 'growing_up.txt',
    displayOrder: 2,
  },
  learning: {
    id: 'learning',
    name: 'Learning',
    subtitle: 'What shaped my mind',
    icon: 'BookOpen',
    primaryCategory: 'education',
    categories: ['education'],
    promptFile: 'learning.txt',
    displayOrder: 3,
  },
  work: {
    id: 'work',
    name: 'Work & Purpose',
    subtitle: 'What I built',
    icon: 'Target',
    primaryCategory: 'career',
    categories: ['career', 'achievement'],
    promptFile: 'work.txt',
    displayOrder: 4,
  },
  love: {
    id: 'love',
    name: 'Love & Bonds',
    subtitle: 'Who I loved',
    icon: 'Heart',
    primaryCategory: 'relationship',
    categories: ['relationship'],
    promptFile: 'love.txt',
    displayOrder: 5,
  },
  moments: {
    id: 'moments',
    name: 'Life Moments',
    subtitle: 'What I experienced',
    icon: 'Sparkles',
    primaryCategory: 'travel',
    categories: ['travel', 'health', 'other'],
    promptFile: 'moments.txt',
    displayOrder: 6,
  },
};

export const CHAPTERS_ORDERED = Object.values(CHAPTERS).sort(
  (a, b) => a.displayOrder - b.displayOrder
);

export function getChapterById(id: ChapterId): LegacyChapter | undefined {
  return CHAPTERS[id];
}

export function getChapterByCategory(category: string): LegacyChapter | undefined {
  return CHAPTERS_ORDERED.find(ch =>
    ch.categories.includes(category as any)
  );
}

export function isValidChapterId(id: string): id is ChapterId {
  return id in CHAPTERS;
}
