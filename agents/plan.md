# Plan: Biography-First Chapter Planning In-Place

## Context Zero

- Workspace: `/Users/camiloecheverri/Documents/AI/Nality/nality`
- OS family: `macOS`
- Runtime:
  - `node v20.19.6`
  - `pnpm 9.12.3`
  - `next 15.3.6`
  - `react 19.0.0`
  - `typescript 5.x`
  - `vitest 2.x`
- Existing chapter architecture to preserve:
  - `apps/web/src/hooks/useChapters.ts`
  - `apps/web/src/modules/chapters/ChaptersModule.tsx`
  - `apps/web/src/app/api/chapters/generate/route.ts`
  - `apps/web/src/app/api/chapters/route.ts`
  - `apps/web/src/app/api/biography/generate/route.ts`
- Existing data sources:
  - `public.memories`
  - `public.interview_question_progress`
  - `public.chapters`
  - `public.biographies`

## Non-Functional Targets

- Preserve the existing monolith and route family; no new service or framework.
- `0` new runtime dependencies.
- Replace memory-count gating with biography-grade readiness logic.
- Produce user-confirmed draft chapters before final publication.
- Keep biography generation manual.
- Keep auth strict and server-only for private interview inputs.
- Maintain build/type-check/test stability.

## Capability Map

### C1. Narrative Readiness
- Evaluate readiness from interview coverage plus memory corpus quality.
- Return structured reasons when not ready.

### C2. Draft Chapter Planning
- Generate biography-grade draft chapter candidates from coverage + memories.
- Ground each draft in explicit evidence.

### C3. Draft Persistence In Place
- Persist draft candidates in the existing `chapters` model using `status='draft'` and planning metadata.
- Do not assign memories at draft-generation time.

### C4. User Confirmation
- Add an in-place confirmation flow in the chapters experience.
- On confirmation, publish chapters and assign memories.

### C5. Biography Guardrail
- Update biography generation to use confirmed/published chapters only.

### C6. Regression Coverage
- Unit tests for readiness and planning.
- Route tests for not-ready, draft generation, confirmation, and manual biography guardrails.
- Smoke validation through build and type-check.

## Dependency Map

- Existing dependencies only:
  - `zod`
  - `ai`
  - `@ai-sdk/openai`
  - `@supabase/ssr`
  - `@supabase/supabase-js`
- No new runtime or dev dependencies.

## Boundary Map

- Auth boundary:
  - `apps/web/src/lib/supabase/server.ts`
  - `apps/web/middleware.ts`
- Planning boundary:
  - `apps/web/src/features/chapter-planning/readiness.ts`
  - `apps/web/src/features/chapter-planning/planner.ts`
- Persistence boundary:
  - `apps/web/src/features/chapter-planning/persistence.ts`
  - Supabase migration extending `public.chapters`
- Route orchestration boundary:
  - `apps/web/src/app/api/chapters/generate/route.ts`
  - `apps/web/src/app/api/chapters/confirm/route.ts`
  - `apps/web/src/app/api/biography/generate/route.ts`
- UI boundary:
  - `apps/web/src/hooks/useChapters.ts`
  - `apps/web/src/modules/chapters/ChaptersModule.tsx`

## Implementation Block

- Identifier: `IB-CHAPTER-PLANNING-IN-PLACE-V1`
- Locality budget: `{files: 10, LOC/file: 120-420, deps: 0}`

### Deliverable Scope

1. A new `chapter-planning` feature slice with:
   - readiness contracts
   - readiness evaluator
   - draft chapter planner
   - persistence helpers
2. One migration extending `public.chapters` with planning metadata.
3. A rewritten `/api/chapters/generate` route that:
   - returns not-ready state when applicable
   - creates `draft` chapter candidates when ready
4. A new `/api/chapters/confirm` route that:
   - publishes selected draft chapters
   - assigns memories on confirmation
5. A `useChapters()` client contract that exposes readiness/draft state.
6. A `ChaptersModule` UI that shows:
   - readiness status
   - draft review state
   - confirm action
7. A biography-generation guard that only uses published chapters.
8. Tests for readiness, draft generation, confirmation, and manual biography generation constraints.

### Ordered Build Steps

1. Add a migration extending `public.chapters` with planning metadata.
2. Create:
   - `apps/web/src/features/chapter-planning/contracts.ts`
   - `apps/web/src/features/chapter-planning/readiness.ts`
   - `apps/web/src/features/chapter-planning/planner.ts`
   - `apps/web/src/features/chapter-planning/persistence.ts`
3. Add feature-local tests for readiness and planner behavior.
4. Refactor `apps/web/src/app/api/chapters/generate/route.ts` to:
   - load coverage + memories
   - evaluate readiness
   - create draft chapters only when ready
   - return structured readiness when not ready
5. Add `apps/web/src/app/api/chapters/confirm/route.ts` for publish/assign behavior.
6. Update `apps/web/src/hooks/useChapters.ts` to expose readiness/draft/confirm actions.
7. Update `apps/web/src/modules/chapters/ChaptersModule.tsx` to show readiness and draft review without changing the broader architecture.
8. Update `apps/web/src/app/api/biography/generate/route.ts` to read only published chapters.
9. Add route tests:
   - not-ready response
   - draft generation response
   - confirmation behavior
   - biography-generation guardrail

### Pass / Fail Criteria

- Pass:
  - chapter generation no longer gates on raw `memory_count >= 5` alone
  - readiness uses interview coverage plus memory corpus quality
  - draft chapters are generated before final publication
  - memories remain unassigned until confirmation
  - confirmation publishes chapters and assigns memories
  - biography generation uses only published chapters
  - `pnpm -C apps/web test`, `pnpm -C apps/web build`, and `pnpm -C apps/web type-check` pass
- Fail:
  - draft chapters are indistinguishable from published chapters
  - raw clustering still drives generation without readiness
  - memories are reassigned before user confirmation
  - biography generation can consume draft chapters

## Testscripts

### TS-UNIT-CP-01
- Objective: validate readiness scoring and draft-planning behavior.
- Prerequisites:
  - feature slice tests exist under `apps/web/src/features/chapter-planning/`
- Run commands:
  1. `pnpm -C apps/web test -- src/features/chapter-planning/*.test.ts`
- Expected observations:
  - low coverage returns `ready = false`
  - thin/noisy corpus returns `ready = false`
  - strong coverage + strong corpus returns `ready = true`
  - draft planner emits evidence-backed chapter candidates

### TS-API-CP-01
- Objective: validate `/api/chapters/generate` not-ready behavior.
- Run commands:
  1. `pnpm -C apps/web test -- src/__tests__/api/chapters-planning.test.ts`
- Expected observations:
  - route returns structured readiness payload
  - route does not create chapters when not ready

### TS-API-CP-02
- Objective: validate `/api/chapters/generate` draft creation behavior.
- Run commands:
  1. `pnpm -C apps/web test -- src/__tests__/api/chapters-planning.test.ts`
- Expected observations:
  - draft chapters are created with `status='draft'`
  - planning metadata is persisted
  - memories remain `chapter_id = null`

### TS-API-CP-03
- Objective: validate `/api/chapters/confirm` publish behavior.
- Run commands:
  1. `pnpm -C apps/web test -- src/__tests__/api/chapters-planning.test.ts`
- Expected observations:
  - confirmed drafts are promoted
  - memories are assigned only on confirmation
  - unrelated draft chapters are untouched

### TS-API-CP-04
- Objective: validate biography generation reads only published chapters.
- Run commands:
  1. `pnpm -C apps/web test -- src/__tests__/api/biography-published-only.test.ts`
- Expected observations:
  - draft chapters are excluded
  - no published chapters returns a guarded error

### TS-SMOKE-CP-01
- Objective: validate app integrity after the in-place chapter planning refactor.
- Run commands:
  1. `pnpm -C apps/web build`
  2. `pnpm -C apps/web type-check`
- Expected observations:
  - Next build completes
  - TypeScript passes

### TS-MANUAL-CP-01
- Objective: validate the dashboard chapters UX end to end.
- Prerequisites:
  - local dev server
  - authenticated user with interview coverage and memories
- Setup:
  1. `pnpm -C apps/web dev`
  2. visit `/dash/chapters`
- Expected observations:
  - not-ready users see readiness guidance, not only a memory-count message
  - ready users can generate draft chapters
  - draft review is visible before final publication
  - confirmation publishes chapters
  - biography page remains a separate manual step

## Observation Checklist

- Environment details:
  - node version
  - pnpm version
  - local vs CI env
- Exact steps executed:
  - commands run
  - manual UI route visited
- Observed vs expected:
  - readiness status
  - draft/published state transitions
  - memory assignment timing
  - biography route filtering
- Artifact paths and timestamps:
  - screenshots
  - failing logs
  - SQL/migration output when relevant
- Reproducibility frequency:
  - once
  - twice
  - flaky / non-deterministic

## Debug Rule

If after trying to debug for two turns the tests still fail, stop blind iteration and generate:

- `agents/testscripts/failure_report.md`

The failure report must include:
- title
- severity
- frequency
- implementation-block id
- debug-scope
- failing testscript id
- environment matrix
- build/commit context
- exact reproduction steps
- observed behavior
- expected behavior
- artifact references

