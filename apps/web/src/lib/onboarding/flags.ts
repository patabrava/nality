export const ALT_ONBOARDING_DRAFT_KEY = 'nality.altOnboardingDraft.v1';

export function isAltOnboardingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ALT_ONBOARDING_ENABLED === 'true';
}

export function getIncompleteOnboardingPath(): '/onboarding' | '/meeting' {
  return isAltOnboardingEnabled() ? '/meeting' : '/onboarding';
}
