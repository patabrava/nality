# Testscript: meeting route hydration determinism

## TS-MEETING-HYDRATION-001
- Objective: Verify `/meeting` renders deterministic server/client initial markup and no hydration mismatch from persisted draft state.
- Prerequisites: `pnpm install` completed, no port conflict on `3211`.
- Setup:
  1. Start app: `pnpm --filter web dev --port 3211`
  2. Open browser at `http://localhost:3211/meeting`
  3. In devtools console set draft payload in `localStorage` with non-entry stage.
- Run:
  1. Hard refresh page.
  2. Observe console during hydration.
  3. Confirm onboarding resumes after hydration without React mismatch warning.
- Expected:
  - No warning containing `Hydration failed`.
  - No warning containing `server rendered <section` vs `client rendered <div`.
  - Initial server HTML includes entry section markup.
  - Client can transition to stored draft state after mount.
- Artifacts:
  - Browser console screenshot/log.
  - `curl -s http://localhost:3211/meeting` output sample saved if needed.
- Cleanup:
  - Remove draft key from `localStorage`.
  - Stop dev server.
