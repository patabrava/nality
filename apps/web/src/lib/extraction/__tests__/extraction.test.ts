/**
 * Extraction Pipeline Tests
 * 
 * Tests for the unified extraction pipeline including:
 * - Router logic
 * - Parser for [SAVE_MEMORY] blocks
 * - User data extraction
 * - Profile data extraction
 * 
 * Run with: pnpm test extraction
 */

import { describe, it, expect } from 'vitest';
import {
  getDestination,
  needsSplitting,
  isProfileTopic,
  isUserTopic,
  isLifeEventTopic,
  getCategoryForChapter,
  getCategoryForTopic,
} from '../router';
import {
  hasSaveMemoryBlock,
  parseSaveMemoryBlocks,
  parseDate,
  sanitizeTitle,
} from '../parser';
import {
  extractUserData,
  extractBirthData,
} from '../user-extractor';

// ──────────────────────
// Router Tests
// ──────────────────────

describe('Router', () => {
  describe('getDestination', () => {
    it('routes identity to users table', () => {
      expect(getDestination('identity')).toBe('users');
      expect(getDestination('Identity')).toBe('users');
    });

    it('routes origins to users table', () => {
      expect(getDestination('origins')).toBe('users');
    });

    it('routes influences to user_profile table', () => {
      expect(getDestination('influences')).toBe('user_profile');
      expect(getDestination('Influences')).toBe('user_profile');
    });

    it('routes values to user_profile table', () => {
      expect(getDestination('values')).toBe('user_profile');
    });

    it('routes family to life_event table', () => {
      expect(getDestination('family')).toBe('life_event');
    });

    it('routes education to life_event table', () => {
      expect(getDestination('education')).toBe('life_event');
    });

    it('routes career to life_event table', () => {
      expect(getDestination('career')).toBe('life_event');
    });

    it('returns skip for unknown topics', () => {
      expect(getDestination('unknown')).toBe('skip');
      expect(getDestination('')).toBe('skip');
    });
  });

  describe('needsSplitting', () => {
    it('returns true for topics that need LLM splitting', () => {
      expect(needsSplitting('education')).toBe(true);
      expect(needsSplitting('career')).toBe(true);
      expect(needsSplitting('family')).toBe(true);
    });

    it('returns false for topics that do not need splitting', () => {
      expect(needsSplitting('identity')).toBe(false);
      expect(needsSplitting('influences')).toBe(false);
    });
  });

  describe('topic type checks', () => {
    it('isProfileTopic identifies profile topics', () => {
      expect(isProfileTopic('influences')).toBe(true);
      expect(isProfileTopic('values')).toBe(true);
      expect(isProfileTopic('career')).toBe(false);
    });

    it('isUserTopic identifies user topics', () => {
      expect(isUserTopic('identity')).toBe(true);
      expect(isUserTopic('origins')).toBe(true);
      expect(isUserTopic('career')).toBe(false);
    });

    it('isLifeEventTopic identifies life event topics', () => {
      expect(isLifeEventTopic('family')).toBe(true);
      expect(isLifeEventTopic('education')).toBe(true);
      expect(isLifeEventTopic('career')).toBe(true);
      expect(isLifeEventTopic('identity')).toBe(false);
    });
  });

  describe('getCategoryForChapter', () => {
    it('maps chapters to correct categories', () => {
      expect(getCategoryForChapter('roots')).toBe('family');
      expect(getCategoryForChapter('learning')).toBe('education');
      expect(getCategoryForChapter('work')).toBe('career');
      expect(getCategoryForChapter('love')).toBe('relationship');
      expect(getCategoryForChapter('moments')).toBe('personal');
    });

    it('returns personal for unknown chapters', () => {
      expect(getCategoryForChapter('unknown')).toBe('personal');
    });
  });

  describe('getCategoryForTopic', () => {
    it('maps topics to correct categories', () => {
      expect(getCategoryForTopic('family')).toBe('family');
      expect(getCategoryForTopic('education')).toBe('education');
      expect(getCategoryForTopic('career')).toBe('career');
    });
  });
});

// ──────────────────────
// Parser Tests
// ──────────────────────

describe('Parser', () => {
  describe('hasSaveMemoryBlock', () => {
    it('detects [SAVE_MEMORY] blocks', () => {
      expect(hasSaveMemoryBlock('[SAVE_MEMORY]\nTitle: Test\n[/SAVE_MEMORY]')).toBe(true);
      expect(hasSaveMemoryBlock('Some text [SAVE_MEMORY] more text')).toBe(true);
    });

    it('returns false when no block present', () => {
      expect(hasSaveMemoryBlock('Just regular text')).toBe(false);
      expect(hasSaveMemoryBlock('')).toBe(false);
    });
  });

  describe('parseSaveMemoryBlocks', () => {
    it('parses a single [SAVE_MEMORY] block', () => {
      const content = `
Some intro text.

[SAVE_MEMORY]
Title: Started at Google
Date: 2020-03-15
Description: Joined Google as a Software Engineer in Mountain View.
[/SAVE_MEMORY]

More text.
      `;
      
      const events = parseSaveMemoryBlocks(content, 'career');
      
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Started at Google');
      expect(events[0].start_date).toBe('2020-03-15');
      expect(events[0].description).toContain('Joined Google');
      expect(events[0].category).toBe('career');
    });

    it('parses multiple [SAVE_MEMORY] blocks', () => {
      const content = `
[SAVE_MEMORY]
Title: First Job
Date: 2015
Description: Started career
[/SAVE_MEMORY]

[SAVE_MEMORY]
Title: Second Job
Date: 2018
Description: Changed companies
[/SAVE_MEMORY]
      `;
      
      const events = parseSaveMemoryBlocks(content, 'career');
      
      expect(events).toHaveLength(2);
      expect(events[0].title).toBe('First Job');
      expect(events[1].title).toBe('Second Job');
    });

    it('handles German date formats', () => {
      const content = `
[SAVE_MEMORY]
Title: Schulabschluss
Date: 15. Juni 2010
Description: Abitur bestanden
[/SAVE_MEMORY]
      `;
      
      const events = parseSaveMemoryBlocks(content, 'education');
      
      expect(events).toHaveLength(1);
      expect(events[0].start_date).toBe('2010-06-15');
    });
  });

  describe('parseDate', () => {
    it('parses ISO format dates', () => {
      expect(parseDate('2020-03-15')).toBe('2020-03-15');
    });

    it('parses year-only dates', () => {
      expect(parseDate('2020')).toBe('2020-01-01');
    });

    it('parses German format dates', () => {
      expect(parseDate('15.03.2020')).toBe('2020-03-15');
      expect(parseDate('15. März 2020')).toBe('2020-03-15');
    });

    it('parses English format dates', () => {
      expect(parseDate('March 15, 2020')).toBe('2020-03-15');
      expect(parseDate('Mar 2020')).toBe('2020-03-01');
    });

    it('returns null for invalid dates', () => {
      expect(parseDate('')).toBeNull();
      expect(parseDate('invalid')).toBeNull();
    });
  });

  describe('sanitizeTitle', () => {
    it('trims whitespace', () => {
      expect(sanitizeTitle('  Test Title  ')).toBe('Test Title');
    });

    it('removes newlines', () => {
      expect(sanitizeTitle('Test\nTitle')).toBe('Test Title');
    });

    it('truncates long titles', () => {
      const longTitle = 'A'.repeat(250);
      expect(sanitizeTitle(longTitle).length).toBeLessThanOrEqual(200);
    });
  });
});

// ──────────────────────
// User Extractor Tests
// ──────────────────────

describe('User Extractor', () => {
  describe('extractUserData', () => {
    it('extracts name from German introduction', () => {
      const result = extractUserData('Ich heiße Max Mustermann und möchte geduzt werden.');
      expect(result.full_name).toBe('Max Mustermann');
      expect(result.form_of_address).toBe('du');
    });

    it('extracts name from English introduction', () => {
      const result = extractUserData('My name is John Smith.');
      expect(result.full_name).toBe('John Smith');
    });

    it('extracts form of address preference', () => {
      expect(extractUserData('Bitte per du').form_of_address).toBe('du');
      expect(extractUserData('Gerne per Sie').form_of_address).toBe('sie');
    });

    it('extracts language style preference', () => {
      expect(extractUserData('locker bitte').language_style).toBe('locker');
      expect(extractUserData('fachlich').language_style).toBe('fachlich');
    });

    it('returns empty object for unrecognized text', () => {
      const result = extractUserData('Random text without any patterns');
      expect(Object.keys(result).length).toBe(0);
    });
  });

  describe('extractBirthData', () => {
    it('extracts birth date and place from German text', () => {
      const result = extractBirthData('Ich bin am 15.03.1990 in Berlin geboren.');
      expect(result.birth_date).toBe('1990-03-15');
      expect(result.birth_place).toBe('Berlin');
    });

    it('extracts birth year only', () => {
      const result = extractBirthData('Geboren 1985 in München');
      expect(result.birth_date).toBe('1985-01-01');
      expect(result.birth_place).toBe('München');
    });

    it('extracts birth place without date', () => {
      const result = extractBirthData('Ich komme aus Hamburg');
      expect(result.birth_place).toBe('Hamburg');
    });

    it('returns empty object for unrecognized text', () => {
      const result = extractBirthData('No birth info here');
      expect(Object.keys(result).length).toBe(0);
    });
  });
});

// ──────────────────────
// Integration Tests
// ──────────────────────

describe('Integration', () => {
  it('routes and extracts identity data correctly', () => {
    const topic = 'identity';
    const content = 'Ich heiße Maria Schmidt, bitte per du.';
    
    expect(getDestination(topic)).toBe('users');
    
    const userData = extractUserData(content);
    expect(userData.full_name).toBe('Maria Schmidt');
    expect(userData.form_of_address).toBe('du');
  });

  it('routes and extracts origins data correctly', () => {
    const topic = 'origins';
    const content = 'Geboren am 10.05.1988 in Frankfurt';
    
    expect(getDestination(topic)).toBe('users');
    
    const birthData = extractBirthData(content);
    expect(birthData.birth_date).toBe('1988-05-10');
    expect(birthData.birth_place).toBe('Frankfurt');
  });

  it('routes influences to user_profile', () => {
    const topic = 'influences';
    expect(getDestination(topic)).toBe('user_profile');
    expect(isProfileTopic(topic)).toBe(true);
  });

  it('routes career to life_event with splitting', () => {
    const topic = 'career';
    expect(getDestination(topic)).toBe('life_event');
    expect(needsSplitting(topic)).toBe(true);
    expect(getCategoryForTopic(topic)).toBe('career');
  });
});
