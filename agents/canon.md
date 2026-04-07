# Canon: Biography-First Chapter Planning In-Place

This canon defines the production architecture for biography-grade chapter planning inside the existing Nality monolith without changing the overall system architecture.

## Locality Budget

- `{files: 10, LOC/file: 120-420, deps: 0 new runtime, 0 new dev}`
- New slice root: `apps/web/src/features/chapter-planning/`
- Database change budget: `1` migration file
- Route family stays inside existing `app/api/chapters/*` and `app/api/biography/*`

## Project-Specific Constitution

1. Chapters are editorial story artifacts, not raw memory clusters. The planner may use AI, but the product meaning of a chapter is biographical, not statistical.
2. The existing architecture stays intact: same Next.js monolith, same Supabase project, same `/api/chapters/*` family, same dashboard chapters surface, no new service or orchestration layer.
3. `interview_question_progress` plus `memories` become the readiness source of truth. `memory_count >= 5` alone is never sufficient.
4. Draft chapter candidates must be grounded in explicit evidence from memories and, when available, interview coverage anchors.
5. Draft chapters may be persisted using the existing `chapters` table in `status='draft'` state plus added planning metadata. Final chapter publication happens only after explicit user confirmation.
6. Memory assignment to chapters must happen on confirmation, not at draft generation time.
7. Biography generation remains manual in v1 and must consume only confirmed/published chapters.
8. Protected chapter and biography routes continue to resolve identity only from verified Supabase cookie/Bearer auth, never from query/body `userId`.
9. The dashboard UX must reveal readiness and draft review clearly, but it must remain within the existing Chapters/Biography product flow rather than introducing a new standalone planning app.

---

## A. Logic & Behavior

### A1. Authentication & Authorization Schema

- Auth method: `session-cookie` first, `JWT-bearer` fallback via existing Supabase server client.
- User model file location:
  - `apps/web/src/lib/supabase/server.ts`
  - `public.users`
- Permission enforcement point:
  - page-level: `apps/web/middleware.ts`
  - route-level: inline guard inside existing chapters/biography routes
- Protected routes for this slice:
  - `POST /api/chapters/generate`
  - `POST /api/chapters/confirm`
  - `PATCH /api/chapters/[id]`
  - `POST /api/biography/generate`

Example permission pattern:

```ts
const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
}
```

Decision:
- Keep the existing Supabase route auth style.
- Do not introduce a parallel auth helper stack just for chapter planning.

### A2. Request Flow & State Management

- Entry point: `HTTP route`
- Primary planning lifecycle:
  - `validate-input`
  - `check-auth`
  - `load-coverage-and-memory-corpus`
  - `evaluate-readiness`
  - `generate-draft-candidates`
  - `persist-draft-chapters`
  - `return-readiness-or-drafts`
- Confirmation lifecycle:
  - `validate-input`
  - `check-auth`
  - `load-draft-chapters`
  - `publish-confirmed-chapters`
  - `assign-memories`
  - `return-finalized-state`
- State storage: `Postgres via Supabase`
- State location:
  - `public.memories`
  - `public.interview_question_progress`
  - `public.chapters`
  - `public.biographies`
- Transaction boundaries: `per-request`

Concrete route flow:

```ts
POST /api/chapters/generate
  -> ChapterPlanningRequestSchema.safeParse()
  -> createClient().auth.getUser()
  -> loadChapterPlanningContext(user.id)
  -> evaluateNarrativeReadiness(progressRows, memories)
  -> if not ready: return readiness payload
  -> buildDraftChapterCandidates({ readiness, memories, coverage })
  -> persistDraftChapters(status='draft', planning_basis=...)
  -> return draft candidates
```

```ts
POST /api/chapters/confirm
  -> ChapterConfirmationSchema.safeParse()
  -> createClient().auth.getUser()
  -> loadDraftChapters(user.id, ids)
  -> publishConfirmedChapters()
  -> assignMemoriesToChapters()
  -> return confirmed chapters
```

State management decisions:
- Preserve the current `useChapters()` hook as the client entrypoint.
- Add readiness and draft-candidate state into that hook rather than introducing a new client store.
- Keep published chapters in `public.chapters`; do not create a separate chapter service.

### A3. Error Handling & Recovery

- Error envelope format:

```ts
type ErrorResponse = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  correlationId?: string;
};
```

- Validation library: `zod`
- Validation location: route boundary plus readiness/planning internals
- Retry strategy: `none`
- Fallback behavior on critical failure: `return-error`

Failure handling decisions:
- If readiness fails because coverage data is unavailable, return `500`, not a fake ready/not-ready result.
- If chapter draft generation fails, do not mutate existing published chapters.
- If confirmation partially fails, do not silently assign some memories and leave others ambiguous; keep confirmation atomic per request as far as route logic can enforce.

### A4. Data Contracts & Schemas

- Schema definition tool: `Zod`
- Schema files location:
  - new feature schemas co-located in `apps/web/src/features/chapter-planning/contracts.ts`
  - existing chapter schema remains in `packages/schema/chapter.ts`
- Contract testing approach: `example-based route tests` + `feature-local schema tests`

Canonical additions:

```ts
export const NarrativeReadinessSchema = z.object({
  ready: z.boolean(),
  coverageScore: z.number().min(0).max(1),
  corpusQualityScore: z.number().min(0).max(1),
  chronologyScore: z.number().min(0).max(1),
  gaps: z.array(z.string()),
});

export const DraftChapterCandidateSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  timeRangeStart: z.string().nullable(),
  timeRangeEnd: z.string().nullable(),
  themeKeywords: z.array(z.string()).min(1),
  supportingMemoryIds: z.array(z.string().uuid()).min(1),
  supportingQuestionIds: z.array(z.string()).default([]),
});
```

Persistence contract:
- Reuse `public.chapters` for draft candidates with `status='draft'`
- Add planning metadata column(s) on `public.chapters`, preferably:
  - `planning_basis JSONB DEFAULT '{}'::jsonb`
- `memories.chapter_id` remains `null` until confirmation
- Biography generation reads only `status='published'`

### A5. Critical User Journeys

- Primary happy path:
  1. User completes enough interview material.
  2. User opens `/dash/chapters`.
  3. Chapters screen shows readiness status instead of only “5 memories needed”.
  4. User clicks `Generate Draft Chapters`.
  5. `POST /api/chapters/generate` evaluates readiness and creates draft chapter candidates.
  6. UI renders the draft chapters with evidence-aware summaries.
  7. User confirms.
  8. `POST /api/chapters/confirm` publishes the chapters and assigns memories.
  9. User can manually proceed to biography generation.

- First decision point:
  - Location: `evaluateNarrativeReadiness()` in `apps/web/src/features/chapter-planning/readiness.ts`
  - Branches:
    - `not_ready`: show missing readiness signals
    - `ready`: allow draft generation

- Failure recovery example:
  - LLM planning failure during draft generation:
    - route returns `500`
    - existing chapters remain untouched
    - UI stays on readiness/draft state without partial publish

---

## B. Interface & Design

### B1. Design System Foundation

- Base system: `none-vanilla-CSS` using the existing dashboard token language
- Why this choice:
  - the product already has a recognizable dark editorial shell
  - this slice should extend the current chapters surface, not introduce a new generic wizard
  - no Tailwind or component-library expansion is justified
- Style file location:
  - existing component styles and inline styles in current modules
  - feature-local additions near `ChaptersModule` if required
- Design token file: existing app token/global CSS pipeline

### B2. Distinctive Visual Language

- Typography:
  - keep existing serif-led editorial hierarchy for chapter surfaces
- Color palette:
  - preserve current gold-on-dark dashboard palette
- Spacing scale:
  - preserve current dashboard rhythm
- Border radius:
  - existing rounded cards and pills
- Transition duration:
  - `fast-150ms` to `medium-300ms`

Design decision:
- New UI states are `readiness card`, `draft chapter review cards`, and `confirm chapters` action area.
- Avoid questionnaire-style UX. Present drafts as story arcs with evidence cues, not as technical buckets.

### B3. Component Architecture

- Component file pattern: `existing feature folders with local additions`
- Primary UI file locations:
  - `apps/web/src/modules/chapters/ChaptersModule.tsx`
  - optional supporting components under `apps/web/src/components/chapters/`
- Prop validation: `TypeScript-only`
- State management: `useState/useEffect` inside `useChapters`

### B4. Responsive Strategy

- Breakpoint system: preserve existing app breakpoints
- Layout approach: `flexbox + existing cards`
- Mobile-first or desktop-first: `mobile-first`
- Touch target minimum size: `44px`

### B5. Accessibility Baseline

- Focus indicator style: preserve visible focus ring behavior already used by the app
- ARIA usage pattern: semantic HTML with targeted ARIA for buttons/status regions
- Keyboard navigation: all interactive elements
- Color contrast target: `AA-4.5:1`

---

## C. Architecture & Operations

### C1. Environment & Configuration

- Environment files remain unchanged in structure.
- Config loading stays on the existing app env setup.
- No new provider or environment axis is introduced.
- Keep the current chapter planner on the existing `@ai-sdk/openai` dependency unless there is a later repo-wide provider consolidation.

### C2. Repository Structure

- Exact slice additions:

```text
apps/web/src/features/chapter-planning/
  contracts.ts
  readiness.ts
  planner.ts
  persistence.ts
  planner.test.ts
```

- Existing integration points remain:
  - `apps/web/src/app/api/chapters/generate/route.ts`
  - `apps/web/src/app/api/chapters/[id]/route.ts` and/or new adjacent `confirm` route
  - `apps/web/src/hooks/useChapters.ts`
  - `apps/web/src/modules/chapters/ChaptersModule.tsx`
  - `apps/web/src/app/api/biography/generate/route.ts`

- File size target: `<= 420 LOC/file`
- Max nesting depth: preserve current repo depth

### C3. Dependency Management

- Package manager: `pnpm`
- Lockfile: `pnpm-lock.yaml`
- Dependency budget: `0` new runtime deps
- Vanilla-first exceptions already in repo:
  - `zod`
  - `ai`
  - `@ai-sdk/openai`
  - `@supabase/ssr`
  - `@supabase/supabase-js`

### C4. Build & Development

- Build commands remain:
  - `pnpm install`
  - `pnpm -C apps/web dev`
  - `pnpm -C apps/web build`
  - `pnpm -C apps/web test`
  - `pnpm -C apps/web type-check`
- Dev server port: `3000`
- Hot reload: `yes`
- Build tool: `Next.js`

### C5. Testing Infrastructure

- Test framework: `vitest`
- Test file pattern:
  - feature-local `src/features/**/*.test.ts`
  - API tests in `src/__tests__/api/**/*.test.ts`
- Test database approach: `mock Supabase for route tests`
- Required test types:
  - Smoke: `yes`
  - Unit: `yes`
  - Integration/API: `yes`
  - E2E manual: `yes`

### C6. Logging & Observability

- Logging library: existing route logging helpers or current route logging style
- Log format: `JSON-structured` where existing helpers are used
- Correlation ID strategy: preserve existing route correlation IDs
- Log readiness/planning failures, but never log raw private onboarding payloads

### C7. Security Baseline

- Secrets management: existing env vars only
- Input sanitization: route boundary validation with Zod
- SQL injection prevention: Supabase query builder
- XSS prevention: React escaping
- CORS configuration: unchanged
- Rate limiting: unchanged in v1

### C8. Git & Version Control

- Preserve existing repo strategy
- No architecture split, no subtree, no service extraction

### C9. Deployment & Infrastructure

- Deployment target remains the current app deployment model
- No new infrastructure component is introduced
- Database changes are a single migration extending the existing schema

### C10. CI/CD Pipeline

- Existing CI/build commands remain the contract
- Gate on:
  - relevant `vitest` suites
  - `pnpm -C apps/web build`
  - `pnpm -C apps/web type-check`

