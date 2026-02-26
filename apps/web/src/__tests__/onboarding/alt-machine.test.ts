import { describe, expect, it } from 'vitest';
import { getPathFromEntryAnswer, getStepById } from '@/lib/onboarding/alt-config';
import { isStepResponseValid, resolveNextLocation } from '@/lib/onboarding/alt-machine';

describe('alt onboarding machine', () => {
  it('routes entry answer 1 to path A', () => {
    expect(getPathFromEntryAnswer('entry_1')).toBe('A');
  });

  it('routes entry answer 2/3/4 to path B', () => {
    expect(getPathFromEntryAnswer('entry_2')).toBe('B');
    expect(getPathFromEntryAnswer('entry_3')).toBe('B');
    expect(getPathFromEntryAnswer('entry_4')).toBe('B');
  });

  it('routes entry answer 5 to path C', () => {
    expect(getPathFromEntryAnswer('entry_5')).toBe('C');
  });

  it('moves path A decision to neutral block', () => {
    const step = getStepById('A', 'A4');
    expect(step).not.toBeNull();
    if (!step) return;

    const next = resolveNextLocation('A', step, 'start_storytelling');
    expect(next.stage).toBe('neutral');
  });

  it('moves path A decision to registration', () => {
    const step = getStepById('A', 'A4');
    expect(step).not.toBeNull();
    if (!step) return;

    const next = resolveNextLocation('A', step, 'go_registration');
    expect(next.stage).toBe('registration');
  });

  it('moves path B4 neutral option to neutral block', () => {
    const step = getStepById('B', 'B4');
    expect(step).not.toBeNull();
    if (!step) return;

    const next = resolveNextLocation('B', step, 'jump_to_neutral');
    expect(next.stage).toBe('neutral');
  });

  it('moves path B4 continue option to B5', () => {
    const step = getStepById('B', 'B4');
    expect(step).not.toBeNull();
    if (!step) return;

    const next = resolveNextLocation('B', step, 'continue_guided');
    expect(next.stage).toBe('path');
    expect(next.stepId).toBe('B5');
  });

  it('requires demographic fields to be filled', () => {
    const step = getStepById('C', 'C2');
    expect(step).not.toBeNull();
    if (!step) return;

    const invalid = isStepResponseValid(step, {});
    expect(invalid).toBe(false);

    const valid = isStepResponseValid(step, {
      relationshipToPerson: 'family',
      thirdPersonAgeRange: '65_79',
      thirdPersonLanguagePreference: 'de',
    });
    expect(valid).toBe(true);
  });
});
