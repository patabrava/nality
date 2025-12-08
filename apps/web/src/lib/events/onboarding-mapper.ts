/**
 * Onboarding to Life Event Mapper (v2)
 * 
 * Routes onboarding answers to correct destinations via the unified extraction API:
 * - identity/origins → users table
 * - influences/values → user_profile table  
 * - family/education/career → life_event table (with LLM splitting)
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// ──────────────────────
// Types
// ──────────────────────

interface OnboardingAnswer {
  id: string;
  user_id: string;
  question_topic: string;
  question_text?: string;
  answer_text: string;
  answer_json?: {
    extracted?: boolean;
    extracted_at?: string;
  };
  created_at: string;
}

interface ConversionResult {
  usersUpdated: boolean;
  profileUpdated: boolean;
  eventsCreated: number;
  skipped: number;
  errors: string[];
}

// ──────────────────────
// Main Conversion Function
// ──────────────────────

/**
 * Convert all onboarding answers using the unified extraction pipeline
 * 
 * Routes data to correct destinations:
 * - Q1 (identity) → users table (name, form_of_address, language_style)
 * - Q2 (origins) → users table (birth_date, birth_place)
 * - Q3 (family) → life_event table (split into multiple events)
 * - Q4 (education) → life_event table (split into multiple events)
 * - Q5 (career) → life_event table (split into multiple events)
 * - Q6 (influences) → user_profile table
 * - Q7 (values) → user_profile table
 */
export async function convertOnboardingToEvents(
  userId: string,
  supabase: SupabaseClient,
  options?: {
    baseUrl?: string;
    accessToken?: string;
  }
): Promise<ConversionResult> {
  const result: ConversionResult = {
    usersUpdated: false,
    profileUpdated: false,
    eventsCreated: 0,
    skipped: 0,
    errors: [],
  };

  const baseUrl = options?.baseUrl || process.env.NEXT_PUBLIC_APP_URL || '';

  try {
    // Fetch all onboarding answers for user
    const { data: answers, error: fetchError } = await supabase
      .from('onboarding_answers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      result.errors.push(`Failed to fetch answers: ${fetchError.message}`);
      return result;
    }

    if (!answers || answers.length === 0) {
      console.log('[onboarding-mapper] No answers to convert');
      return result;
    }

    console.log(`[onboarding-mapper] Processing ${answers.length} answers for user ${userId}`);

    // Process each answer through extraction API
    for (const answer of answers as OnboardingAnswer[]) {
      // Skip if already extracted
      if (answer.answer_json?.extracted) {
        console.log(`[onboarding-mapper] Skipping already extracted: ${answer.question_topic}`);
        result.skipped++;
        continue;
      }

      // Skip empty answers
      if (!answer.answer_text || answer.answer_text.trim().length < 3) {
        result.skipped++;
        continue;
      }

      try {
        console.log(`[onboarding-mapper] Extracting ${answer.question_topic}...`);
        
        const response = await fetch(`${baseUrl}/api/events/extract`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: answer.answer_text,
            source: 'onboarding',
            topic: answer.question_topic,
            userId,
            accessToken: options?.accessToken,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          result.errors.push(`Failed to extract ${answer.question_topic}: ${errorText}`);
          continue;
        }

        const extractResult = await response.json();
        
        if (!extractResult.success) {
          result.errors.push(`Extraction failed for ${answer.question_topic}: ${extractResult.error}`);
          continue;
        }

        // Track what was done
        switch (extractResult.destination) {
          case 'users':
            result.usersUpdated = true;
            console.log(`[onboarding-mapper] Updated users table from ${answer.question_topic}`);
            break;
          case 'user_profile':
            result.profileUpdated = true;
            console.log(`[onboarding-mapper] Updated user_profile from ${answer.question_topic}`);
            break;
          case 'life_event':
            const eventCount = extractResult.events?.length || 0;
            result.eventsCreated += eventCount;
            console.log(`[onboarding-mapper] Created ${eventCount} life events from ${answer.question_topic}`);
            break;
          default:
            result.skipped++;
            console.log(`[onboarding-mapper] Skipped ${answer.question_topic} (destination: ${extractResult.destination})`);
        }

        // Mark answer as processed
        await supabase
          .from('onboarding_answers')
          .update({
            answer_json: {
              ...answer.answer_json,
              extracted: true,
              extracted_at: new Date().toISOString(),
              destination: extractResult.destination,
            },
          })
          .eq('id', answer.id);

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        result.errors.push(`Error processing ${answer.question_topic}: ${errorMsg}`);
        console.error(`[onboarding-mapper] Error:`, err);
      }
    }

    console.log(`[onboarding-mapper] Conversion complete:`, result);
    return result;

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    result.errors.push(`Unexpected error: ${errorMsg}`);
    return result;
  }
}

// ──────────────────────
// Legacy Support
// ──────────────────────

/**
 * @deprecated Use convertOnboardingToEvents instead
 * Kept for backwards compatibility during migration
 */
export function mapAnswerToEvent(): null {
  console.warn('[onboarding-mapper] mapAnswerToEvent is deprecated. Use convertOnboardingToEvents instead.');
  return null;
}
