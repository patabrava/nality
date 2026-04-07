# TESTSCRIPT CRIT-01: Auth Boundary Hardening

- Objective: prove protected APIs no longer accept caller-controlled identity and only resolve users from verified Supabase auth context.
- Prerequisites: local Supabase auth configured; two test users available; app running at local origin.
- Setup:
  - Sign in as user A in one browser session.
  - Capture either the browser auth cookies or a bearer token for user A.
  - Prepare a forged user B id.
- Run:
  - `curl -i http://localhost:3000/api/onboarding/session`
  - `curl -i -H "Authorization: Bearer <user-a-token>" "http://localhost:3000/api/onboarding/session?userId=<user-b-id>"`
  - `curl -i -X POST -H "Authorization: Bearer <user-a-token>" -H "Content-Type: application/json" http://localhost:3000/api/chat -d '{"messages":[{"role":"user","content":"Hallo"}],"userId":"<user-b-id>"}'`
  - `curl -i -X POST -H "Authorization: Bearer <user-a-token>" -H "Content-Type: application/json" http://localhost:3000/api/chat/chapter -d '{"chapterId":"moments","messages":[{"role":"user","content":"Hallo"}],"userId":"<user-b-id>"}'`
- Expected observations:
  - Unauthenticated requests return `401`.
  - Authenticated requests ignore forged `userId` values and do not create cross-user writes.
  - No route accepts identity from query/body fallback.

# TESTSCRIPT CRIT-02: Secret Surface Lockdown

- Objective: prove provider secrets and debug auth details are no longer exposed to the browser or logs.
- Prerequisites: app booted with real but non-production env vars.
- Run:
  - `curl -i http://localhost:3000/api/voice/token`
  - `curl -i http://localhost:3000/api/debug/auth`
  - Exercise onboarding text chat and dashboard interview once.
- Expected observations:
  - `/api/voice/token` returns `410` and never includes a provider key.
  - `/api/debug/auth` returns `404` outside development.
  - Logs do not include Supabase service-role fragments, provider tokens, or raw auth/session dumps.

# TESTSCRIPT CRIT-03: Dashboard Biography Interview

- Objective: prove dashboard interview mode uses the biography flow seeded from private pre-onboarding data instead of onboarding behavior.
- Prerequisites: authenticated user with `users.alt_onboarding_private` populated and `onboarding_complete = true`.
- Setup:
  - Start the app and open `/dash`.
  - Enter the add-memory flow and choose the guided interview mode.
- Run:
  - Start one interview session.
  - Answer at least two spoken prompts with concrete memories.
  - End the session and start a second interview session.
- Expected observations:
  - The welcome prompt references memory capture, not onboarding.
  - Questions are in German and ask permission before entering a topic.
  - New rows are written to `memories` with `capture_mode = 'interview'`, `interview_topic`, `interview_question`, and `interview_session_id`.
  - `interview_sessions` receives a session row and its `topics_covered` / `memory_count` update as memories are saved.
  - The second session continues with an uncovered or follow-up topic rather than restarting onboarding.

# Automated Regression

- Commands:
  - `pnpm --filter web exec tsc --noEmit`
  - `pnpm --filter web test`
- Expected observations:
  - Type-check passes.
  - Default Vitest lane passes without attempting the live-server `e2e` suite.
