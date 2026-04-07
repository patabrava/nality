# TS-PREONBOARDING-REGISTRATION-PROFILE

## Objective
Validate persistence/linking of meeting pre-onboarding session + registration names and editable profile updates.

## Prerequisites
- Supabase migrations applied (including `20260401_001_preonboarding_registration_profile.sql`)
- Web app env configured (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)

## Setup
1. `pnpm --filter web test:run`
2. `pnpm --filter web build`

## Runtime Validation Steps
1. Open `/meeting` and answer until redirect CTA to `/login?mode=signup&preonboarding_session_id=<id>`.
2. Register with Vorname + optional Spitzname/Nachname.
3. Confirm in DB:
   - `meeting_preonboarding_sessions` row exists for session id
   - `meeting_preonboarding_sessions.user_id` equals authenticated user id
   - `users.first_name/nickname/last_name` persisted
4. Open `/dash/profile`, edit Vorname/Spitzname/Nachname and save.
5. Confirm DB row in `users` updated and UI displays success message.
6. Regression path (existing user login):
   - Start logged out, keep the same browser session/cookies.
   - Open `/meeting`, answer until redirect to `/login?...preonboarding_session_id=<id>`.
   - Log in with an existing account (no new signup).
   - Open `/dash/profile` → tab `Vorgespräch`.
   - Expect meeting answers to be visible (session is linked via cookie fallback).

## Expected Observations
- API calls to `/api/preonboarding/sessions` return 2xx during meeting flow.
- Signup metadata lands in `users` via auth trigger.
- For existing-user login, `/api/preonboarding/profile` links `meeting_preonboarding_sessions.user_id` using `meeting_preonboarding_session_id` cookie when needed.
- Profile save updates user fields without leaving page.

## Cleanup
- Delete test user and session rows from Supabase if needed.
