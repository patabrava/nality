/**
 * Onboarding to Life Event Mapper
 * Converts onboarding answers to life events for the timeline
 */

import type { LifeEventCategoryType } from '@nality/schema';

interface OnboardingAnswer {
  id: string;
  user_id: string;
  question_topic: string;
  question_text?: string;
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
// These match the topics from inferQuestionTopic: identity, family, education, career, influences
const TOPIC_MAPPINGS: Record<string, {
  category: LifeEventCategoryType;
  titleTemplate: (answer: string) => string;
  importance: number;
}> = {
  // Primary topics from inferQuestionTopic
  'identity': {
    category: 'personal',
    titleTemplate: (answer) => {
      // Try to extract meaningful info from identity answers
      const lower = answer.toLowerCase();
      if (lower.includes('geboren') || lower.match(/\d{4}/)) {
        const year = answer.match(/\d{4}/)?.[0];
        return year ? `Born ${year}` : 'Birth Info';
      }
      return `Profile: ${answer.slice(0, 40)}`;
    },
    importance: 8,
  },
  'family': {
    category: 'family',
    titleTemplate: (answer) => {
      const lower = answer.toLowerCase();
      if (lower.includes('bruder') || lower.includes('schwester') || lower.includes('geschwister')) {
        return `Siblings: ${answer.slice(0, 40)}`;
      }
      if (lower.includes('kind') || lower.includes('children')) {
        if (lower.includes('kein') || lower.includes('no')) return 'No Children';
        return `Children: ${answer.slice(0, 40)}`;
      }
      return `Family: ${answer.slice(0, 40)}`;
    },
    importance: 7,
  },
  'education': {
    category: 'education',
    titleTemplate: (answer) => {
      // Extract degree or school name for title
      const lower = answer.toLowerCase();
      if (lower.includes('bachelor')) return `Bachelor: ${answer.slice(0, 35)}`;
      if (lower.includes('master')) return `Master: ${answer.slice(0, 35)}`;
      if (lower.includes('abitur')) return `Abitur: ${answer.slice(0, 35)}`;
      if (lower.includes('universit') || lower.includes('uni ')) return `University: ${answer.slice(0, 35)}`;
      return `Education: ${answer.slice(0, 40)}`;
    },
    importance: 7,
  },
  'career': {
    category: 'career',
    titleTemplate: (answer) => {
      // Try to extract role or company
      const lower = answer.toLowerCase();
      if (lower.includes('head of')) return `Head of: ${answer.slice(0, 35)}`;
      if (lower.includes('manager')) return `Manager: ${answer.slice(0, 35)}`;
      if (lower.includes('director')) return `Director: ${answer.slice(0, 35)}`;
      return `Career: ${answer.slice(0, 40)}`;
    },
    importance: 7,
  },
  'influences': {
    category: 'personal',
    titleTemplate: (answer) => `Influences: ${answer.slice(0, 40)}`,
    importance: 5,
  },
  // Legacy mappings for backwards compatibility
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
  'siblings': {
    category: 'family',
    titleTemplate: (answer) => {
      const lower = answer.toLowerCase();
      if (lower.includes('kein') || lower.includes('no') || lower === '0') return 'Only Child';
      return `Siblings: ${answer.slice(0, 50)}`;
    },
    importance: 6,
  },
  'children': {
    category: 'family',
    titleTemplate: (answer) => {
      const lower = answer.toLowerCase();
      if (lower.includes('kein') || lower.includes('no') || lower === '0') return 'No Children';
      return `Children: ${answer.slice(0, 50)}`;
    },
    importance: 9,
  },
  'role_models': {
    category: 'family',
    titleTemplate: (answer) => `Role Model: ${answer.slice(0, 50)}`,
    importance: 6,
  },
  'important_places': {
    category: 'travel',
    titleTemplate: (answer) => `Important Places: ${answer.slice(0, 50)}`,
    importance: 6,
  },
};

/**
 * Infer specific topic from question text for event mapping
 * Returns a specific topic key that maps to TOPIC_MAPPINGS
 */
function inferTopicFromQuestion(questionText: string): string | null {
  if (!questionText) return null;
  const q = questionText.toLowerCase();
  
  // Birth-related
  if (q.includes('geburtsdatum') || q.includes('geboren')) return 'birth_date';
  if (q.includes('geburtsort')) return 'birth_place';
  
  // Family-related
  if (q.includes('geschwister') || q.includes('bruder') || q.includes('schwester')) return 'siblings';
  if (q.includes('kinder')) return 'children';
  if (q.includes('eltern') || q.includes('mutter') || q.includes('vater')) return 'parents';
  if (q.includes('partner') || q.includes('verheiratet') || q.includes('ehe')) return 'partner';
  
  // Education-related
  if (q.includes('schule') || q.includes('grundschule')) return 'education';
  if (q.includes('studium') || q.includes('universität')) return 'education';
  
  // Career-related
  if (q.includes('beruf') || q.includes('arbeit') || q.includes('rolle')) return 'career_start';
  
  // Influences-related
  if (q.includes('autor') || q.includes('geprägt')) return 'influences';
  if (q.includes('bewunder') || q.includes('person') || q.includes('vorbild')) return 'role_models';
  if (q.includes('orte') || q.includes('stadt') || q.includes('region')) return 'important_places';
  
  return null;
}

/**
 * Map an onboarding answer to a potential life event
 */
export function mapAnswerToEvent(answer: OnboardingAnswer): MappedEvent | null {
  let topic = answer.question_topic?.toLowerCase() || '';
  
  // If topic is generic "identity", try to infer from question text
  if (topic === 'identity' && answer.question_text) {
    const inferred = inferTopicFromQuestion(answer.question_text);
    if (inferred) {
      topic = inferred;
      console.log(`[onboarding-mapper] Inferred topic "${inferred}" from question text`);
    }
  }
  
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
