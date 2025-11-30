/**
 * Onboarding to Life Event Mapper
 * Converts onboarding answers to life events for the timeline
 */

import type { LifeEventCategoryType } from '@nality/schema';

interface OnboardingAnswer {
  id: string;
  user_id: string;
  question_topic: string;
  answer_text: string;
  created_at: string;
}

interface MappedEvent {
  title: string;
  description: string;
  start_date: string;
  category: LifeEventCategoryType;
  importance: number;
  metadata: {
    source: string;
    onboarding_answer_id: string;
    question_topic: string;
  };
}

// Map question topics to categories and event templates
const TOPIC_MAPPINGS: Record<string, {
  category: LifeEventCategoryType;
  titleTemplate: (answer: string) => string;
  importance: number;
}> = {
  'birth_date': {
    category: 'personal',
    titleTemplate: () => 'Born',
    importance: 10,
  },
  'birth_place': {
    category: 'personal',
    titleTemplate: (answer) => `Born in ${answer}`,
    importance: 9,
  },
  'full_name': {
    category: 'personal',
    titleTemplate: (answer) => `Named ${answer}`,
    importance: 8,
  },
  'parents': {
    category: 'family',
    titleTemplate: () => 'Family Origins',
    importance: 8,
  },
  'siblings': {
    category: 'family',
    titleTemplate: (answer) => answer.toLowerCase().includes('no') ? 'Only Child' : 'Siblings',
    importance: 6,
  },
  'childhood_home': {
    category: 'personal',
    titleTemplate: (answer) => `Childhood in ${answer.split(',')[0] || answer}`,
    importance: 7,
  },
  'education': {
    category: 'education',
    titleTemplate: () => 'Education Journey',
    importance: 7,
  },
  'first_school': {
    category: 'education',
    titleTemplate: (answer) => `Started School - ${answer}`,
    importance: 6,
  },
  'career_start': {
    category: 'career',
    titleTemplate: () => 'Career Beginning',
    importance: 7,
  },
  'first_job': {
    category: 'career',
    titleTemplate: (answer) => `First Job: ${answer.slice(0, 50)}`,
    importance: 6,
  },
  'marriage': {
    category: 'relationship',
    titleTemplate: () => 'Marriage',
    importance: 9,
  },
  'partner': {
    category: 'relationship',
    titleTemplate: () => 'Life Partner',
    importance: 8,
  },
  'children': {
    category: 'family',
    titleTemplate: (answer) => answer.toLowerCase().includes('no') ? 'Life Without Children' : 'Parenthood',
    importance: 9,
  },
};

/**
 * Map an onboarding answer to a potential life event
 */
export function mapAnswerToEvent(answer: OnboardingAnswer): MappedEvent | null {
  const topic = answer.question_topic?.toLowerCase() || '';
  
  // Find matching topic
  const mapping = Object.entries(TOPIC_MAPPINGS).find(([key]) => 
    topic.includes(key)
  );
  
  if (!mapping) {
    console.log(`[onboarding-mapper] No mapping for topic: ${topic}`);
    return null;
  }
  
  const [, config] = mapping;
  const answerText = answer.answer_text || '';
  
  // Don't create events for empty or very short answers
  if (answerText.length < 3) {
    return null;
  }
  
  return {
    title: config.titleTemplate(answerText),
    description: answerText,
    start_date: extractDateFromAnswer(answerText) ?? new Date().toISOString().slice(0, 10),
    category: config.category,
    importance: config.importance,
    metadata: {
      source: 'onboarding',
      onboarding_answer_id: answer.id,
      question_topic: answer.question_topic || '',
    }
  };
}

/**
 * Try to extract a date from the answer text
 */
function extractDateFromAnswer(text: string): string | null {
  // Look for year patterns
  const yearMatch = text.match(/\b(19\d{2}|20[0-2]\d)\b/);
  if (yearMatch) {
    return `${yearMatch[1]}-01-01`;
  }
  return null;
}

/**
 * Convert all onboarding answers to life events
 */
export async function convertOnboardingToEvents(
  userId: string,
  supabase: any
): Promise<{ created: number; skipped: number; errors: string[] }> {
  const result = { created: 0, skipped: 0, errors: [] as string[] };
  
  try {
    // Fetch all onboarding answers for user
    const { data: answers, error: fetchError } = await supabase
      .from('onboarding_answers')
      .select('*')
      .eq('user_id', userId);
    
    if (fetchError) {
      result.errors.push(`Failed to fetch answers: ${fetchError.message}`);
      return result;
    }
    
    if (!answers || answers.length === 0) {
      return result;
    }
    
    // Get existing events to avoid duplicates
    const { data: existingEvents } = await supabase
      .from('life_event')
      .select('metadata')
      .eq('user_id', userId)
      .not('metadata->onboarding_answer_id', 'is', null);
    
    const existingAnswerIds = new Set(
      existingEvents?.map((e: any) => e.metadata?.onboarding_answer_id) || []
    );
    
    // Map and create events
    for (const answer of answers) {
      // Skip if already converted
      if (existingAnswerIds.has(answer.id)) {
        result.skipped++;
        continue;
      }
      
      const mapped = mapAnswerToEvent(answer);
      if (!mapped) {
        result.skipped++;
        continue;
      }
      
      // Create the life event
      const { error: insertError } = await supabase
        .from('life_event')
        .insert([{
          user_id: userId,
          ...mapped
        }]);
      
      if (insertError) {
        result.errors.push(`Failed to create event for ${answer.question_topic}: ${insertError.message}`);
      } else {
        result.created++;
      }
    }
    
    console.log(`[onboarding-mapper] Conversion complete:`, result);
    return result;
    
  } catch (err) {
    result.errors.push(`Unexpected error: ${err}`);
    return result;
  }
}
