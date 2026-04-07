import { describe, expect, it } from 'vitest';
import { buildBiographyInterviewPrompt } from './biography-interview';

describe('buildBiographyInterviewPrompt', () => {
  it('adds voice-agent speaking rules for voice delivery', () => {
    const result = buildBiographyInterviewPrompt({
      fullName: 'Anna Beispiel',
      altOnboardingPrivate: null,
      recentMemories: [],
      previousTopics: [],
      activeQuestion: {
        id: 'basis.birth',
        topicId: 'basis_information',
        topicLabel: 'Basisinformationen',
        order: 0,
        promptIntent: 'Wo und in welcher Situation beginnt Ihre erste klare Erinnerung?',
        required: true,
        sensitive: false,
        answerType: 'free_text',
        completionRule: 'sufficient_answer',
        skipOnDecline: true,
        dependsOn: [],
      },
      bridgeContext: ['Bitte knüpfe weich an die letzte Szene an.'],
      progressSummary: {
        counts: {
          pending: 5,
          answered: 1,
          deferred: 0,
          skipped: 0,
          total: 6,
          remainingRequired: 5,
        },
        activeQuestionId: 'basis.birth',
        activeQuestionLabel: 'Wo und in welcher Situation beginnt Ihre erste klare Erinnerung?',
        activeTopicLabel: 'Basisinformationen',
        catalogVersion: 'test-v1',
      },
      delivery: 'voice',
    });

    expect(result.systemPrompt).toContain('Sprachmodus Voice Agent');
    expect(result.systemPrompt).toContain('kurze, gut sprechbare Sätze');
    expect(result.activeQuestionId).toBe('basis.birth');
  });
});
