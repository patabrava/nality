import {
  ALT_ONBOARDING_VERSION,
  type AltOnboardingDraft,
  type AltPath,
  createEmptyAltOnboardingDraft,
  getStepById,
} from '@/lib/onboarding/alt-config';
import { ALT_ONBOARDING_DRAFT_KEY } from '@/lib/onboarding/flags';

function isValidPath(value: unknown): value is AltPath {
  return value === 'A' || value === 'B' || value === 'C';
}

function sanitizeDraft(parsed: Partial<AltOnboardingDraft>): AltOnboardingDraft {
  const draft: AltOnboardingDraft = {
    ...createEmptyAltOnboardingDraft(),
    ...parsed,
    version: ALT_ONBOARDING_VERSION,
  };

  if (draft.pendingLinkToken !== null && typeof draft.pendingLinkToken !== 'string') {
    draft.pendingLinkToken = null;
  }

  if (!isValidPath(draft.path)) {
    return createEmptyAltOnboardingDraft();
  }

  if (!draft.entry || draft.entry.path !== draft.path) {
    return createEmptyAltOnboardingDraft();
  }

  if (draft.stage === 'path') {
    if (!draft.currentStepId || !getStepById(draft.path, draft.currentStepId)) {
      return createEmptyAltOnboardingDraft();
    }
  }

  if (draft.stage === 'neutral' || draft.stage === 'registration') {
    if (!draft.currentStepId) {
      return draft;
    }
    if (!getStepById(draft.path, draft.currentStepId)) {
      return createEmptyAltOnboardingDraft();
    }
  }

  return draft;
}

export function loadAltOnboardingDraft(): AltOnboardingDraft {
  if (typeof window === 'undefined') {
    return createEmptyAltOnboardingDraft();
  }

  try {
    const raw = window.localStorage.getItem(ALT_ONBOARDING_DRAFT_KEY);
    if (!raw) {
      return createEmptyAltOnboardingDraft();
    }

    const parsed = JSON.parse(raw) as Partial<AltOnboardingDraft>;
    if (parsed.version !== ALT_ONBOARDING_VERSION) {
      return createEmptyAltOnboardingDraft();
    }

    return sanitizeDraft(parsed);
  } catch {
    return createEmptyAltOnboardingDraft();
  }
}

export function saveAltOnboardingDraft(draft: AltOnboardingDraft): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(ALT_ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // no-op: localStorage may be unavailable in private browsing or restricted mode
  }
}

export function clearAltOnboardingDraft(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(ALT_ONBOARDING_DRAFT_KEY);
  } catch {
    // no-op
  }
}
