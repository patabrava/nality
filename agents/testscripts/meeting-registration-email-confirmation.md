## Script Identifier
- `TS-MEETING-REG-EMAIL-CONFIRM-01`

## Objective
- Verify meeting registration hides progress at personal-data step and transitions to a post-submit email-confirmation message.

## Prerequisites
- Web app dependencies installed.
- Browser session without active authenticated user.

## Setup
- Start app: `pnpm --filter web dev`
- Open `http://localhost:3000/meeting`
- Complete onboarding path until registration form is shown.

## Run Commands
- Automated regression guard: `pnpm --filter web test:run -- src/__tests__/onboarding/alt-machine.test.ts src/__tests__/onboarding/alt-draft-storage.test.ts`

## Manual Steps + Expected Observations
1. On registration screen, confirm no percent indicator/progress bar is visible.
2. Fill required fields and click `Mit E-Mail registrieren`.
3. Confirm form disappears and success state appears with email-check instruction.
4. Confirm `Zum Login` action is visible and keyboard reachable.

## Artifact Capture
- Screenshot registration state before submit.
- Screenshot success state after submit.
- Command output of automated regression guard.

## Cleanup
- Stop dev server.
- Clear local onboarding draft via browser localStorage if needed.

## Known Limitations
- Email delivery itself depends on auth provider configuration and is not asserted by this script.
