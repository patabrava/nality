import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  applyDraftToAnswers,
  buildProfilePreOnboardingDraft,
  type PreOnboardingAnswersMap,
} from '@/lib/profile/preOnboardingProfile';

describe('pre-onboarding profile draft helpers', () => {
  it('builds editable draft entries from persisted answers', () => {
    const answers: PreOnboardingAnswersMap = {
      Q1: { selected: ['Q1_O2'], answered_at: '2026-04-01T10:00:00.000Z' },
      Q4: {
        birth_decade: 'Q4_decade_1980',
        gender_identity: 'Q4_gender_male',
        answered_at: '2026-04-01T10:01:00.000Z',
      },
      E1: { selected: ['IGNORED'], answered_at: '2026-04-01T10:02:00.000Z' },
    };

    const draft = buildProfilePreOnboardingDraft(answers);

    expect(draft).toEqual([
      { questionId: 'Q1', type: 'single', selectedOptionId: 'Q1_O2' },
      {
        questionId: 'Q4',
        type: 'composite',
        birthDecade: 'Q4_decade_1980',
        genderIdentity: 'Q4_gender_male',
      },
    ]);
  });

  it('applies edited draft values back to answers payload', () => {
    const result = applyDraftToAnswers(
      {
        Q1: { selected: ['Q1_O1'], answered_at: '2026-04-01T10:00:00.000Z' },
      },
      [
        { questionId: 'Q1', type: 'single', selectedOptionId: 'Q1_O3' },
        {
          questionId: 'Q11',
          type: 'composite',
          birthDecade: 'Q4_decade_1990',
          genderIdentity: 'Q4_gender_female',
        },
      ],
      '2026-04-01T11:11:11.000Z',
    );

    expect(result.Q1).toEqual({ selected: ['Q1_O3'], answered_at: '2026-04-01T11:11:11.000Z' });
    expect(result.Q11).toEqual({
      birth_decade: 'Q4_decade_1990',
      gender_identity: 'Q4_gender_female',
      answered_at: '2026-04-01T11:11:11.000Z',
    });
  });
});

describe('profile page tab semantics', () => {
  it('contains a separate pre-onboarding tab panel', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/app/(protected)/dash/profile/page.tsx'),
      'utf-8',
    );

    expect(source).toContain('role="tablist"');
    expect(source).toContain('id="preonboarding-tab"');
    expect(source).toContain('id="preonboarding-tab-panel"');
  });
});

describe('pre-onboarding profile API fallback linkage', () => {
  it('keeps meeting session cookie fallback for session resolution', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/app/api/preonboarding/profile/route.ts'),
      'utf-8',
    );

    expect(source).toContain("const SESSION_COOKIE = 'meeting_preonboarding_session_id';");
    expect(source).toContain('.eq(\'session_id\', sessionIdHint)');
    expect(source).toContain('.update({ user_id: userId, updated_at: new Date().toISOString() })');
  });
});
