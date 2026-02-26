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

## TS-MEETING-RUNTIME-002
- Objective: Verify `/meeting` does not throw webpack/react-server-dom runtime module errors after route render.
- Prerequisites: `pnpm install` completed, no port conflict on `3211`.
- Setup:
  1. Start app: `pnpm --filter web dev --port 3211`
  2. Open browser at `http://localhost:3211/meeting`
- Run:
  1. Hard refresh page twice.
  2. Observe browser console and terminal logs.
  3. Navigate away and back to `/meeting` once.
- Expected:
  - No browser error containing `Cannot read properties of undefined (reading 'call')`.
  - No browser stack references `webpack-runtime.js` with failed module factory execution.
  - No browser stack references `react-server-dom-webpack-client.edge.development.js` for `/meeting` render.
  - `/meeting` renders onboarding UI without blank-screen crash.
- Artifacts:
  - Browser console log export or screenshot.
  - Terminal output from `next dev` covering compile + request lines.
- Cleanup:
  - Stop dev server.
