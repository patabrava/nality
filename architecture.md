# Nality Technical Architecture (Next.js + Supabase)

*Revision 1.0 – 2 July 2025*

---

## 1 Overview

```
┌──────────────┐           ┌──────────────────┐
│  Next.js App │──────────▶│  Supabase Edge   │───┐
│  (SSR + CSR) │           │  Functions (TS)  │   │
└──────┬───────┘           └────────┬─────────┘   │
       │  (supabase-js)             │             │
       │                            ▼             │
       │                   ┌──────────────────┐    │
       │                   │  Postgres (RLS)  │◀───┘
       │                   └──────────────────┘
       │                            ▲
       │                            │(Storage, Auth)
       ▼                            │
Browser / Mobile (PWA)              │
   (React UI, SWR, Zustand)         │
                                    ▼
                          3rd-Party Services
        ┌──────────┬──────────────┬──────────────┐
        │OpenAI    │Calendly      │PDF/Print API │
        └──────────┴──────────────┴──────────────┘
```

* **Frontend**: Single Next.js project (App Router, TypeScript, React Server Components).
* **Backend**: Supabase Postgres (row-level security), Storage, Auth, and TypeScript *Edge Functions* (serverless).
* **AI / Integrations**: Edge Functions call OpenAI, handle Calendly webhooks, stream PDF jobs to printing API.
* **State**: React client state (Zustand), remote cached state via TanStack Query, authoritative state in Postgres; Realtime updates through Supabase *Channels*.

---

## 2 Monorepo Layout

```
nality/
├─ .env*                  # environment secrets (never committed)
├─ package.json           # workspaces root
├─ turbo.json             # task pipeline (TurboRepo)
├─ apps/
│  └─ web/                # Next.js application
│     ├─ app/             # App Router entry (RSC)
│     │  ├─ layout.tsx    # HTML skeleton
│     │  ├─ page.tsx      # Landing / marketing
│     │  ├─ (protected)/  # Auth-gated routes (timeline, settings…)
│     │  └─ api/          # Route handlers (server actions)
│     ├─ components/      # UI atoms & molecules
│     ├─ features/        # Feature-scoped folders (onboarding/, timeline/, media/, billing/)
│     ├─ lib/
│     │  ├─ supabase/     # Singleton supabase-js client helpers
│     │  ├─ ai.ts         # Server-side OpenAI helpers
│     │  └─ pdf.ts        # Client ↔ Edge PDF requests
│     ├─ hooks/           # React hooks (useAuth, useTimeline…)
│     ├─ store/           # Zustand slices (ephemeral UI state)
│     └─ styles/          # Tailwind config & globals
├─ packages/
│  ├─ ui/                 # Shared component library (shadcn/ui wrappers)
│  └─ schema/             # Zod schemas, generated types from DB
├─ supabase/
│  ├─ migrations/         # SQL migrations (supabase db push / squash)
│  ├─ functions/          # TypeScript Edge Functions
│  │  ├─ onboarding-chat/
│  │  ├─ gap-analysis/
│  │  ├─ calendly-webhook/
│  │  ├─ pdf-export/
│  │  └─ delete-export/
│  ├─ seeds/              # Seed scripts for dev data
│  └─ test/               # db-spec tests (pg-tap)
└─ docs/                  # This PRD, ADRs, schema diagrams
```

---

## 3 What Each Part Does

| Layer              | Folder / Module                      | Responsibility                                                       | Key Tech                           |
| ------------------ | ------------------------------------ | -------------------------------------------------------------------- | ---------------------------------- |
| **Presentation**   | `apps/web/app`                       | Server-side rendering, routing, metadata                             | Next.js 14 App Router              |
|                    | `components/` & `packages/ui`        | Re-usable UI library, Tailwind-themed                                | shadcn/ui, lucide-react            |
|                    | `features/onboarding`                | Chat wizard (voice ↔ text)                                           | React-Speech-Kit, RSC actions      |
|                    | `features/timeline`                  | Vertical Infinite Timeline, CRUD                                     | react-virtualised                  |
|                    | `features/media`                     | Uploader (images ≤ 10 MB, video ≤ 2 min)                             | Supabase Storage, ingest hooks     |
|                    | `features/billing`                   | Stripe customer portal, plan limits                                  | `@stripe/stripe-js`, Server Action |
| **Client State**   | `store/`                             | UI-only state (modals, toasts)                                       | Zustand                            |
|                    | `lib/supabase` + TanStack Query      | Remote cached state (auth, timeline)                                 | supabase-js v2                     |
| **Edge Functions** | `supabase/functions/onboarding-chat` | Streams prompts to OpenAI, normalises answers into `life_event` rows | OpenAI chat v2                     |
|                    | `gap-analysis`                       | Daily cron; flags missing periods, suggests probes                   | PG cron                            |
|                    | `calendly-webhook`                   | Receives booking events, upserts `interview` rows                    | Calendly v2 webhooks               |
|                    | `pdf-export`                         | Generates PDF via PDFKit, stores to Storage, notifies user           | Supabase Storage signed URLs       |
|                    | `delete-export`                      | Fulfil GDPR “delete me” – export ZIP, purge rows & objects           | pg\_graphile job                   |
| **Database**       | `supabase/migrations`                | Source-of-truth DDL, enum types                                      | Postgres 15 + pg\_graphile         |
|                    | RLS policies                         | Owner-scoped access; Interviewer/Admin roles                         | Supabase Auth v2                   |
|                    | `life_event`                         | id, user\_id, title, description, start, end, media\[] jsonb         |                                    |
|                    | `media_object`                       | storage reference, type, duration, …                                 |                                    |
|                    | `interview`                          | schedule, transcript path, duration, cost                            |                                    |
| **Observability**  | Supabase Logs → Logflare             | Structured edge-function logs                                        |                                    |
| **CI/CD**          | GitHub Actions + Supabase CLI        | Preview sites, migration verification                                |                                    |

---

## 4 Data & State Flow

1. **Auth**

   * User lands anonymous → clicks **“Start My Story”**.
   * Supabase magic-link email or passkey → JWT cookie (http-only).

2. **Onboarding Chat (voice or text)**

   * Client streams microphone chunks via Web Speech → interim text.
   * Server Action posts messages to **`onboarding-chat`** Edge Function.
   * Function calls OpenAI with prompt template → returns structured `life_event[]`.
   * Rows inserted; RLS ensures only `user_id = auth.uid()`.

3. **Timeline View**

   * React Server Component fetches `life_event` via `supabase.from(...).select()` (per-request caching).
   * Client uses TanStack Query for real-time edits; Supabase *Channels* push `postgres_changes`.

4. **Media Upload**

   * Direct‐to-Storage signed URL (policy: owner read/write).
   * After upload, row in `media_object` with Metadata (duration, EXIF).
   * Edge Function `media-postprocess` (storage webhook) generates thumb.

5. **Booking & Billing**

   * Calendly embed ➜ upon confirmation, Calendly webhook hits `calendly-webhook`.
   * Function validates signature, creates `interview` row, fires email.
   * Stripe customer created; subscription items set with plan + metered “Interview Hours”.
   * Overage tracked via Stripe metered usage → webhooks → update `usage` table.

6. **Interview Ingestion**

   * Journalist records Meet; uploads MP4 to portal.
   * Storage webhook triggers `transcribe.ts` (Edge) → OpenAI Whisper.
   * Transcript chunks indexed (pgvector) for semantic gap-analysis.

7. **PDF Generation**

   * User clicks “Download My Life Book” → Server Action requests `pdf-export`.
   * Edge Function queries timeline & media, renders PDFKit, saves `/public/books/{uuid}.pdf`.
   * Signed URL returned; client starts download.

8. **GDPR Delete**

   * Settings → “Delete my data”.
   * `delete-export` job packages JSON dump + media, emails link, then purges.

---

## 5 Connection Details

| Client ↔ Supabase | Method                                           | State Boundary                         |
| ----------------- | ------------------------------------------------ | -------------------------------------- |
| Auth              | Cookie, `supabase.auth.getUser()`                | JWT contains `sub` (uid)               |
| Data CRUD         | `supabase.from('life_event')…`                   | DB is single Source of Truth           |
| Realtime          | `supabase.channel('timeline:uid')`               | Pushes patches to TanStack Query cache |
| Media             | Pre-signed PUT, public GET via RLS bucket policy | Storage keeps ACL per-object           |
| Edge Functions    | `supabase.functions.invoke('name', {body})`      | Stateless per-request                  |

---

## 6 State Management Cheat-Sheet

| Concerns                 | Local (Zustand)                    | Remote (TanStack Query) | Persistent (Postgres)        |
| ------------------------ | ---------------------------------- | ----------------------- | ---------------------------- |
| UI layout (drawer open…) | ✔                                  | –                       | –                            |
| Auth session             | – (handled by supabase-js, cookie) | ✔ (cached)              | ✔ (supabase.auth.users)      |
| Timeline list            | –                                  | ✔ (subscribe + cache)   | ✔ `life_event`               |
| Upload progress          | ✔                                  | –                       | –                            |
| Plan usage               | –                                  | ✔ (query `usage_view`)  | ✔ (Stripe webhook → `usage`) |

---

## 7 How Services Connect (Securely)

* **Edge Functions** deployed within Supabase region ↔ private Postgres; use Service Role JWT only inside VPC.
* **OpenAI** key stored in *Supabase Vault*; function fetches `process.env.OPENAI_KEY`.
* **Calendly / Stripe Webhooks** terminate at Supabase Function with HMAC verification; firewall source IP ranges.
* **Browser → Storage**: signed URLs valid 15 min, limited size mime-type.
* **Role-Based Access**:

  * **owner** – can CRUD own events & media.
  * **interviewer** – read/write events for assigned users, cannot delete.
  * **admin** – audit & billing; cannot download without 2FA.

---

## 8 Deployment Pipeline

| Stage              | Action                                                                      | Artifact           |
| ------------------ | --------------------------------------------------------------------------- | ------------------ |
| PR open            | GitHub Actions → `pnpm lint && pnpm test`                                   | status check       |
| `dev` branch merge | Build Next.js → `apps/web/.next` → Deploy Preview (Supabase Branch)         | preview URL        |
| Migrations         | `supabase db push` (shadow DB) → tests                                      | verified schema    |
| `main` branch tag  | Turbo cache → Next.js static output + Edge Functions bundle → Supabase Prod | live site          |
| Rollback           | GitHub Release revert tag → redeploy                                        | previous container |

---

## 9 Extensibility Notes (Post-MVP)

* **Credit-based “Standard” plan** – same schema; plan quotas enforced via RLS view `can_add_event`.
* **VR export** – Edge Function renders GLB timeline → S3, uses BabylonJS in viewer route.
* **Granular sharing** – add `viewer_token` table; link-based RLS checks.

---

## 10 Glossary

| Term                  | Meaning                                                                     |
| --------------------- | --------------------------------------------------------------------------- |
| *Edge Function*       | Supabase-hosted Deno/TS serverless function executed close to DB            |
| *RLS*                 | Row-Level Security (Postgres) – per-row policy enforcement                  |
| *TanStack Query*      | React data-sync library, keeps cache coherent with realtime events          |
| *Zustand*             | Lightweight react state container for UI-only data                          |
| *OpenAI Gap Analysis* | Daily cron that finds timespans > 90 days without events & suggests prompts |

---

