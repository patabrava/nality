## Script Identifier
- `TS-AUTH-EMAIL-CONFIRM-CALLBACK-01`

## Objective
- Verify email confirmation links hitting `/auth/confirm` are redirected to `/auth/callback` and complete auth callback handling without 404.
- Verify callback code exchange runs once and does not hard-fail when session already exists.

## Prerequisites
- `apps/web/.env.local` has valid Supabase URL and anon key.
- A browser profile with no active authenticated session.

## Setup
1. Start app: `pnpm --filter web dev`
2. Open `http://localhost:3000/login?mode=signup`
3. Register a fresh email/password account.

## Run Commands
- Regression unit checks: `pnpm --filter web exec vitest run src/__tests__/auth/callback-query.test.ts src/__tests__/hooks/useAuthErrors.test.ts`

## Manual Steps + Expected Observations
1. Simulate callback route compatibility:
   - Open `http://localhost:3000/auth/confirm?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired`
   - Expected: URL changes to `/auth/callback?...` then redirects to `/login?error=callback_provider_error` (no 404 page).
2. Use real confirmation email link from mailbox.
   - Expected: no 404 at `/auth/confirm` or `/auth/callback`.
   - If token valid: user lands in onboarding/dash flow.
   - If token expired: user lands on login with callback error state.
3. With browser devtools open on Console, authenticate via email confirmation or OAuth so `/auth/callback?code=...` is visited.
   - Expected: no `Auth callback code exchange failed` error appears.
   - Optional validation: refresh the callback URL once.
   - Expected: app should not hard-fail to `/login?error=callback_exchange_failed` if a valid session already exists.

## Artifact Capture
- Browser URL transition screenshots for `/auth/confirm` -> `/auth/callback` -> final page.
- Terminal output from regression unit checks.
- Console screenshot showing correlation-aware callback log lines without hard failure.

## Cleanup
- Stop dev server.

## Known Limitations
- Final success of real email verification depends on Supabase project auth redirect settings and token validity window.
