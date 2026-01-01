import { describe, expect, it } from 'vitest';
import { extractUserData, extractBirthData } from '@/lib/extraction/user-extractor';
import { getDestination, TOPIC_ROUTING } from '@/lib/extraction/router';

/**
 * Tests for onboarding data extraction
 * 
 * Validates that user data, birth data, and profile data are correctly
 * extracted from onboarding answers.
 */

describe('User Data Extraction (Q1: Identity)', () => {
  describe('extractUserData', () => {
    it('extracts form of address "du"', () => {
      const result = extractUserData('Ich heiße Max, bitte per du.');
      expect(result.form_of_address).toBe('du');
    });

    it('extracts form of address "sie"', () => {
      const result = extractUserData('Gerne per Sie, Dr. Schmidt.');
      expect(result.form_of_address).toBe('sie');
    });

    it('extracts language style "prosa"', () => {
      const result = extractUserData('ich bin Camillo, kannst du mich per Du ansprechen und Prosa passt zu mir');
      expect(result.language_style).toBe('prosa');
    });

    it('extracts language style "fachlich"', () => {
      const result = extractUserData('Fachlich, strukturiert bitte.');
      expect(result.language_style).toBe('fachlich');
    });

    it('extracts language style "locker"', () => {
      const result = extractUserData('Locker und entspannt passt zu mir.');
      expect(result.language_style).toBe('locker');
    });

    it('extracts full name with "ich heiße"', () => {
      const result = extractUserData('Ich heiße Max Mustermann');
      expect(result.full_name).toBe('Max Mustermann');
    });

    it('extracts full name with "ich bin"', () => {
      const result = extractUserData('Ich bin Camillo Echeverri');
      expect(result.full_name).toBe('Camillo Echeverri');
    });

    it('extracts all identity fields together', () => {
      const result = extractUserData('ich bin Camillo ECE veri kannst du mich per Du ansprechen und Prosa passt zu mir');
      expect(result.form_of_address).toBe('du');
      expect(result.language_style).toBe('prosa');
      // Name should be extracted (may not be perfect due to voice transcription)
      expect(result.full_name).toBeDefined();
    });
  });
});

describe('Birth Data Extraction (Q2: Origins)', () => {
  describe('extractBirthData', () => {
    it('extracts birth year only', () => {
      const result = extractBirthData('Ich bin 1993 geboren');
      expect(result.birth_date).toBe('1993-01-01');
    });

    it('extracts full birth date with German format', () => {
      const result = extractBirthData('Geboren am 26. August 1993');
      expect(result.birth_date).toBe('1993-08-26');
    });

    it('extracts birth date from conversational text', () => {
      const result = extractBirthData('ich bin am 26 August 1993 in Bogota Kolumbien geboren');
      expect(result.birth_date).toBe('1993-08-26');
    });

    it('extracts birth place with "in"', () => {
      const result = extractBirthData('ich bin am 26 August 1993 in Bogota Kolumbien geboren');
      expect(result.birth_place).toBeDefined();
      expect(result.birth_place?.toLowerCase()).toContain('bogota');
    });

    it('extracts birth place from simple statement', () => {
      const result = extractBirthData('Geboren in Berlin');
      expect(result.birth_place).toBe('Berlin');
    });

    it('extracts both date and place', () => {
      const result = extractBirthData('Geboren am 10.05.1988 in Frankfurt.');
      expect(result.birth_date).toBe('1988-05-10');
      expect(result.birth_place).toBe('Frankfurt');
    });

    it('handles various date formats', () => {
      const result1 = extractBirthData('1990 in München');
      expect(result1.birth_date).toBe('1990-01-01');
      
      const result2 = extractBirthData('15. März 1985');
      expect(result2.birth_date).toBe('1985-03-15');
    });
  });
});

describe('Topic Routing', () => {
  describe('getDestination', () => {
    it('routes identity to users', () => {
      expect(getDestination('identity')).toBe('users');
    });

    it('routes origins to users', () => {
      expect(getDestination('origins')).toBe('users');
    });

    it('routes family to life_event', () => {
      expect(getDestination('family')).toBe('life_event');
    });

    it('routes education to life_event', () => {
      expect(getDestination('education')).toBe('life_event');
    });

    it('routes career to life_event', () => {
      expect(getDestination('career')).toBe('life_event');
    });

    it('routes influences to user_profile', () => {
      expect(getDestination('influences')).toBe('user_profile');
    });

    it('routes values to user_profile', () => {
      expect(getDestination('values')).toBe('user_profile');
    });

    it('routes unknown topics to skip', () => {
      expect(getDestination('unknown')).toBe('skip');
    });

    it('handles case insensitivity', () => {
      expect(getDestination('IDENTITY')).toBe('users');
      expect(getDestination('Origins')).toBe('users');
      expect(getDestination('VALUES')).toBe('user_profile');
    });
  });

  describe('TOPIC_ROUTING constant', () => {
    it('has all 7 required topics', () => {
      const topics = Object.keys(TOPIC_ROUTING);
      expect(topics).toContain('identity');
      expect(topics).toContain('origins');
      expect(topics).toContain('family');
      expect(topics).toContain('education');
      expect(topics).toContain('career');
      expect(topics).toContain('influences');
      expect(topics).toContain('values');
      expect(topics).toHaveLength(7);
    });
  });
});

describe('End-to-End Extraction Scenarios', () => {
  describe('Real onboarding conversation flow', () => {
    it('Q1 answer extracts identity data', () => {
      const answer = 'ich bin Camillo ECE veri kannst du mich per Du ansprechen und Prosa passt zu mir';
      const result = extractUserData(answer);
      
      expect(result.form_of_address).toBe('du');
      expect(result.language_style).toBe('prosa');
    });

    it('Q2 answer extracts birth data', () => {
      const answer = 'ich bin am 26 August 1993 in Bogota Kolumbien geboren';
      const result = extractBirthData(answer);
      
      expect(result.birth_date).toBe('1993-08-26');
      expect(result.birth_place).toBeDefined();
    });

    it('routes Q2 (origins) to users table', () => {
      // This is the key fix - origins should route to users, not identity
      expect(getDestination('origins')).toBe('users');
    });

    it('routes Q7 (values) to user_profile table', () => {
      // This is the key fix - values should route to user_profile, not life_event
      expect(getDestination('values')).toBe('user_profile');
    });
  });

  describe('Voice transcription handling', () => {
    it('handles imperfect voice transcription for birth date', () => {
      // Voice might transcribe "26. August" as "26 August"
      const result = extractBirthData('ich bin am 26 August 1993 geboren');
      expect(result.birth_date).toBe('1993-08-26');
    });

    it('handles lowercase place names from voice', () => {
      const result = extractBirthData('geboren in bogota');
      // Should still extract the place
      expect(result.birth_place?.toLowerCase()).toBe('bogota');
    });
  });
});
