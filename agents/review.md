# Executive Summary

Overall health assessment: **CRITICAL**

- Severity counts: `🔴 3 critical`, `🟡 14 important`, `🟢 3 minor`, `✅ 0 passing`
- Top 3 most urgent issues:
  - Critical API boundaries still do not use a uniform response envelope or runtime DTO validation across the core memory/chat/interview routes.
  - The requested admin capability does not exist yet: there is no `/admin` slice, no server-side admin whitelist, and no admin-safe data aggregation path.
  - There is no committed CI, and the only e2e suite is excluded from normal Vitest runs while several API tests accept `401` responses as success.
- Prescribed direction:
  - keep the monolith
  - add a feature-local `admin-workspace` slice
  - unify auth + admin authorization server-side
  - add route-local Zod DTOs and one response envelope
  - keep dependencies at `0` new runtime deps

# Detailed Findings

## Section A: Logic & Behavior Audit

### A1: Authentication & Authorization Schema
**Current State:** Auth verification is centralized in `apps/web/src/lib/server/auth.ts:23-77`, including cookie and bearer handling, and the debug auth endpoint is development-gated in `apps/web/src/app/api/debug/auth/route.ts:8-19`. However, many routes still bypass that helper and call `supabase.auth.getUser()` directly, for example `apps/web/src/app/api/memories/route.ts:15-22`, `apps/web/src/app/api/interview-sessions/route.ts:15-22`, and `apps/web/src/app/api/chat/sessions/route.ts:11-37`. Protected page gating is client-side only in `apps/web/src/app/(protected)/layout.tsx:15-36`, and there is no admin whitelist or admin route surface yet.
**Assessment:** Base user authentication exists, but the enforcement point is inconsistent and there is no admin authorization model for the requested feature.
**Severity:** 🟡 IMPORTANT
**Remediation:** Introduce a shared server helper for admin access on top of `getAuthenticatedRequestContext`, move new `/admin` pages and APIs behind that helper, and migrate core protected APIs toward one auth path instead of ad hoc `getUser()` checks.

### A2: Request Flow & State Management
**Current State:** The dashboard interview journey spans multiple layers: `apps/web/src/modules/chat/ChatModule.tsx:17-245` decides the mode, `apps/web/src/hooks/useChat.ts:18-162` and `apps/web/src/hooks/useVoiceAgent.ts:79-171` create sessions and wire AI routes, and `/api/chat/biography` then fans into `apps/web/src/app/api/chat/biography/route.ts:67-229` plus prompt generation in `apps/web/src/lib/biography/interview.ts:1-260`. The request flow exceeds the repo target of three logical hops and still mixes generic chat, onboarding persistence, and biography interview behavior in the same surface.
**Assessment:** Core flows are working but too indirect to audit or extend safely. This is the main structural risk for adding the admin workspace.
**Severity:** 🟡 IMPORTANT
**Remediation:** Create a local `admin-workspace` slice and keep each admin flow to page/module -> route handler -> Supabase query helper/schema, with biography-launch behavior reused explicitly rather than inherited through the current chat shell.

### A3: Error Handling & Recovery
**Current State:** Core APIs return incompatible shapes. `apps/web/src/app/api/memories/route.ts:58-67` returns `{ success, data, pagination }` while failures at `:47-49` and `:68-70` return `{ error }`; `apps/web/src/app/api/chat/route.ts:39-42` returns a plain `{ error }` validation response and `:247-257` adds `{ error, details }`; auth helpers return `{ error: 'Authentication required' }` and `{ error: 'Forbidden' }` from `apps/web/src/lib/server/auth.ts:80-85`.
**Assessment:** The app does not have the canonical error envelope the repo already calls for, and critical server boundaries still leak implementation-specific formats. This blocks predictable admin API design and weakens testability.
**Severity:** 🔴 CRITICAL
**Remediation:** Add one shared API envelope contract for success and failure, update the admin routes and the existing memories/interview/biography/chat routes to emit that contract, and convert validation/auth/provider failures into deterministic status/code/message responses.

### A4: Data Contracts & Schemas
**Current State:** Shared Zod schemas exist in `packages/schema/memory.ts:41-116` and `packages/schema/biography.ts:18-36`, but critical routes ignore them and assemble persisted payloads from `Partial<T>` request bodies. Examples: `apps/web/src/app/api/memories/route.ts:83-110`, `apps/web/src/app/api/interview-sessions/route.ts:59-69`, and `apps/web/src/app/api/chat/sessions/route.ts:74-119`.
**Assessment:** Runtime validation is not consistently enforced at feature boundaries even though the schema package already exists. This is a direct blocker for trustworthy admin overview/detail APIs.
**Severity:** 🔴 CRITICAL
**Remediation:** Define route-local request/response DTO schemas for the admin slice and retrofit the memories/interview/biography routes to use `safeParse` rather than `Partial<T>` construction.

### A5: Critical User Journeys
**Current State:** The user-side biography interviewer exists and correctly seeds from private pre-onboarding data in `apps/web/src/app/api/chat/biography/route.ts:96-145`, while the chat module now mounts `ChapterChatInterface` in biography mode from `apps/web/src/modules/chat/ChatModule.tsx:145-158`. There is still no admin route, no admin overview, and no single-user interview workspace separate from the user dashboard navigation in `apps/web/src/app/(protected)/dash/layout.tsx:9-14` and `apps/web/src/components/navigation/HeaderNavigation.tsx:22-27`.
**Assessment:** The biography interviewer is partially remediated, but the requested admin-led in-person interview journey is completely absent.
**Severity:** 🟡 IMPORTANT
**Remediation:** Implement `/admin` with overview -> user search -> user detail -> interview launcher as one cohesive vertical slice, reusing the biography interviewer where it fits without sharing user-dashboard navigation state.

## Section B: Interface & Design Audit

### B1: Design System Foundation
**Current State:** The root layout imports multiple competing style systems at once: `apps/web/src/app/layout.tsx:4-8` loads `tokens.css`, `utilities.css`, `globals.css`, `timeline.css`, and `landing.css`. Tailwind is still configured in `apps/web/tailwind.config.ts:1-38`, while large UI surfaces also use dense inline styles, for example `apps/web/src/app/(protected)/dash/layout.tsx:21-170`.
**Assessment:** Styling responsibilities are split across Tailwind utilities, global CSS, token files, feature CSS, and inline style objects. This is explicitly below the repo’s design-system target and will make the admin workspace harder to keep coherent.
**Severity:** 🟡 IMPORTANT
**Remediation:** Treat tokens + feature-local CSS as the primary system for the admin slice, limit inline styles to isolated dynamic values, and stop adding new layout surfaces directly in large inline-style components.

### B2: Visual Language
**Current State:** Token definitions are duplicated across `apps/web/src/styles/tokens.css:8-120` and `apps/web/src/app/globals.css:31-132`, with additional theme overrides later in `globals.css:145-239`. Typography is also inconsistent: `apps/web/src/app/layout.tsx:3-18` loads Roboto, while `apps/web/src/app/globals.css:4-5` imports Cormorant Garamond, Inter, and Playfair Display.
**Assessment:** The app has visual identity fragments, but the token and type systems are not single-source. The admin workspace would inherit that inconsistency unless it establishes a deliberate local visual contract.
**Severity:** 🟡 IMPORTANT
**Remediation:** Consolidate token ownership, choose one type hierarchy for the admin workspace, and avoid adding more ad hoc color/font declarations outside the established token layer.

### B3: Component Architecture
**Current State:** Several files exceed the productive size budget: `apps/web/src/components/auth/LoginForm.tsx` is `947` LOC, `apps/web/src/components/onboarding/ChatInterface.tsx` is `870`, `apps/web/src/modules/timeline/TimelineModule.tsx` is `847`, `apps/web/src/components/onboarding-alt/AltOnboardingWizard.tsx` is `830`, and `apps/web/src/hooks/useVoiceAgent.ts` is `598`. The chat and voice surfaces mix orchestration, rendering, and data access in single files (`apps/web/src/modules/chat/ChatModule.tsx:17-245`, `apps/web/src/hooks/useVoiceAgent.ts:45-260`).
**Assessment:** The repo has several god-components/hooks that already slow down extension work. This is a structural risk for any new admin UI unless the new slice is kept disciplined.
**Severity:** 🟡 IMPORTANT
**Remediation:** Build the admin workspace in small local modules and avoid touching the largest legacy files unless the change directly reduces indirection or isolates a dependency for reuse.

### B4: Responsive Strategy
**Current State:** Responsive rules exist but use different breakpoint scales across files: `apps/web/src/styles/landing.css:61,126,148,310`, `apps/web/src/styles/timeline.css:206,239,260,334,374,718,851`, and `apps/web/src/styles/tokens.css:361-374`. Mobile navigation exists in `apps/web/src/components/navigation/HeaderNavigation.tsx:111-191`, but there is no shared breakpoint contract enforced across the app.
**Assessment:** Responsiveness is present, not absent, but it is not standardized. This is a manageable issue rather than a launch blocker.
**Severity:** 🟢 MINOR
**Remediation:** Define one breakpoint scale for the admin slice and verify overview + user workspace on desktop and tablet before expanding wider.

### B5: Accessibility Baseline
**Current State:** Some focus styles exist in `apps/web/src/styles/tokens.css:351-356` and `apps/web/src/styles/utilities.css:464-470`, but key templates still use clickable `div`s and hover-only affordances. Examples: the logo in `apps/web/src/app/(protected)/dash/layout.tsx:40-47` and the logo in `apps/web/src/components/navigation/HeaderNavigation.tsx:79-84` are non-semantic clickable containers; several inline-style components only change affordance via `onMouseOver` / `onMouseOut` in `apps/web/src/app/(protected)/dash/layout.tsx:93-104` and `:126-133`.
**Assessment:** The baseline is incomplete. The admin workspace would regress accessibility if it copies the current inline-interaction patterns.
**Severity:** 🟡 IMPORTANT
**Remediation:** Use semantic links/buttons for all admin navigation, keep visible keyboard focus, and avoid introducing hover-only state changes in the new slice.

## Section C: Architecture & Operations Audit

### C1: Environment & Configuration
**Current State:** `.gitignore` expects an example env file via `!.env.example` in `.gitignore:1-4`, but the file is missing from the repo. Runtime env validation is only per-variable through `apps/web/src/lib/server/env.ts:1-7`, and README environment guidance is manual/incomplete in `README.md:11-28`.
**Assessment:** Environment handling is functional but not production-ready. Missing `.env.example` and no central typed config module will slow onboarding and make admin-route deployment brittle.
**Severity:** 🟡 IMPORTANT
**Remediation:** Add a complete `.env.example`, create one typed config module loaded at startup, and make the admin slice depend on that shared config instead of inline `process.env` reads.

### C2: Repository Structure
**Current State:** The tree still contains backup/orphan files such as `apps/web/src/app/(protected)/dash/page.new.tsx` and `apps/web/src/app/(protected)/dash/page.tsx.bak`, max nesting reaches `8`, and `packages/ui` is still only `.gitkeep`. Feature logic is scattered across `app/api`, `hooks`, `modules`, `components`, and `lib`, which the current canon already calls out.
**Assessment:** The structure is still too fragmented for fast localized changes. The new admin slice should reduce indirection rather than copy the existing layering.
**Severity:** 🟡 IMPORTANT
**Remediation:** Add the admin feature as a tight local slice, remove obvious backup/orphan files during remediation, and keep new server/UI/helpers/tests within the same feature neighborhood.

### C3: Dependency Management
**Current State:** `apps/web/package.json:16-45` carries `16` production dependencies and `11` dev dependencies, including runtime entries such as `@supabase/mcp-server-supabase` that are not part of the live app path. `packages/schema/package.json:6-8` declares `zod` as `latest`, which breaks the repo’s pinned-version rule.
**Assessment:** Dependency bloat is not catastrophic, but the repo is no longer clearly vanilla-first and one shared package is explicitly unpinned.
**Severity:** 🟡 IMPORTANT
**Remediation:** Keep the admin slice at `0` new deps, remove unused runtime packages as part of cleanup, and pin `zod` in the schema workspace package.

### C4: Build & Development
**Current State:** Core scripts exist in `apps/web/package.json:5-15` and root scripts exist in the workspace root, but `apps/web/next.config.ts:1-8` explicitly ignores ESLint during production builds. README instructions in `README.md:42-59` do not mention the real test split or the missing `.env.example`.
**Assessment:** The project can run locally, but the quality gate is weaker than the canon requires. Build regressions can ship without lint enforcement.
**Severity:** 🟡 IMPORTANT
**Remediation:** Restore lint as a build gate once the remediation block is clean, update run instructions to the real repo state, and ensure admin changes land behind a passing build/test/typecheck sequence.

### C5: Testing Infrastructure
**Current State:** Vitest is configured in `apps/web/vitest.config.ts:4-20`, but it excludes `src/__tests__/e2e/**` by default at `:8-13`. The only end-to-end suite, `apps/web/src/__tests__/e2e/memory-flow.test.ts:9-243`, calls `http://localhost:3000` directly and is only runnable via a manual script (`apps/web/package.json:14`). Several API tests treat unauthenticated `401` responses as acceptable success paths, for example `apps/web/src/__tests__/api/memories.test.ts:45-53` and `:78-85`.
**Assessment:** Test infrastructure exists, but the critical-path coverage is weaker than it appears because the live-flow suite is opt-in and some route tests do not assert authenticated behavior.
**Severity:** 🟡 IMPORTANT
**Remediation:** Add contract tests for admin auth/routes, keep smoke integration scripts explicit, and make authenticated happy-path assertions mandatory for the new admin slice.

### C6: Logging & Observability
**Current State:** Logging is dominated by raw `console.log` / `console.error`. The clearest example is `apps/web/src/app/api/chat/sessions/route.ts:19-26` and `:91-97`, which log user ids and user emails during auth checks. Client and hook layers also emit verbose console traces, for example `apps/web/src/hooks/useVoiceAgent.ts:214-249`.
**Assessment:** Observability exists only as console spam, and it includes protected user identifiers. This is below the repo standard and risky for an admin feature that will aggregate even more sensitive data.
**Severity:** 🟡 IMPORTANT
**Remediation:** Add a small structured logger, stop logging user emails/transcripts by default, and include route names/correlation ids instead of raw object dumps.

### C7: Security Baseline
**Current State:** Protected APIs generally rely on Supabase auth and service-role usage is at least preceded by auth checks in routes like `apps/web/src/app/api/chat/route.ts:28-33` and `apps/web/src/app/api/chat/biography/route.ts:67-73`. The debug auth route is development-only in `apps/web/src/app/api/debug/auth/route.ts:8-19`, and the voice token endpoint intentionally returns `410` in `apps/web/src/app/api/voice/token/route.ts`. However, there is no visible rate limiting middleware for AI/voice/chat routes, and there is no admin authorization boundary yet.
**Assessment:** The baseline is partially sound but incomplete for an internal admin surface and provider-backed routes. The missing admin boundary is the main security gap for the requested work.
**Severity:** 🟡 IMPORTANT
**Remediation:** Add server-side admin authorization, keep private onboarding data server-only in admin payload shaping, and introduce simple route-level throttling for chat/voice/admin aggregation routes.

### C8: Git & Version Control
**Current State:** `.gitignore` correctly covers env files, build output, caches, and editor/OS files in `.gitignore:1-32`, but it also ignores every `*.yml` file in `.gitignore:36-38` and ignores `AGENTS.md` in `.gitignore:44`, which can hide relevant operational/config changes from version control.
**Assessment:** Version-control hygiene is mostly good, but the blanket YAML ignore is too broad for a repo that should eventually carry CI and deployment config.
**Severity:** 🟢 MINOR
**Remediation:** Narrow the YAML ignore rule, keep generated artifacts under `agents/`, and stop excluding files that should be part of repo governance.

### C9: Deployment & Infrastructure
**Current State:** The live deployment target is Vercel via `apps/web/vercel.json`, and Turbo is configured for builds in `turbo.json`. The problem is not missing deployment config; it is that the public docs still describe a different system with Supabase Edge Functions, TanStack Query, Stripe, Calendly, and other layers not reflected in the live app (`docs/architecture.md:31-102` and `:181-203`).
**Assessment:** Deployment wiring exists, but infra/documentation parity is weak. This is cleanup work, not the main blocker for the admin slice.
**Severity:** 🟢 MINOR
**Remediation:** Update deployment and architecture docs to the real app shape after the admin slice lands, and add a small health/readiness route only if uptime monitoring is a near-term requirement.

### C10: CI/CD Pipeline
**Current State:** The repository has no committed CI config; the structure scan found `0` files under `.github/`. The situation is reinforced by `.gitignore:36-38`, which ignores all `*.yml` files by default.
**Assessment:** There is no automated install -> type-check -> test -> build gate in version control. For a repo about to add an admin surface that handles privileged data, this is a release-process failure.
**Severity:** 🔴 CRITICAL
**Remediation:** Commit a minimal CI pipeline that runs `pnpm install`, `pnpm type-check`, `pnpm --filter web test`, and `pnpm --filter web build`, then keep the admin slice behind that gate.

# Remediation Plan (Block & Testscripts)

## Context-Zero

- Operating system observed: macOS
- Package manager: `pnpm@9.12.3` from root `package.json`
- App runtime: Next.js `15.3.6`, React `19`, Vitest `2`
- Primary deployment target: Vercel
- Security boundary for this block: approved-admin-only `/admin` workspace layered on existing Supabase auth plus email whitelist

## Implementation-Block Critical-Set (Critical Fixes)

Scope: admin authorization foundation + API contract hardening needed before the admin UI can safely exist.  
Envelope: `{files: 10-13, LOC/file: 80-320, deps: 0 new}`

Required work:
- Add a shared admin authorization helper on top of server auth and a small response-envelope helper.
- Add route-local Zod DTOs for the new admin overview/search/detail APIs.
- Implement `/api/admin/overview`, `/api/admin/users`, and `/api/admin/users/[id]` against existing tables only.
- Retrofit the critical existing routes most likely to be reused by the admin slice (`/api/memories`, `/api/interview-sessions`, `/api/chat/biography`) to the common response envelope + runtime validation model.
- Add `.env.example` and a typed startup config module.
- Commit a minimal CI workflow.

Estimated files affected:
- `apps/web/src/lib/server/*`
- `apps/web/src/app/api/admin/**/*`
- `apps/web/src/app/api/memories/route.ts`
- `apps/web/src/app/api/interview-sessions/route.ts`
- `apps/web/src/app/api/chat/biography/route.ts`
- `packages/schema/*` only if shared DTO promotion becomes justified
- `.env.example`
- `.github/workflows/*`

## Implementation-Block Important-Set (Important Improvements)

Scope: the actual admin workspace UI and related experience cleanup.  
Envelope: `{files: 8-11, LOC/file: 100-320, deps: 0 new}`

Required work:
- Add `/app/(protected)/admin/page.tsx` and `/app/(protected)/admin/users/[id]/page.tsx`.
- Build a local admin overview module with real KPIs and simple CSS/SVG charts.
- Build a local admin user workspace with tabs/sections for profile context, memories/chapters/biography, prior sessions, and interview launcher.
- Add the admin entry to navigation without coupling it to the user dashboard state machine.
- Reuse the biography interviewer flow explicitly for admin-led in-person interviews, but do not route admin work through onboarding persistence or the user dashboard’s chat/session assumptions.
- Start a small structured logger and remove PII-heavy console logs from the routes touched by this block.

Estimated files affected:
- `apps/web/src/app/(protected)/admin/**/*`
- `apps/web/src/modules/admin/**/*`
- `apps/web/src/components/admin/**/*`
- `apps/web/src/components/navigation/*`
- `apps/web/src/hooks/useVoiceAgent.ts` only if a tiny extraction is required for safe reuse

## Implementation-Block Polish-Set (Polish)

Scope: cleanup that should follow once the admin slice is working.  
Envelope: `{files: 5-8, LOC/file: 40-220, deps: 0 new}`

Required work:
- Remove or document orphan backup files and placeholder structure.
- Normalize breakpoint usage for the admin slice and verify keyboard/focus behavior.
- Update `README.md` and stale docs to the actual post-remediation architecture.
- Pin shared-package dependency versions and narrow `.gitignore` YAML exclusions.

Estimated files affected:
- `README.md`
- `docs/*`
- `.gitignore`
- `packages/schema/package.json`
- obvious backup/orphan files under `apps/web/src/app/(protected)/dash/`

## Testscripts

### TS1: Admin Auth Gate
**Objective:** Prove only whitelisted authenticated users can access admin APIs/pages.
**Prerequisites:** Valid Supabase auth session for one whitelisted admin email and one normal user.
**Setup-Steps:** Seed or configure the whitelist in env/config; start the app locally.
**RUN:** Open `/admin`; call `/api/admin/overview` and `/api/admin/users?q=test` as admin, then repeat as non-admin.
**OBSERVE:** Admin receives `200` with the common success envelope; non-admin receives deterministic `403` failure envelope; unauthenticated requests receive deterministic `401`.
**COLLECT:** Response bodies, route logs, exact env/config used, and screenshots of the page states.
**REPORT:** Note pass/fail per actor and include the absolute timestamp plus git commit.

### TS2: Admin Overview Metrics
**Objective:** Prove the overview KPIs and charts are computed from real persisted data.
**Prerequisites:** Seed data present in `users`, `memories`, `chapters`, `biographies`, `interview_sessions`.
**Setup-Steps:** Start app with seeded local DB; log in as admin.
**RUN:** Load `/admin`, switch the supported date/status filters, and call the overview API directly.
**OBSERVE:** KPI counts and chart values change consistently with the filters and match the raw API payload.
**COLLECT:** Screenshot of overview, raw JSON payload, and the exact filter combinations tested.
**REPORT:** Record observed vs expected metric totals and whether every filter state stayed deterministic.

### TS3: Admin User Workspace And Interview Launch
**Objective:** Prove an admin can find a user, inspect the workspace, and launch/continue the interview path from there.
**Prerequisites:** At least one user with private onboarding data, memories, and interview history.
**Setup-Steps:** Log in as admin and note the target user identifier.
**RUN:** Search/select the user, open `/admin/users/[id]`, inspect each tab/section, then launch the interview flow and save one new interview memory.
**OBSERVE:** The workspace shows the expected aggregated context; the interview launch does not route through onboarding UI; the saved memory and interview session counters update correctly.
**COLLECT:** Screenshots of each workspace state, network payloads for the detail and interview routes, and the new memory/session ids.
**REPORT:** Record whether the saved memory is visible in the user workspace and whether regression reruns stayed green.

### TS4: User Dashboard Regression
**Objective:** Ensure the normal user dashboard still works after the admin slice lands.
**Prerequisites:** Standard authenticated non-admin user.
**Setup-Steps:** Start from a clean local session or separate browser profile.
**RUN:** Re-run memory add, chapter generation, biography generation, and the existing biography interview launch from `/dash/chat`.
**OBSERVE:** Normal users are not shown admin navigation, and the pre-existing user-side flows still behave as before.
**COLLECT:** Manual run notes, screenshots, and any failing route responses.
**REPORT:** Compare against the pre-remediation baseline and flag any regression immediately.

### TS5: Quality Gate
**Objective:** Validate the repo-level build and test gate after remediation.
**Prerequisites:** App dependencies installed and env configured.
**Setup-Steps:** None beyond normal setup.
**RUN:** `pnpm type-check`, `pnpm --filter web test`, `pnpm --filter web build`, plus the explicit admin smoke script or documented local run sequence.
**OBSERVE:** Typecheck passes, route tests pass, build passes, and the admin smoke path is runnable from the documented commands.
**COLLECT:** Command outputs, timestamps, and artifact paths.
**REPORT:** Attach pass/fail status for every command and note any flaky behavior.

## Regression Rule

- After every meaningful fix in the critical or important set, rerun the latest passing testscripts plus all earlier ones.
- Minimum rerun order:
  - after auth/contract changes: `TS1`, then `TS5`
  - after overview/data changes: `TS1`, `TS2`, then `TS5`
  - after workspace/interview UI changes: `TS1`, `TS2`, `TS3`, `TS4`, then `TS5`

## Failure Clause

- If after trying to debug for two turns or more the tests still fail, generate `agents/testscripts/failure_report.md`.
- The failure report must include:
  - title
  - severity
  - implementation-block
  - debug-scope
  - script identifier
  - environment matrix
  - reproduction steps
  - observed behavior
  - expected behavior
  - artifact references
  - initial hypothesis
  - workaround if any
  - regression-test status
  - ownership
