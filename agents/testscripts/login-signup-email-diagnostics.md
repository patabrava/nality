## Script Identifier
- `TS-LOGIN-SIGNUP-EMAIL-DIAG-01`

## Objective
- Verify signup surfaces actionable error messages for email confirmation delivery failures and rate limits.

## Prerequisites
- `apps/web/.env.local` contains valid Supabase URL + anon key.
- No authenticated session in browser.

## Setup
- Start app: `pnpm --filter web dev`
- Open `http://localhost:3000/login?mode=signup`

## Steps
1. Submit signup with a fresh email and valid password.
2. Confirm success state appears (email confirmation instruction).
3. Immediately submit signup again with the same email.
4. Confirm error state appears with explicit wait/retry guidance.

## Expected Observations
- First request: Supabase signup succeeds (`error: null`, `confirmation_sent_at` present).
- Rapid second request: Supabase returns `status: 429`, `code: over_email_send_rate_limit`.
- UI shows user-facing message indicating confirmation email was already requested and to wait.
- Browser console includes structured diagnostics with code/status for developers.

## Cleanup
- Stop dev server.
