import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createEmptyAltOnboardingDraft } from '@/lib/onboarding/alt-config';
import { clearAltOnboardingDraft, loadAltOnboardingDraft, saveAltOnboardingDraft } from '@/lib/onboarding/alt-draft-storage';
import { ALT_ONBOARDING_DRAFT_KEY } from '@/lib/onboarding/flags';

function createStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

describe('alt draft storage', () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    storage = createStorage();
    Object.defineProperty(globalThis, 'window', {
      value: { localStorage: storage },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it('resets draft on version mismatch', () => {
    storage.setItem(ALT_ONBOARDING_DRAFT_KEY, JSON.stringify({ version: 'legacy-v0', stage: 'registration' }));

    const draft = loadAltOnboardingDraft();

    expect(draft).toEqual(createEmptyAltOnboardingDraft());
  });

  it('resets draft on invalid stage-path shape', () => {
    storage.setItem(
      ALT_ONBOARDING_DRAFT_KEY,
      JSON.stringify({
        version: 'alt-onboarding-v1',
        stage: 'path',
        path: 'B',
        entry: { answerId: 'entry_2', path: 'B' },
        currentStepId: 'A1',
      }),
    );

    const draft = loadAltOnboardingDraft();

    expect(draft).toEqual(createEmptyAltOnboardingDraft());
  });

  it('saves and clears draft payload', () => {
    const draft = {
      ...createEmptyAltOnboardingDraft(),
      stage: 'registration' as const,
      path: 'C' as const,
      entry: { answerId: 'entry_5' as const, path: 'C' as const },
      currentStepId: 'C2',
    };

    saveAltOnboardingDraft(draft);
    expect(loadAltOnboardingDraft()).toMatchObject({ stage: 'registration', path: 'C', currentStepId: 'C2' });

    clearAltOnboardingDraft();
    expect(loadAltOnboardingDraft()).toEqual(createEmptyAltOnboardingDraft());
  });
});
