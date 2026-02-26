# Testscript: meeting onboarding finalizes into profile

## TS-MEETING-LOGIN-REDIRECT-001
- Objective: Verify middleware + onboarding routing compiles cleanly and login CTA "Nality beitreten" routes to `/meeting`, then `/meeting` keeps the onboarding flow, creates account inline, and applies meeting answers to the user profile.
- Prerequisites: `pnpm install` completed, no port conflict on `3211`.
- Setup:
  1. Run compile guard: `pnpm --filter web build`
  2. Start app: `pnpm --filter web dev --port 3211`
  3. Open browser at `http://localhost:3211/meeting`
- Run:
  1. Open `http://localhost:3211/login`.
  2. Click `Nality beitreten` and confirm browser navigates to `/meeting`.
  1. With no active session, confirm onboarding content is visible on `/meeting`.
  2. Answer onboarding questions until the registration stage is reached.
  3. Confirm registration inputs are rendered on `/meeting` (name, email, password, submit buttons).
  4. Complete password registration and finish email confirmation/callback if required.
  5. Confirm callback returns to `/meeting` and onboarding finalization succeeds.
  6. Confirm navigation lands on `/dash`.
  7. Open `/dash/profile` and verify onboarding-derived profile fields are populated (for example full name and onboarding completion state).
- Expected:
  - Clicking `Nality beitreten` on `/login` navigates to `/meeting`.
  - Registration stage stays inside `/meeting` without forced redirect to `/login`.
  - No redirect loop between `/meeting` and `/login` occurs.
  - Onboarding finalization updates the user record and marks onboarding complete.
  - Profile page reflects data produced by the meeting flow.
- Artifacts:
  - Browser URL transitions for registration completion and callback.
  - Screenshot of `/dash/profile` after completion.
  - Browser console screenshot if finalize or redirect issues appear.
- Cleanup:
  - Stop dev server.
  - Sign out test session if used.
