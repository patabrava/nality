# TS-ALT-ONBOARDING-LANDING-STYLE

## Objective
Validate alt-onboarding visual alignment with landing language while keeping a plain page background and preserving flow behavior.

## Prerequisites
- Repository dependencies are installed.
- Run from repo root.

## Setup
1. `cd apps/web`

## Run Commands
1. `npm run test:run -- src/__tests__/api/alt-onboarding-pending.test.ts src/__tests__/api/alt-onboarding-complete.test.ts src/__tests__/onboarding/alt-draft-storage.test.ts`
2. `npm run lint -- --file "src/components/onboarding-alt/AltOnboardingWizard.tsx" --file "src/components/onboarding-alt/AltStepRenderer.tsx" --file "src/components/onboarding-alt/AltProgressHeader.tsx" --file "src/components/onboarding-alt/AltRegistrationModule.tsx" --file "src/components/onboarding-alt/NeutralStartBlock.tsx" --file "src/components/onboarding-alt/AddressPreferenceModal.tsx"`
3. `npx tsc --noEmit`

## Expected Observations
- Alt onboarding Vitest suites pass.
- Lint command reports no errors for changed `src/components/onboarding-alt/*` files.
- TypeScript check completes without introducing new typing issues.

## Manual Runtime Check
1. Start app: `npm run dev`.
2. Open `/alt-onboarding` as a signed-out user.
3. Confirm page shell uses a plain background only (no gradients, grain, or texture).
4. Confirm typography and surface hierarchy match landing language (serif heading, muted body copy, dark surface cards).
5. Confirm CTA and secondary button states align with landing behavior (primary fill, secondary outline, visible focus).
6. Confirm onboarding flow semantics are unchanged:
   - entry choice selection and continue
   - step navigation (forward/back)
   - neutral block transitions
   - registration flow + address modal
   - final redirect behavior to `/dash` after completion

## Cleanup
- Stop the dev server.
