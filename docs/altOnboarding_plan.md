# altOnboarding Implementation Plan (Pre-Registration Wizard)

## 1) Goal

Implement the pre-registration onboarding flow from `docs/altOnboarding.md` as a dynamic, branch-based wizard that:

- starts before account creation,
- branches into path A/B/C from Screen 0,
- persists all collected answers to backend user model/profile storage after signup,
- does **not** expose these specific onboarding answers on any public profile representation,
- ends with registration + post-registration Du/Sie preference capture.

---

## 2) Current Repo Baseline (What Already Exists)

Key findings from current codebase:

- Legacy onboarding exists at `apps/web/src/app/(protected)/onboarding/page.tsx` and is auth-gated.
- Feature flag helper exists but is mostly unused: `apps/web/src/lib/onboarding/flags.ts`.
- Landing and CTA routes still send unauthenticated users to `/login`:
  - `apps/web/src/components/landing/HeroSection.tsx`
  - `apps/web/src/components/landing/LandingHeader.tsx`
  - `apps/web/src/components/landing/FinalCTASection.tsx`
- Auth callback currently redirects incomplete users to `/onboarding`: `apps/web/src/app/auth/callback/page.tsx`.
- `users` table already has `onboarding_complete`, `onboarding_completed_at`, `form_of_address`: `supabase/migrations/20251130_001_chapter_architecture.sql`.
- Existing profile queries are explicit field selects (good for private-field containment): `apps/web/src/hooks/useUserProfile.ts`.
- Existing auth APIs support password signup and Google OAuth but do not take onboarding payload metadata:
  - `apps/web/src/hooks/useAuth.ts`
  - `apps/web/src/components/auth/LoginForm.tsx`

---

## 3) Implementation Strategy (High-Level)

### 3.1 Rollout model
Use a **feature-flagged parallel flow**:

- Keep legacy `/onboarding` intact for safe fallback.
- Introduce new public route `/alt-onboarding`.
- Gate entry points with `NEXT_PUBLIC_ALT_ONBOARDING_ENABLED`.
- Route incomplete users to `/alt-onboarding` when flag is enabled.

### 3.2 Architecture choice
Use a **config-driven state machine** for A/B/C branching:

- deterministic routing from Screen 0 answer,
- typed step definitions,
- persistent draft in `localStorage` (existing key namespace is already present),
- backend finalize endpoint after auth to write complete payload.

### 3.3 Data storage choice
Store full alt-onboarding answers in a **private JSONB field on `users`** (recommended):

- keeps data on user model/profile backend side,
- easy to version and evolve,
- explicit prevention from accidental rendering by not selecting that field in UI-facing queries.

---

## 4) Target User Flow (State Machine)

## 4.1 Primary states
1. `ENTRY` (Screen 0)
2. `PATH_A` / `PATH_B` / `PATH_C`
3. `NEUTRAL_START_BLOCK` (blue block branch)
4. `REGISTRATION`
5. `POST_REGISTRATION_ADDRESS_MODAL` (Du/Sie)
6. `FINALIZE_AND_REDIRECT`

## 4.2 Entry router
Screen 0 question:
- Answer 1 -> Path A
- Answer 2/3/4 -> Path B
- Answer 5 -> Path C

## 4.3 Path step map

### Path A (Extrovertiert)
- A1: topic preference (single/multi choice)
- A2: audience selection
- A3: demographic mapping
- A4: decision:
  - Option 1 -> neutral “Start Storytelling” block
  - Option 2 -> registration

### Path B (Guided/Unsure)
- B1: preferred way of capturing experiences; one option triggers “Termin buchen” CTA
- B2: acceptable personal depth
- B3: “What matters most at Nality”
- B4: transition info with optional jump to neutral block
- B5: demographic mapping, then registration

### Path C (For third person)
- C1: info step
- C2: demographics of third person
- then registration

## 4.4 Neutral block behavior
- Render as explicit blue-highlight section with neutral storytelling entry.
- Must have clear forward action to registration/finalization.
- Must be reachable from A4 and B4 and return safely without losing progress.

---

## 5) Data Model and Contracts

## 5.1 DB migration
Create new migration in `supabase/migrations/` (timestamped) to extend `users`:

- `alt_onboarding_private jsonb null`
- optional check constraint that JSON is object if present
- comments documenting private-use only
- no public-facing query should select this field

Recommended JSON shape (versioned):

```json
{
  "version": "alt-onboarding-v1",
  "entry": { "answerId": "answer_3", "path": "B" },
  "steps": {
    "B1": { "choice": "guided_questions", "bookedCall": true },
    "B2": { "choice": "medium_personal" },
    "B3": { "choice": ["clarity", "privacy"] },
    "B5": { "demographics": { "ageRange": "50-64", "language": "de" } }
  },
  "neutralBlockVisited": true,
  "registration": {
    "firstNameOrNickname": "Max",
    "lastName": "Mustermann",
    "method": "password"
  },
  "addressPreference": "du",
  "completedAt": "2026-02-20T12:00:00.000Z"
}
```

## 5.2 Frontend draft schema
Create typed draft model under `apps/web/src/lib/onboarding/`:

- strict discriminated union for path A/B/C steps
- explicit option IDs (never branch on display text)
- migration guard for stale local drafts (`version` mismatch => reset)

---

## 6) API and Backend Persistence

## 6.1 New finalize endpoint
Add route:
- `apps/web/src/app/api/onboarding/alt/complete/route.ts`

Responsibilities:
- authenticate user (`createClient()` server-side auth),
- validate payload with zod,
- update `users`:
  - `full_name` from registration inputs,
  - `form_of_address` from modal (du/sie),
  - `onboarding_complete = true`,
  - `onboarding_completed_at = now()`,
  - `alt_onboarding_private = payload`,
- return success envelope + minimal persisted metadata.

## 6.2 Auth modes handling
- Password signup: finalize immediately if session exists.
- OAuth (Google): save draft before redirect; finalize after callback when user is authenticated.
- If email verification delays session creation, keep draft and finalize upon next authenticated visit.

---

## 7) Frontend Build Plan (Files and Responsibilities)

## 7.1 New route + flow components
Add:
- `apps/web/src/app/alt-onboarding/page.tsx` (orchestrator)
- `apps/web/src/components/onboarding-alt/AltOnboardingWizard.tsx`
- `apps/web/src/components/onboarding-alt/AltStepRenderer.tsx`
- `apps/web/src/components/onboarding-alt/AltRegistrationModule.tsx`
- `apps/web/src/components/onboarding-alt/AddressPreferenceModal.tsx`
- `apps/web/src/components/onboarding-alt/NeutralStartBlock.tsx`
- `apps/web/src/components/onboarding-alt/AltProgressHeader.tsx`

Add logic/util files:
- `apps/web/src/lib/onboarding/alt-config.ts` (all question/option constants)
- `apps/web/src/lib/onboarding/alt-machine.ts` (state transitions)
- `apps/web/src/lib/onboarding/alt-draft-storage.ts` (localStorage read/write/clear with versioning)

## 7.2 Reuse existing flag
Use `apps/web/src/lib/onboarding/flags.ts` for gating and draft key integration.

## 7.3 Entry-point routing updates
Update CTAs to enter alt flow when flag enabled:
- `apps/web/src/components/landing/HeroSection.tsx`
- `apps/web/src/components/landing/LandingHeader.tsx`
- `apps/web/src/components/landing/FinalCTASection.tsx`

## 7.4 Incomplete-user redirects
Update incomplete-onboarding routing to use flag helper:
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/auth/callback/page.tsx`
- `apps/web/middleware.ts`

---

## 8) Registration + Du/Sie Preference

## 8.1 Registration form requirements
Implement fields exactly per briefing:

- mandatory: first name or nickname,
- optional: last name,
- mandatory: email,
- mandatory: password,
- OAuth button: Google.

## 8.2 useAuth extension
Extend API signatures (backward-compatible):
- `signUpWithPassword(email, password, options?)`
- `signInWithGoogle(options?)` with custom `redirectTo`

Files:
- `apps/web/src/hooks/useAuth.ts`
- keep `apps/web/src/components/auth/LoginForm.tsx` compatible.

## 8.3 Post-registration modal
Immediately after successful account creation UX event:
- render Du/Sie modal,
- persist choice to draft and backend (`users.form_of_address`),
- then finalize onboarding and redirect to `/dash`.

---

## 9) Privacy Constraint Enforcement (Critical)

Requirement: onboarding-specific answers must never appear on public profile page.

Enforcement approach:
- Keep `alt_onboarding_private` in `users` only.
- Do not add this field to existing profile selects in:
  - `apps/web/src/hooks/useUserProfile.ts`
  - `apps/web/src/lib/supabase/client.ts`
  - any biography/public API responses.
- Add explicit regression test that response DTOs do not contain `alt_onboarding_private`.
- Add code comment in finalize API and user-profile hook documenting privacy boundary.

---

## 10) Testing Plan

## 10.1 Unit tests
Add:
- state machine transition tests (entry answer -> path A/B/C)
- step progression and branch jump tests (A4/B4 neutral routing)
- draft serialization/version reset tests

## 10.2 API tests
Add:
- finalize endpoint unauthorized -> 401
- malformed payload -> 400
- successful finalize -> updates onboarding_complete, form_of_address, private JSON

## 10.3 Regression tests
- Existing onboarding extraction tests remain passing:
  - `apps/web/src/__tests__/api/onboarding-extraction.test.ts`
  - `apps/web/src/__tests__/api/onboarding-convert.test.ts`
- Add test to ensure profile-facing selects exclude private field.

## 10.4 Manual QA matrix
- A path full flow (both A4 options)
- B path with booking CTA trigger
- B path neutral jump and return
- C path third-person demographics
- Password signup finalization
- Google OAuth finalization
- Refresh/reload mid-flow resume
- Draft corruption fallback
- Already-authenticated incomplete user behavior
- Completed user visiting `/alt-onboarding` -> redirect `/dash`

---

## 11) Rollout Plan

1. Ship with `NEXT_PUBLIC_ALT_ONBOARDING_ENABLED=false`.
2. Enable on staging; run full manual matrix.
3. Enable on production for small cohort/internal.
4. Monitor:
   - signup completion rate,
   - onboarding completion rate,
   - callback/finalization errors,
   - drop-off per step.
5. Keep legacy `/onboarding` as immediate rollback path.

---

## 12) Concrete File Change Checklist

### New files
- `apps/web/src/app/alt-onboarding/page.tsx`
- `apps/web/src/components/onboarding-alt/AltOnboardingWizard.tsx`
- `apps/web/src/components/onboarding-alt/AltStepRenderer.tsx`
- `apps/web/src/components/onboarding-alt/AltRegistrationModule.tsx`
- `apps/web/src/components/onboarding-alt/AddressPreferenceModal.tsx`
- `apps/web/src/components/onboarding-alt/NeutralStartBlock.tsx`
- `apps/web/src/components/onboarding-alt/AltProgressHeader.tsx`
- `apps/web/src/lib/onboarding/alt-config.ts`
- `apps/web/src/lib/onboarding/alt-machine.ts`
- `apps/web/src/lib/onboarding/alt-draft-storage.ts`
- `apps/web/src/app/api/onboarding/alt/complete/route.ts`
- `apps/web/src/__tests__/api/alt-onboarding-complete.test.ts`
- `apps/web/src/__tests__/onboarding/alt-machine.test.ts`
- `supabase/migrations/<timestamp>_add_alt_onboarding_private_to_users.sql`

### Modified files
- `apps/web/src/components/landing/HeroSection.tsx`
- `apps/web/src/components/landing/LandingHeader.tsx`
- `apps/web/src/components/landing/FinalCTASection.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/auth/callback/page.tsx`
- `apps/web/middleware.ts`
- `apps/web/src/hooks/useAuth.ts`
- `apps/web/.env.example`
- `apps/web/messages/de.json`
- `apps/web/messages/en.json`

---

## 13) Definition of Done

- All requirements in `docs/altOnboarding.md` represented in flow logic.
- All path answers saved in backend user model payload.
- Onboarding answers do not leak into public/profile-facing outputs.
- Registration module includes required fields + Google OAuth.
- Du/Sie modal appears post-registration and persists preference.
- Draft resume works across refreshes and OAuth roundtrip.
- Test suite + manual QA matrix pass.
