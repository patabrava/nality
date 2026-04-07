import { describe, expect, it } from 'vitest';
import {
  deriveCurrentQuestion,
  deriveQuestionHistory,
  deriveStrandFromQ1,
  getNextQuestionId,
  getPreviousQuestionId,
  getProgressForState,
  mergeAnswers,
  type AnswersMap,
} from '@/app/meeting/meetingFlow';

describe('meeting pre-onboarding flow rules', () => {
  it('routes Q8_O4 across strands to Q5', () => {
    expect(getNextQuestionId('Q8', 'Q8_O4')).toBe('Q5');
  });

  it('routes third-party branch to Q12 and then Q13', () => {
    expect(getNextQuestionId('Q1', 'Q1_O5')).toBe('Q12');
    expect(getNextQuestionId('Q12')).toBe('Q13');
  });

  it('derives strand correctly from Q1 option', () => {
    expect(deriveStrandFromQ1('Q1_O1')).toBe('extrovert');
    expect(deriveStrandFromQ1('Q1_O5')).toBe('third_party');
    expect(deriveStrandFromQ1('Q1_O3')).toBe('introvert');
  });

  it('keeps newer answer timestamp during merge', () => {
    const local: AnswersMap = {
      Q8: { selected: ['Q8_O2'], answered_at: '2026-01-01T10:00:00.000Z' },
    };
    const remote: AnswersMap = {
      Q8: { selected: ['Q8_O4'], answered_at: '2026-01-01T11:00:00.000Z' },
    };
    const merged = mergeAnswers(local, remote);
    expect(merged.Q8?.selected?.[0]).toBe('Q8_O4');
  });

  it('derives resume question from saved answers', () => {
    const answers: AnswersMap = {
      Q1: { selected: ['Q1_O2'], answered_at: '2026-01-01T10:00:00.000Z' },
      Q7: { selected: ['Q7_O1'], answered_at: '2026-01-01T10:01:00.000Z' },
      Q8: { selected: ['Q8_O1'], answered_at: '2026-01-01T10:02:00.000Z' },
    };
    expect(deriveCurrentQuestion(answers)).toBe('Q9');
  });

  it('derives question history for introvert path', () => {
    const answers: AnswersMap = {
      Q1: { selected: ['Q1_O2'], answered_at: '2026-01-01T10:00:00.000Z' },
      Q7: { selected: ['Q7_O1'], answered_at: '2026-01-01T10:01:00.000Z' },
      Q8: { selected: ['Q8_O1'], answered_at: '2026-01-01T10:02:00.000Z' },
    };

    expect(deriveQuestionHistory(answers, 'Q9')).toEqual(['Q1', 'Q7', 'Q8']);
  });

  it('derives question history for reached E2 handoff', () => {
    const answers: AnswersMap = {
      Q1: { selected: ['Q1_O1'], answered_at: '2026-01-01T10:00:00.000Z' },
      Q2: { selected: ['Q2_O1'], answered_at: '2026-01-01T10:01:00.000Z' },
      Q3: { selected: ['Q3_O1'], answered_at: '2026-01-01T10:02:00.000Z' },
      Q4: { birth_decade: 'Q4_decade_1980', gender_identity: 'Q4_gender_male', answered_at: '2026-01-01T10:03:00.000Z' },
      Q5: { selected: ['Q5_O1'], answered_at: '2026-01-01T10:04:00.000Z' },
      Q6: { answered_at: '2026-01-01T10:05:00.000Z' },
    };

    expect(deriveQuestionHistory(answers, 'E2')).toEqual(['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6']);
  });

  it('computes progress for introvert strand with jump path', () => {
    const progress = getProgressForState({
      currentStrand: 'introvert',
      currentQuestion: 'Q5',
      answers: {
        Q1: { selected: ['Q1_O2'], answered_at: '2026-01-01T10:00:00.000Z' },
        Q7: { selected: ['Q7_O1'], answered_at: '2026-01-01T10:01:00.000Z' },
        Q8: { selected: ['Q8_O4'], answered_at: '2026-01-01T10:02:00.000Z' },
      },
    });

    expect(progress).not.toBeNull();
    expect(progress?.label).toContain('Sprung');
  });

  it('routes back from first strand questions to Q1', () => {
    expect(getPreviousQuestionId('Q2', [])).toBe('Q1');
    expect(getPreviousQuestionId('Q7', ['Q1'])).toBe('Q1');
    expect(getPreviousQuestionId('Q12', [])).toBe('Q1');
  });

  it('keeps back disabled on Q1', () => {
    expect(getPreviousQuestionId('Q1', [])).toBeNull();
  });
});
