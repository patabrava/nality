# Testscript: meeting onboarding hands off to login signup

## TS-MEETING-LOGIN-REDIRECT-001
- Objective: Verify `/meeting` routes users to `/login?mode=signup` after finishing onboarding questions and login opens in registration mode.
- Prerequisites: `pnpm install` completed, no port conflict on `3211`.
- Setup:
  1. Start app: `pnpm --filter web dev --port 3211`
  2. Open browser at `http://localhost:3211/meeting`
- Run:
  1. With no active session, confirm onboarding content is visible on `/meeting`.
  2. Answer onboarding questions until the registration stage is reached.
  3. Confirm the app navigates to `/login?mode=signup` automatically.
  4. Confirm login opens with sign-up mode active (password mode + create account copy/button).
  5. Toggle to sign-in manually and confirm behavior stays normal.
- Expected:
  - Signed-out users can complete onboarding questions.
  - Reaching onboarding registration stage hands off to `/login?mode=signup`.
  - Login defaults to registration mode when `mode=signup` is present.
  - No redirect loop occurs while navigating between `/meeting` and `/login`.
- Artifacts:
  - Browser URL transitions for final onboarding step -> `/login?mode=signup`.
  - Browser console screenshot if a redirect issue appears.
- Cleanup:
  - Stop dev server.
  - Sign out test session if used.
