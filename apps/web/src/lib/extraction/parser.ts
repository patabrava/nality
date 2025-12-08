/**
 * Extraction Parser
 * 
 * Parses [SAVE_MEMORY] blocks from chapter chat responses and
 * extracts structured life event data.
 */

import type { ExtractedLifeEvent, ExtractionSource } from './types';
import type { LifeEventCategoryType } from '@nality/schema';

// ──────────────────────
// [SAVE_MEMORY] Block Parsing
// ──────────────────────

/**
 * Regular expression to match [SAVE_MEMORY] blocks
 * Supports both English and German field names
 * 
 * Format:
 * [SAVE_MEMORY]
 * Title: Brief title
 * Date: YYYY-MM-DD or YYYY
 * Description: Details...
 */
const SAVE_MEMORY_REGEX = /\[SAVE_MEMORY\]\s*(?:Title|Titel)\s*:\s*(.+?)(?:\n|$)\s*(?:Date|Datum)\s*:\s*(.+?)(?:\n|$)\s*(?:Description|Beschreibung)\s*:\s*([\s\S]*?)(?=\[SAVE_MEMORY\]|$)/gi;

/**
 * Check if content contains any [SAVE_MEMORY] blocks
 */
export function hasSaveMemoryBlock(content: string): boolean {
  return /\[SAVE_MEMORY\]/i.test(content);
}

/**
 * Parse all [SAVE_MEMORY] blocks from content
 * 
 * @param content - The AI response content
 * @param defaultCategory - Category to use for extracted events
 * @returns Array of extracted life events
 */
export function parseSaveMemoryBlocks(
  content: string,
  defaultCategory: LifeEventCategoryType
): ExtractedLifeEvent[] {
  const events: ExtractedLifeEvent[] = [];
  
  // Reset regex lastIndex for fresh matching
  SAVE_MEMORY_REGEX.lastIndex = 0;
  
  let match;
  while ((match = SAVE_MEMORY_REGEX.exec(content)) !== null) {
    const title = match[1]?.trim();
    const dateStr = match[2]?.trim();
    const description = match[3]?.trim();
    
    // Skip if no title
    if (!title) {
      console.warn('[parser] Skipping SAVE_MEMORY block with empty title');
      continue;
    }
    
    const parsedDate = parseDate(dateStr);
    
    events.push({
      title: sanitizeTitle(title),
      description: sanitizeDescription(description || ''),
      start_date: parsedDate,
      category: defaultCategory,
      confidence: parsedDate ? 0.95 : 0.8, // Lower confidence if no date
      source: 'chapter_chat' as ExtractionSource,
    });
    
    console.log(`[parser] Extracted event: "${title}" (${parsedDate || 'no date'})`);
  }
  
  return events;
}

// ──────────────────────
// Date Parsing
// ──────────────────────

/**
 * Month name mappings (English and German)
 */
const MONTH_NAMES: Record<string, string> = {
  // English
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04',
  jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  // German
  januar: '01', februar: '02', märz: '03', maerz: '03',
  mai: '05', juni: '06', juli: '07',
  oktober: '10', dezember: '12',
};

/**
 * Parse a date string into YYYY-MM-DD format
 * Supports various formats:
 * - YYYY-MM-DD (ISO)
 * - YYYY (year only)
 * - Month YYYY (e.g., "March 2015", "März 2015")
 * - DD.MM.YYYY (German format)
 * - MM/DD/YYYY (US format)
 * 
 * @param dateStr - Date string to parse
 * @returns Parsed date in YYYY-MM-DD format, or null if unparseable
 */
export function parseDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  
  const trimmed = dateStr.trim().toLowerCase();
  
  // Handle "unknown" or empty
  if (!trimmed || trimmed === 'unknown' || trimmed === 'unbekannt') {
    return null;
  }
  
  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Year only (YYYY)
  if (/^\d{4}$/.test(trimmed)) {
    return `${trimmed}-01-01`;
  }
  
  // Month YYYY (e.g., "March 2015", "März 2015")
  const monthYearMatch = trimmed.match(/^(\w+)\s+(\d{4})$/);
  if (monthYearMatch && monthYearMatch[1] && monthYearMatch[2]) {
    const month = MONTH_NAMES[monthYearMatch[1]];
    if (month) {
      return `${monthYearMatch[2]}-${month}-01`;
    }
  }
  
  // German format: DD.MM.YYYY
  const germanMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (germanMatch && germanMatch[1] && germanMatch[2] && germanMatch[3]) {
    const day = germanMatch[1].padStart(2, '0');
    const month = germanMatch[2].padStart(2, '0');
    const year = germanMatch[3];
    return `${year}-${month}-${day}`;
  }
  
  // US format: MM/DD/YYYY or M/D/YYYY
  const usMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch && usMatch[1] && usMatch[2] && usMatch[3]) {
    const month = usMatch[1].padStart(2, '0');
    const day = usMatch[2].padStart(2, '0');
    const year = usMatch[3];
    return `${year}-${month}-${day}`;
  }
  
  // Try to extract just a year from the string
  const yearMatch = trimmed.match(/\b(19\d{2}|20[0-2]\d)\b/);
  if (yearMatch) {
    return `${yearMatch[1]}-01-01`;
  }
  
  console.warn(`[parser] Could not parse date: "${dateStr}"`);
  return null;
}

// ──────────────────────
// Sanitization
// ──────────────────────

/**
 * Sanitize a title string
 * - Trim whitespace
 * - Limit length
 * - Remove problematic characters
 */
export function sanitizeTitle(title: string): string {
  return title
    .trim()
    .replace(/[\r\n]+/g, ' ')  // Replace newlines with spaces
    .replace(/\s+/g, ' ')       // Collapse multiple spaces
    .substring(0, 200);         // Limit length
}

/**
 * Sanitize a description string
 * - Trim whitespace
 * - Limit length
 * - Preserve paragraph breaks
 */
export function sanitizeDescription(description: string): string {
  return description
    .trim()
    .replace(/\r\n/g, '\n')     // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Collapse multiple blank lines
    .substring(0, 1000);        // Limit length
}

// ──────────────────────
// Extraction Detection
// ──────────────────────

/**
 * Patterns that indicate the AI is confirming/saving an event
 * Used as fallback when [SAVE_MEMORY] is not present
 */
const SAVE_PATTERNS = [
  /would you like me to save this/i,
  /shall i save this/i,
  /i('ll| will) save this/i,
  /saving this memory/i,
  /i('ve| have) saved/i,
  /memory saved/i,
  /added to your timeline/i,
  /ich speichere/i,
  /gespeichert/i,
];

/**
 * Check if content indicates an event should be saved
 * (fallback for when [SAVE_MEMORY] is not used)
 */
export function indicatesSaveIntent(content: string): boolean {
  return SAVE_PATTERNS.some(pattern => pattern.test(content));
}
