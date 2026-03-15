import { describe, expect, it } from 'vitest';
import { biographyInterviewCatalog } from './catalog';
import { evaluateInterviewAnswer } from './evaluator';
import {
  buildTopicCoverage,
  chooseNextQuestion,
  createSeedProgressRows,
  getAutoSkippedQuestionIds,
  summarizeProgress,
} from './planner';

describe('biography interview planner', () => {
  it('seeds one progress row per canonical question', () => {
    const rows = createSeedProgressRows({
      interviewSessionId: '11111111-1111-1111-1111-111111111111',
      userId: '00000000-0000-0000-0000-000000000001',
    });

    expect(rows).toHaveLength(biographyInterviewCatalog.length);
    expect(rows[0]?.state).toBe('pending');
  });

  it('auto-skips religion branch questions when religion was declined', () => {
    const rows = createSeedProgressRows({
      interviewSessionId: '11111111-1111-1111-1111-111111111111',
      userId: '00000000-0000-0000-0000-000000000001',
    });

    const religion = rows.find((row) => row.question_id === 'basis.religion_identity');
    if (!religion) {
      throw new Error('Missing religion question');
    }

    religion.state = 'answered';
    religion.answer_excerpt = 'Nein';

    const skipped = getAutoSkippedQuestionIds(rows);
    expect(skipped).toContain('basis.religion_type');
    expect(skipped).toContain('basis.religion_importance');
  });

  it('chooses the next pending question in catalog order', () => {
    const rows = createSeedProgressRows({
      interviewSessionId: '11111111-1111-1111-1111-111111111111',
      userId: '00000000-0000-0000-0000-000000000001',
    });

    rows[0]!.state = 'answered';
    const next = chooseNextQuestion(rows, null);

    expect(next?.id).toBe('basis.home');
  });

  it('keeps the current question active when the answer is insufficient', () => {
    const question = biographyInterviewCatalog.find((entry) => entry.id === 'family.describe');
    if (!question) {
      throw new Error('Missing family.describe');
    }

    const result = evaluateInterviewAnswer('Kurz.', question);
    expect(result.outcome).toBe('pending_followup');
  });

  it('marks explicit refusal as skipped', () => {
    const question = biographyInterviewCatalog.find((entry) => entry.id === 'basis.religion_identity');
    if (!question) {
      throw new Error('Missing basis.religion_identity');
    }

    const result = evaluateInterviewAnswer('Darüber möchte ich lieber nicht sprechen.', question);
    expect(result.outcome).toBe('skipped');
    expect(result.shouldPersistMemory).toBe(false);
  });

  it('marks not-now answers as deferred', () => {
    const question = biographyInterviewCatalog.find((entry) => entry.id === 'relationships.special_bonds');
    if (!question) {
      throw new Error('Missing relationships.special_bonds');
    }

    const result = evaluateInterviewAnswer('Vielleicht später, nicht jetzt.', question);
    expect(result.outcome).toBe('deferred');
    expect(result.shouldPersistMemory).toBe(false);
  });

  it('keeps deferred questions available after all pending questions are done', () => {
    const rows = createSeedProgressRows({
      interviewSessionId: '11111111-1111-1111-1111-111111111111',
      userId: '00000000-0000-0000-0000-000000000001',
    });

    for (const row of rows) {
      row.state = 'answered';
    }

    const deferred = rows.find((row) => row.question_id === 'future.legacy');
    if (!deferred) {
      throw new Error('Missing future.legacy');
    }

    deferred.state = 'deferred';

    const next = chooseNextQuestion(rows, null);
    expect(next?.id).toBe('future.legacy');
  });

  it('summarizes progress and topic coverage correctly', () => {
    const rows = createSeedProgressRows({
      interviewSessionId: '11111111-1111-1111-1111-111111111111',
      userId: '00000000-0000-0000-0000-000000000001',
    });

    rows[0]!.state = 'answered';
    rows[0]!.answer_excerpt = '1978 in Medellin';
    rows[1]!.state = 'skipped';

    const summary = summarizeProgress(rows, 'basis.relationship_status');
    expect(summary.counts.answered).toBe(1);
    expect(summary.counts.skipped).toBe(1);
    expect(summary.activeQuestionId).toBe('basis.relationship_status');

    const topics = buildTopicCoverage(rows);
    expect(topics).toContain('basis_information');
  });
});
