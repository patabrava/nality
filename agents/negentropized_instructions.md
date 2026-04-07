# Goal

Replace the current raw memory-count chapter generation path with a biography-first planning flow that proposes user-confirmed draft chapters only after enough high-quality interview coverage and memory corpus quality exist.

# Primary User / Actor

- Primary user: an authenticated self-service dashboard user who has been completing the guided biography interview.
- Primary product actor: the chapter-planning backend that evaluates readiness, proposes draft chapters, and waits for user confirmation before final chapter creation.

# Inputs

## Required

- Authenticated user identity from verified Supabase cookie or bearer auth.
- Canonical interview coverage state from `interview_question_progress`.
- Saved interview memories from `public.memories`.
- Existing interview session context where needed.

## Optional

- Existing pre-onboarding seed context from `users.alt_onboarding_private`.
- Existing manually created chapters if later backward-compatibility handling is needed.
- User-triggered regenerate/refresh intent for draft chapter candidates.

# Outputs / Deliverables

- A deterministic `narrative readiness` evaluator that decides whether the user is ready for chapter planning.
- A chapter-planning feature slice that generates `draft chapter candidates`, not final chapters, from interview coverage plus memory corpus quality.
- A user confirmation flow in the dashboard chapters experience so the user can review and confirm chapter candidates.
- Confirmed draft candidates promoted into final `public.chapters` rows only after confirmation.
- Existing biography generation kept manual and fed from confirmed chapters only.
- Tests proving readiness evaluation, draft chapter planning, confirmation/finalization, and regression-safe route behavior.

# Core Pipeline

1. Load authenticated user context from verified Supabase auth.
2. Evaluate `narrative readiness` from:
   - canonical interview coverage
   - memory corpus quality
3. If readiness is below threshold:
   - do not generate chapters
   - return a structured readiness result explaining what is still missing
4. If readiness is met:
   - generate biography-grade `draft chapter candidates`
   - ground them in explicit evidence from coverage and saved memories
5. Present draft chapter candidates to the user for confirmation in the dashboard.
6. On user confirmation:
   - create final `public.chapters` rows
   - assign relevant memories to confirmed chapters
7. Keep biography generation as a separate manual step using confirmed chapters only.

# Data / Evidence Contracts

- Chapter planning must use `canonical interview coverage + memories` as source of truth.
- Readiness must not rely on `memory count only`.
- Every draft chapter candidate must include:
  - title
  - summary
  - estimated time range when possible
  - thematic keywords
  - supporting memory ids or memory references
  - supporting coverage/question anchors when available
- The readiness evaluator must expose explicit structured signals such as:
  - coverage completeness
  - chronological spread
  - thematic spread
  - minimum usable memory quality
- Final chapter creation must occur only after user confirmation.
- Biography generation must consume confirmed chapters, not unconfirmed draft candidates.

# Constraints

- Follow the existing monolith and vertical-slice repo style.
- `0` new runtime dependencies.
- Prefer vanilla TypeScript, Next.js routes, Supabase, and Zod.
- Keep prompt files under `apps/web/src/lib/prompts/` if prompt text is needed.
- Preserve strict auth rules from `AGENTS.md`; no query/body `userId` fallbacks.
- Do not expose `alt_onboarding_private` to the client.
- Keep biography generation manual in v1.
- Keep files local and explicit; avoid orchestration frameworks.

# Non-Goals / Backlog

- Fully automatic final chapter creation without user confirmation.
- Automatic biography generation immediately after chapter readiness.
- Admin/editor review workflow for v1.
- Migration of legacy chapter data beyond safe no-op handling.
- Real-time collaborative editing or multi-user editorial tools.
- A generic unsupervised clustering-only chapter generator disconnected from interview coverage.

# Definition of Done

- The system no longer treats `memory_count >= 5` as sufficient chapter readiness by itself.
- The readiness decision uses both interview coverage and memory corpus quality.
- The system produces `draft chapter candidates` before final chapters exist.
- Users can review and confirm chapter candidates from the dashboard.
- Final chapters are created only after confirmation.
- Confirmed chapters are the only chapters used for manual biography generation.
- Route-level and feature-level tests cover readiness, candidate generation, confirmation, and non-ready states.
- The implementation passes the relevant web tests, build, and type-check.
