/**
 * LLM-Powered Event Splitter
 * 
 * Uses AI to split composite onboarding answers into discrete life events.
 * For example: "I worked at A, then B, now C" → 3 separate career events.
 */

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import type { ExtractedLifeEvent } from './types';
import type { LifeEventCategoryType } from '@nality/schema';

// ──────────────────────
// Types for LLM Output
// ──────────────────────

/**
 * Shape of an extracted event from LLM
 */
interface LLMExtractedEvent {
  title: string;
  description: string;
  start_date: string | null;
  end_date?: string | null;
  is_ongoing?: boolean;
  location?: string | null;
}

/**
 * Shape of the full extraction result from LLM
 */
interface LLMExtractionResult {
  events: LLMExtractedEvent[];
}

// ──────────────────────
// Extraction Prompts
// ──────────────────────

/**
 * System prompt for event extraction
 */
const EXTRACTION_SYSTEM_PROMPT = `You are an expert at extracting discrete life events from biography text.

Your task is to identify and separate individual life events from a user's answer.

CRITICAL RULES:
1. Create SEPARATE events for each distinct milestone, role, school, or achievement
2. For CAREER: One event per job/role/company change
3. For EDUCATION: One event per school, degree, or certification  
4. For FAMILY: One event per milestone (marriage, child birth, sibling mention, etc.)
5. Extract dates when mentioned - even approximate dates like "2015" or "early 2000s" (use 2002)
6. If chronological order is implied but no dates given, estimate reasonable dates
7. NEVER use today's date or future dates
8. Keep titles concise but descriptive
9. Preserve the original language (German/English) in titles and descriptions`;

/**
 * Build the user prompt for extraction
 */
function buildExtractionPrompt(answerText: string, category: LifeEventCategoryType): string {
  const categoryGuidance = getCategoryGuidance(category);
  
  return `Extract all discrete life events from this ${category} answer.

${categoryGuidance}

Answer to extract from:
"${answerText}"

Extract ALL distinct events. Each event should have:
- title: Brief, descriptive title
- description: 1-2 sentences with context
- start_date: YYYY-MM-DD or YYYY format (null if truly unknown)
- end_date: If the event has ended (optional)
- is_ongoing: True if this is current (optional)
- location: City/place if mentioned (optional)`;
}

/**
 * Get category-specific extraction guidance
 */
function getCategoryGuidance(category: LifeEventCategoryType): string {
  switch (category) {
    case 'career':
      return `CAREER EXTRACTION RULES:
- Create one event per job position/role
- Include company name in title
- Mark current job as is_ongoing: true
- Example: "Data Analyst at Index Intelligence" → separate event
- Example: "Founded THE HUB" → separate event (category: achievement)`;
    
    case 'education':
      return `EDUCATION EXTRACTION RULES:
- Create one event per school/institution
- Create separate events for degrees/certifications
- Include school name and degree type in title
- Example: "Schiller Schule 1998-2010" → one event
- Example: "Master in Finance at Frankfurt University" → one event`;
    
    case 'family':
      return `FAMILY EXTRACTION RULES:
- Create one event per family milestone
- Siblings can be one event (e.g., "Two siblings: older brother, younger sister")
- Children should be separate events if birth dates differ
- Marriage/partnership is a separate event
- Example: "Married in 2015" → one event
- Example: "Two children born 2018 and 2020" → two events`;
    
    default:
      return `Extract each distinct event or milestone as a separate item.`;
  }
}

// ──────────────────────
// Main Extraction Function
// ──────────────────────

/**
 * Split a composite answer into discrete life events using LLM
 * 
 * @param answerText - The user's answer text
 * @param category - The life event category
 * @returns Array of extracted life events
 */
export async function splitCompositeAnswer(
  answerText: string,
  category: LifeEventCategoryType
): Promise<ExtractedLifeEvent[]> {
  // Skip if answer is too short
  if (!answerText || answerText.trim().length < 10) {
    console.warn('[llm-splitter] Answer too short to extract');
    return [];
  }
  
  try {
    console.log(`[llm-splitter] Extracting ${category} events from: "${answerText.slice(0, 50)}..."`);
    
    const jsonPrompt = `${buildExtractionPrompt(answerText, category)}

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "events": [
    {
      "title": "Event title",
      "description": "Event description",
      "start_date": "YYYY-MM-DD or YYYY or null",
      "end_date": "YYYY-MM-DD or YYYY or null",
      "is_ongoing": false,
      "location": "City or null"
    }
  ]
}`;

    const { text } = await generateText({
      model: google('gemini-2.0-flash-exp'),
      system: EXTRACTION_SYSTEM_PROMPT,
      prompt: jsonPrompt,
      temperature: 0.3,
    });
    
    // Parse JSON from response
    const parsed = parseJsonResponse(text);
    if (!parsed || !Array.isArray(parsed.events)) {
      throw new Error('Invalid response format');
    }
    
    // Transform to our ExtractedLifeEvent type
    const events: ExtractedLifeEvent[] = parsed.events.map((e: LLMExtractedEvent) => {
      const event: ExtractedLifeEvent = {
        title: sanitizeTitle(e.title || ''),
        description: sanitizeDescription(e.description || ''),
        start_date: normalizeDate(e.start_date),
        category,
        confidence: e.start_date ? 0.9 : 0.75,
        source: 'onboarding',
      };
      
      // Only add optional fields if they have values
      if (e.end_date) {
        event.end_date = normalizeDate(e.end_date);
      }
      if (e.is_ongoing !== undefined) {
        event.is_ongoing = e.is_ongoing;
      }
      if (e.location) {
        event.location = e.location;
      }
      
      return event;
    });
    
    console.log(`[llm-splitter] Extracted ${events.length} events`);
    return events;
    
  } catch (error) {
    console.error('[llm-splitter] Extraction failed:', error);
    
    // Fallback: return as single event with low confidence
    return [{
      title: `${capitalizeFirst(category)}: ${answerText.slice(0, 50)}${answerText.length > 50 ? '...' : ''}`,
      description: answerText,
      start_date: null,
      category,
      confidence: 0.5,
      source: 'onboarding',
    }];
  }
}

// ──────────────────────
// Helper Functions
// ──────────────────────

/**
 * Sanitize a title string
 */
function sanitizeTitle(title: string): string {
  return title
    .trim()
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .substring(0, 200);
}

/**
 * Sanitize a description string
 */
function sanitizeDescription(description: string): string {
  return description
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .substring(0, 1000);
}

/**
 * Normalize a date string to YYYY-MM-DD format
 */
function normalizeDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  
  const trimmed = dateStr.trim();
  
  // Already in correct format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Year only
  if (/^\d{4}$/.test(trimmed)) {
    return `${trimmed}-01-01`;
  }
  
  // Try to extract year
  const yearMatch = trimmed.match(/\b(19\d{2}|20[0-2]\d)\b/);
  if (yearMatch && yearMatch[1]) {
    return `${yearMatch[1]}-01-01`;
  }
  
  return null;
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Parse JSON from LLM response, handling markdown code blocks
 */
function parseJsonResponse(text: string): LLMExtractionResult | null {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch && jsonMatch[1] ? jsonMatch[1].trim() : text.trim();
    
    return JSON.parse(jsonStr) as LLMExtractionResult;
  } catch {
    // Try to find JSON object directly
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]) as LLMExtractionResult;
      } catch {
        console.error('[llm-splitter] Failed to parse JSON from response');
        return null;
      }
    }
    return null;
  }
}
