/**
 * Event Extraction Utility
 * Parses AI chat responses to extract life event data
 */

import type { LifeEventCategoryType } from '@nality/schema';

export interface ExtractedEvent {
  title: string;
  description: string;
  suggestedDate: string | null;
  category: LifeEventCategoryType;
  confidence: number;
}

/**
 * Patterns to detect when AI is confirming/saving an event
 */
const SAVE_PATTERNS = [
  /would you like me to save this/i,
  /shall i save this/i,
  /i('ll| will) save this as/i,
  /saving this memory/i,
  /i('ve| have) saved/i,
  /memory saved/i,
  /added to your timeline/i,
  /i'd title it/i,
];

/**
 * Check if AI message indicates event extraction
 */
export function isEventExtractionMessage(content: string): boolean {
  return SAVE_PATTERNS.some(pattern => pattern.test(content));
}

/**
 * Extract event data from AI message
 */
export function extractEventFromMessage(
  content: string, 
  category: LifeEventCategoryType
): ExtractedEvent | null {
  if (!isEventExtractionMessage(content)) {
    return null;
  }

  // Try to extract title from quotes or after "title it"
  const titleMatch = content.match(
    /(?:title(?:d)? it|i'd call it|save (?:this )?as)[:\s]*["']([^"']+)["']/i
  ) || content.match(
    /["']([^"']{10,100})["']/
  );

  // Try to extract date references
  const dateMatch = content.match(
    /(?:from|in|around|circa|dated?)\s+(\d{4}|\w+\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
  );

  // If we found a title, create the extracted event
  if (titleMatch && titleMatch[1]) {
    const title = titleMatch[1].trim();
    
    // Use the full message minus the save prompt as description
    const description = content
      .replace(/would you like me to save this.*$/i, '')
      .replace(/shall i save this.*$/i, '')
      .replace(/i'd title it.*$/i, '')
      .trim();

    return {
      title,
      description: description.length > 500 ? description.slice(0, 500) + '...' : description,
      suggestedDate: parseDateString(dateMatch?.[1]),
      category,
      confidence: 0.8
    };
  }

  return null;
}

/**
 * Parse various date string formats to YYYY-MM-DD
 */
function parseDateString(dateStr: string | undefined): string | null {
  if (!dateStr) return null;

  // Handle year only (e.g., "1985")
  if (/^\d{4}$/.test(dateStr)) {
    return `${dateStr}-01-01`;
  }

  // Handle "Month Year" (e.g., "March 1985")
  const monthYearMatch = dateStr.match(/^(\w+)\s+(\d{4})$/);
  if (monthYearMatch && monthYearMatch[1] && monthYearMatch[2]) {
    const months: Record<string, string> = {
      january: '01', february: '02', march: '03', april: '04',
      may: '05', june: '06', july: '07', august: '08',
      september: '09', october: '10', november: '11', december: '12'
    };
    const month = months[monthYearMatch[1].toLowerCase()];
    if (month) {
      return `${monthYearMatch[2]}-${month}-01`;
    }
  }

  // Handle MM/DD/YYYY or DD/MM/YYYY
  const slashMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (slashMatch && slashMatch[1] && slashMatch[2] && slashMatch[3]) {
    const a = slashMatch[1];
    const b = slashMatch[2];
    let year = slashMatch[3];
    if (year.length === 2) {
      year = (parseInt(year) > 50 ? '19' : '20') + year;
    }
    // Assume MM/DD/YYYY for US format
    const month = a.padStart(2, '0');
    const day = b.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return null;
}

/**
 * Create life event from extracted data
 */
export async function createLifeEventFromExtraction(
  extraction: ExtractedEvent,
  userId: string,
  supabase: any
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const eventData = {
      user_id: userId,
      title: extraction.title,
      description: extraction.description,
      start_date: extraction.suggestedDate || new Date().toISOString().split('T')[0],
      category: extraction.category,
      importance: 5,
      metadata: {
        source: 'chat_extraction',
        confidence: extraction.confidence,
        extracted_at: new Date().toISOString()
      }
    };

    const { data, error } = await supabase
      .from('life_event')
      .insert([eventData])
      .select('id')
      .single();

    if (error) {
      console.error('❌ Failed to create life event:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Created life event from extraction:', data.id);
    return { success: true, eventId: data.id };
  } catch (err) {
    console.error('❌ Unexpected error creating life event:', err);
    return { success: false, error: 'Unexpected error' };
  }
}
