import {
  extractBirthData,
  extractProfileData,
  type ExtractedProfileData,
} from '@/lib/extraction';
import type { InterviewQuestionProgress } from './contracts';

type ServiceClient = {
  from: (...args: any[]) => any;
};

interface SyncInput {
  serviceClient: ServiceClient;
  userId: string;
  currentQuestionId: string;
  currentAnswerText: string;
  progressRows: InterviewQuestionProgress[];
}

const PROFILE_TOPIC_BY_QUESTION_ID: Record<string, 'influences' | 'values'> = {
  'family.influence': 'influences',
  'relationships.social_values': 'values',
  'values.self_description': 'values',
  'values.strengths': 'values',
  'values.guiding_values': 'values',
  'future.motivation': 'values',
  'future.success': 'values',
  'narrative.quote': 'values',
};

interface SyncCandidate {
  questionId: string;
  answerText: string;
}

function hasProfileData(row: Record<string, unknown> | null): boolean {
  if (!row) return false;

  const values = Array.isArray(row.values) ? row.values : [];
  const influences = Array.isArray(row.influences) ? row.influences : [];
  const roleModels = Array.isArray(row.role_models) ? row.role_models : [];
  const favoriteAuthors = Array.isArray(row.favorite_authors) ? row.favorite_authors : [];
  const motto = typeof row.motto === 'string' ? row.motto.trim() : '';

  return (
    values.length > 0 ||
    influences.length > 0 ||
    roleModels.length > 0 ||
    favoriteAuthors.length > 0 ||
    motto.length > 0
  );
}

function shouldConsiderAnswer(answerText: string): boolean {
  return answerText.replace(/\s+/g, ' ').trim().length >= 12;
}

function buildSyncCandidates(input: SyncInput): SyncCandidate[] {
  const candidates = new Map<string, string>();
  const currentAnswer = input.currentAnswerText.replace(/\s+/g, ' ').trim();

  if (shouldConsiderAnswer(currentAnswer)) {
    candidates.set(input.currentQuestionId, currentAnswer);
  }

  for (const row of input.progressRows) {
    const answerExcerpt = row.answer_excerpt?.replace(/\s+/g, ' ').trim() ?? '';
    if (!shouldConsiderAnswer(answerExcerpt)) {
      continue;
    }

    if (row.question_id === input.currentQuestionId && candidates.has(row.question_id)) {
      continue;
    }

    if (row.question_id === 'basis.birth' || row.question_id in PROFILE_TOPIC_BY_QUESTION_ID) {
      candidates.set(row.question_id, answerExcerpt);
    }
  }

  return Array.from(candidates.entries()).map(([questionId, answerText]) => ({
    questionId,
    answerText,
  }));
}

function hasBirthData(row: Record<string, unknown> | null): boolean {
  const birthDate = typeof row?.birth_date === 'string' ? row.birth_date.trim() : '';
  const birthPlace = typeof row?.birth_place === 'string' ? row.birth_place.trim() : '';
  return birthDate.length > 0 && birthPlace.length > 0;
}

async function upsertProfileData(
  serviceClient: ServiceClient,
  userId: string,
  profileData: ExtractedProfileData,
) {
  if (Object.keys(profileData).length === 0) {
    return;
  }

  const { error } = await serviceClient.from('user_profile').upsert(
    {
      user_id: userId,
      ...profileData,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function syncBiographyInterviewProfileData(input: SyncInput) {
  const candidates = buildSyncCandidates(input);
  if (candidates.length === 0) {
    return;
  }

  const [{ data: userRow, error: userError }, { data: profileRow, error: profileError }] = await Promise.all([
    input.serviceClient.from('users').select('birth_date, birth_place').eq('id', input.userId).maybeSingle(),
    input.serviceClient
      .from('user_profile')
      .select('values, motto, influences, role_models, favorite_authors')
      .eq('user_id', input.userId)
      .maybeSingle(),
  ]);

  if (userError) {
    throw new Error(userError.message);
  }

  if (profileError) {
    throw new Error(profileError.message);
  }

  let needsBirthBackfill = !hasBirthData(userRow);
  let needsProfileBackfill = !hasProfileData(profileRow);

  for (const candidate of candidates) {
    if (candidate.questionId === 'basis.birth' && (needsBirthBackfill || candidate.questionId === input.currentQuestionId)) {
      const birthData = extractBirthData(candidate.answerText);
      if (Object.keys(birthData).length > 0) {
        const { error } = await input.serviceClient.from('users').update(birthData).eq('id', input.userId);
        if (error) {
          throw new Error(error.message);
        }
        needsBirthBackfill = false;
      }
      continue;
    }

    const profileTopic = PROFILE_TOPIC_BY_QUESTION_ID[candidate.questionId];
    if (!profileTopic) {
      continue;
    }

    if (!needsProfileBackfill && candidate.questionId !== input.currentQuestionId) {
      continue;
    }

    const profileData = await extractProfileData(candidate.answerText, profileTopic);
    await upsertProfileData(input.serviceClient, input.userId, profileData);
    if (Object.keys(profileData).length > 0) {
      needsProfileBackfill = false;
    }
  }
}
