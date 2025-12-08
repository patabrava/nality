/**
 * Profile Data Extractor
 * 
 * Uses AI to extract profile attributes (values, influences, motto) from
 * onboarding answers Q6 (influences) and Q7 (values).
 */

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import type { ExtractedProfileData } from './types';

// ──────────────────────
// Types for LLM Output
// ──────────────────────

interface LLMInfluence {
  name: string;
  type: 'author' | 'philosopher' | 'person' | 'mentor' | 'public_figure' | 'historical' | 'other';
  why?: string;
}

interface LLMRoleModel {
  name: string;
  relationship?: string;
  traits?: string[];
}

interface LLMProfileResult {
  values?: string[];
  motto?: string;
  influences?: LLMInfluence[];
  role_models?: LLMRoleModel[];
  favorite_authors?: string[];
}

// ──────────────────────
// Extraction Prompts
// ──────────────────────

const PROFILE_SYSTEM_PROMPT = `You are an expert at extracting personal profile attributes from biography text.

Your task is to identify values, influences, role models, and life mottos from user answers.

CRITICAL RULES:
1. For INFLUENCES: Extract names of people who shaped their thinking (authors, philosophers, mentors)
2. For VALUES: Extract up to 3 core values they mentioned
3. For MOTTO: Extract any life motto, guiding principle, or favorite quote
4. Categorize influences correctly (author, philosopher, person, mentor, public_figure, historical)
5. Preserve the original language (German/English)
6. This is NOT about life events - it's about WHO they are, not WHAT happened`;

/**
 * Build the extraction prompt based on topic
 */
function buildProfilePrompt(answerText: string, topic: string): string {
  const topicGuidance = topic === 'influences' 
    ? `Focus on extracting:
- influences: People who shaped their thinking (with type: author/philosopher/person/mentor/public_figure/historical)
- role_models: Personal role models with their admired traits
- favorite_authors: List of author names if mentioned`
    : `Focus on extracting:
- values: Up to 3 core life values
- motto: Any life motto, guiding principle, or favorite quote`;

  return `Extract profile attributes from this ${topic} answer.

${topicGuidance}

Answer to extract from:
"${answerText}"

IMPORTANT: Respond ONLY with valid JSON in this format:
{
  "values": ["value1", "value2"],
  "motto": "Life motto or null",
  "influences": [{"name": "Name", "type": "philosopher", "why": "reason or null"}],
  "role_models": [{"name": "Name", "relationship": "family", "traits": ["trait1"]}],
  "favorite_authors": ["Author1", "Author2"]
}

Only include fields that are relevant to the answer. Omit empty arrays.`;
}

// ──────────────────────
// Main Extraction Function
// ──────────────────────

/**
 * Extract profile data from an onboarding answer
 * 
 * @param answerText - The user's answer text
 * @param topic - The topic (influences or values)
 * @returns Extracted profile data
 */
export async function extractProfileData(
  answerText: string,
  topic: string
): Promise<ExtractedProfileData> {
  // Skip if answer is too short
  if (!answerText || answerText.trim().length < 5) {
    console.warn('[profile-extractor] Answer too short to extract');
    return {};
  }
  
  try {
    console.log(`[profile-extractor] Extracting ${topic} from: "${answerText.slice(0, 50)}..."`);
    
    const { text } = await generateText({
      model: google('gemini-2.0-flash-exp'),
      system: PROFILE_SYSTEM_PROMPT,
      prompt: buildProfilePrompt(answerText, topic),
      temperature: 0.3,
    });
    
    // Parse JSON from response
    const parsed = parseJsonResponse(text);
    if (!parsed) {
      console.warn('[profile-extractor] Could not parse response');
      return {};
    }
    
    // Build result with only non-empty fields
    const result: ExtractedProfileData = {};
    
    if (parsed.values && parsed.values.length > 0) {
      result.values = parsed.values.slice(0, 5); // Limit to 5 values
    }
    
    if (parsed.motto && parsed.motto.trim()) {
      result.motto = parsed.motto.trim();
    }
    
    if (parsed.influences && parsed.influences.length > 0) {
      result.influences = parsed.influences.map(inf => {
        const base = {
          name: inf.name,
          type: (inf.type || 'other') as 'author' | 'philosopher' | 'person' | 'mentor' | 'public_figure' | 'historical' | 'other',
        };
        return inf.why ? { ...base, why: inf.why } : base;
      });
    }
    
    if (parsed.role_models && parsed.role_models.length > 0) {
      result.role_models = parsed.role_models.map(rm => {
        const base: { name: string; relationship?: string; traits?: string[] } = { name: rm.name };
        if (rm.relationship) {
          base.relationship = rm.relationship;
        }
        if (rm.traits && rm.traits.length > 0) {
          base.traits = rm.traits;
        }
        return base;
      });
    }
    
    if (parsed.favorite_authors && parsed.favorite_authors.length > 0) {
      result.favorite_authors = parsed.favorite_authors;
    }
    
    console.log(`[profile-extractor] Extracted:`, Object.keys(result));
    return result;
    
  } catch (error) {
    console.error('[profile-extractor] Extraction failed:', error);
    return {};
  }
}

// ──────────────────────
// Helper Functions
// ──────────────────────

/**
 * Parse JSON from LLM response, handling markdown code blocks
 */
function parseJsonResponse(text: string): LLMProfileResult | null {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch && jsonMatch[1] ? jsonMatch[1].trim() : text.trim();
    
    return JSON.parse(jsonStr) as LLMProfileResult;
  } catch {
    // Try to find JSON object directly
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]) as LLMProfileResult;
      } catch {
        console.error('[profile-extractor] Failed to parse JSON from response');
        return null;
      }
    }
    return null;
  }
}

/**
 * Simple extraction for influences without LLM (fallback)
 * Splits comma/und-separated names
 */
export function extractInfluencesSimple(text: string): ExtractedProfileData {
  const names = text
    .replace(/^(influences:|einflüsse:|vorbilder:)/i, '')
    .split(/[,;]|\s+und\s+|\s+and\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 1 && s.length < 100);
  
  if (names.length === 0) {
    return {};
  }
  
  return {
    influences: names.map(name => ({
      name,
      type: 'other' as const,
    })),
  };
}

/**
 * Simple extraction for values without LLM (fallback)
 */
export function extractValuesSimple(text: string): ExtractedProfileData {
  const values = text
    .replace(/^(values:|werte:)/i, '')
    .split(/[,;]|\s+und\s+|\s+and\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 1 && s.length < 50)
    .slice(0, 5);
  
  if (values.length === 0) {
    return {};
  }
  
  return { values };
}
