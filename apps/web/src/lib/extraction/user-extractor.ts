/**
 * User Data Extractor
 * 
 * Extracts user metadata from onboarding answers (Q1 identity, Q2 origins).
 * Uses regex-based extraction since these answers have predictable patterns.
 */

import type { ExtractedUserData } from './types';

// ──────────────────────
// Identity Extraction (Q1)
// ──────────────────────

/**
 * Extract user metadata from Q1 (Identity & Voice) answers
 * 
 * Expected content patterns:
 * - "Gerne per du, ich heiße Max Mustermann"
 * - "Sie, Dr. Hans Schmidt, fachlich"
 * - "du, Anna, locker"
 * 
 * @param answerText - The user's answer to Q1
 * @returns Extracted user data
 */
export function extractUserData(answerText: string): ExtractedUserData {
  const result: ExtractedUserData = {};
  const text = answerText.trim();
  const lower = text.toLowerCase();
  
  // Extract form_of_address (du/Sie)
  const formOfAddress = extractFormOfAddress(lower);
  if (formOfAddress) {
    result.form_of_address = formOfAddress;
  }
  
  // Extract language_style (prosa/fachlich/locker)
  const languageStyle = extractLanguageStyle(lower);
  if (languageStyle) {
    result.language_style = languageStyle;
  }
  
  // Extract full name
  const name = extractName(text);
  if (name) {
    result.full_name = name;
  }
  
  return result;
}

/**
 * Extract form of address preference
 */
function extractFormOfAddress(text: string): 'du' | 'sie' | undefined {
  // Check for explicit "du" preference
  const duPatterns = [
    /\bper du\b/,
    /\bgerne du\b/,
    /\blieber du\b/,
    /\bdu\s*,/,           // "du, ..." at start
    /^du\b/,              // starts with "du"
    /\bduz/,              // "duzen"
  ];
  
  if (duPatterns.some(p => p.test(text))) {
    return 'du';
  }
  
  // Check for explicit "Sie" preference
  const siePatterns = [
    /\bper sie\b/,
    /\bgerne sie\b/,
    /\blieber sie\b/,
    /\bsie\s*,/,          // "Sie, ..." at start
    /^sie\b/,             // starts with "Sie"
    /\bsiez/,             // "siezen"
  ];
  
  if (siePatterns.some(p => p.test(text))) {
    return 'sie';
  }
  
  return undefined;
}

/**
 * Extract language style preference
 */
function extractLanguageStyle(text: string): 'prosa' | 'fachlich' | 'locker' | undefined {
  // Check for prosa (narrative) style
  if (/\bprosa\b/.test(text) || /\berzählen/.test(text) || /\bnarrati/.test(text)) {
    return 'prosa';
  }
  
  // Check for fachlich (professional) style
  if (/\bfachlich\b/.test(text) || /\bstruktur/.test(text) || /\bprofession/.test(text)) {
    return 'fachlich';
  }
  
  // Check for locker (casual) style
  if (/\blocker\b/.test(text) || /\bentspannt\b/.test(text) || /\bcasual\b/.test(text)) {
    return 'locker';
  }
  
  return undefined;
}

/**
 * Extract full name from text
 */
function extractName(text: string): string | undefined {
  // Pattern: "ich heiße [Name]" or "ich bin [Name]" or "name ist [Name]"
  const namePatterns = [
    /(?:ich\s+)?heiße\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*)/i,
    /(?:ich\s+)?bin\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*)/i,
    /(?:mein\s+)?name\s+ist\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*)/i,
    /(?:i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /(?:my name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return cleanName(match[1]);
    }
  }
  
  // Fallback: Look for capitalized words that could be a name
  // After "du," or "Sie," there's often a name
  const afterAddressMatch = text.match(/(?:du|sie)\s*,\s*([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)?)/i);
  if (afterAddressMatch && afterAddressMatch[1]) {
    const potentialName = afterAddressMatch[1];
    // Make sure it's not a style word
    if (!isStyleWord(potentialName.toLowerCase())) {
      return cleanName(potentialName);
    }
  }
  
  return undefined;
}

/**
 * Check if a word is a style preference word (not a name)
 */
function isStyleWord(word: string): boolean {
  const styleWords = ['prosa', 'fachlich', 'locker', 'entspannt', 'strukturiert'];
  return styleWords.includes(word);
}

/**
 * Clean up a name string
 */
function cleanName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')  // Normalize spaces
    .replace(/[,.]$/, ''); // Remove trailing punctuation
}

// ──────────────────────
// Birth Data Extraction (Q2)
// ──────────────────────

/**
 * Extract birth information from Q2 (Origins) answers
 * 
 * Expected content patterns:
 * - "1990 in Berlin"
 * - "Geboren am 15. März 1990 in München"
 * - "Ich bin 1985 in Bogotá, Kolumbien geboren"
 * 
 * @param answerText - The user's answer to Q2
 * @returns Extracted birth data
 */
export function extractBirthData(answerText: string): { birth_date?: string; birth_place?: string } {
  const result: { birth_date?: string; birth_place?: string } = {};
  const text = answerText.trim();
  
  // Extract birth date/year
  const birthDate = extractBirthDate(text);
  if (birthDate) {
    result.birth_date = birthDate;
  }
  
  // Extract birth place
  const birthPlace = extractBirthPlace(text);
  if (birthPlace) {
    result.birth_place = birthPlace;
  }
  
  return result;
}

/**
 * Extract birth date from text
 */
function extractBirthDate(text: string): string | undefined {
  // Full date: DD.MM.YYYY or DD. Month YYYY
  const fullDateMatch = text.match(/(\d{1,2})\.?\s*(\d{1,2}|[A-Za-zäöü]+)\.?\s*(\d{4})/);
  if (fullDateMatch && fullDateMatch[1] && fullDateMatch[2] && fullDateMatch[3]) {
    const day = fullDateMatch[1].padStart(2, '0');
    let month = fullDateMatch[2];
    const year = fullDateMatch[3];
    
    // Convert month name to number if needed
    if (isNaN(parseInt(month))) {
      month = monthNameToNumber(month) || '01';
    } else {
      month = month.padStart(2, '0');
    }
    
    return `${year}-${month}-${day}`;
  }
  
  // Year only
  const yearMatch = text.match(/\b(19\d{2}|20[0-2]\d)\b/);
  if (yearMatch && yearMatch[1]) {
    return `${yearMatch[1]}-01-01`;
  }
  
  return undefined;
}

/**
 * Convert month name to number
 */
function monthNameToNumber(monthName: string): string | undefined {
  const months: Record<string, string> = {
    // German
    januar: '01', februar: '02', märz: '03', maerz: '03', april: '04',
    mai: '05', juni: '06', juli: '07', august: '08',
    september: '09', oktober: '10', november: '11', dezember: '12',
    // English
    january: '01', february: '02', march: '03',
    may: '05', june: '06', july: '07',
    october: '10', december: '12',
  };
  
  return months[monthName.toLowerCase()];
}

/**
 * Extract birth place from text
 */
function extractBirthPlace(text: string): string | undefined {
  // Pattern: "in [Place]" or "aus [Place]" or "geboren in [Place]"
  const placePatterns = [
    /geboren\s+(?:in|aus)\s+([A-ZÄÖÜ][a-zäöüß]+(?:[\s,]+[A-ZÄÖÜ][a-zäöüß]+)?)/i,
    /\bin\s+([A-ZÄÖÜ][a-zäöüß]+(?:[\s,]+[A-ZÄÖÜ][a-zäöüß]+)?)/i,
    /\baus\s+([A-ZÄÖÜ][a-zäöüß]+(?:[\s,]+[A-ZÄÖÜ][a-zäöüß]+)?)/i,
    /\bfrom\s+([A-Z][a-z]+(?:[\s,]+[A-Z][a-z]+)?)/i,
  ];
  
  for (const pattern of placePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const place = match[1].trim();
      // Make sure it's not a year or common word
      if (!isCommonWord(place) && !/^\d+$/.test(place)) {
        return cleanPlace(place);
      }
    }
  }
  
  return undefined;
}

/**
 * Check if a word is a common word (not a place name)
 */
function isCommonWord(word: string): boolean {
  const commonWords = [
    'der', 'die', 'das', 'ein', 'eine', 'und', 'oder',
    'the', 'a', 'an', 'and', 'or',
  ];
  return commonWords.includes(word.toLowerCase());
}

/**
 * Clean up a place name
 */
function cleanPlace(place: string): string {
  return place
    .trim()
    .replace(/[,.]$/, '')  // Remove trailing punctuation
    .replace(/\s+/g, ' '); // Normalize spaces
}
