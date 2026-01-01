# Nality New UX – System State & Logic ↔ Frontend Interaction

_Last updated: 2026-01-01_

## 1. High-Level Architecture

```
Voice/Text Capture (InterviewInterface, FreeTalkInterface, TextMemoryInput)
        │
        ▼
Supabase REST (Next.js App Router API routes)
        │
        ▼
Postgres (memories, chapters, biographies, interview_sessions)
        │
        ▼
React Hooks (useMemories, useChapters, useBiography, useVoiceAgent)
        │
        ▼
Feed & Detail Modules (MemoryFeedModule, ChaptersModule, BiographyModule)
        │
        ▼
Page Routes (/dash, /dash/chapters, /dash/chapters/[id], /dash/biography, /dash/memory/[id])
```

- **Data moves atomically.** Every capture produces a row in `memories`. Higher-order structures (chapters, biography) are derived asynchronously.
- **All user state is scoped by Supabase RLS** using `auth.uid()`; every table has insert/select/update/delete policies plus `updated_at` triggers.
- **AI touches** occur in `/api/chapters/generate` and `/api/biography/generate` via `@ai-sdk/openai` + `zod` validation. Generated artifacts immediately persist and update derived counts.

## 2. Database & Domain Model

_Source: `supabase/migrations/20260101_001_create_memories_system.sql`_

| Table | Purpose | Key Columns & Logic |
| --- | --- | --- |
| `memories` | Atomic captures | `raw_transcript`, `capture_mode (interview/free_talk/text)`, `suggested_chapter_id`, `chapter_id`, `processing_status`, `captured_at`. Triggers maintain chapter + interview session counts. |
| `interview_sessions` | Groups structured interview exchanges | Maintains `topics_covered`, `memory_count`, `processing_status`. |
| `chapters` | Emergent, AI-generated collections | `title`, `summary`, `theme_keywords`, `time_range_*`, `status (draft/published)`, `memory_count`, `display_order`. |
| `biographies` | Versioned narrative artifact | `content`, `tone (neutral/poetic/formal)`, `is_current`, `chapter_ids`. |

Enums: `memory_capture_mode`, `memory_processing_status`, `chapter_status`, `biography_tone`.

Every table has:
- Composite indexes for user + sorting, e.g. `idx_memories_user_captured`.
- RLS policies for CRUD per user.
- `handle_updated_at()` trigger for metadata.

## 3. Schema Package (`packages/schema`)

- **`memory.ts`**: Zod schemas + TS types for `Memory`, `InterviewSession`, helper utilities `groupMemoriesByDate`, `formatDateHeader`, `getMemoryModeLabel`, etc.
- **`chapter.ts`**: Dynamic chapter definitions (AI generated). Distinct from `chapters.ts`, which now exports `LegacyChapter` types for the deprecated static tab set.
- **`biography.ts`**: Defines biography request/response models, tone enum.
- `index.ts` re-exports both dynamic and legacy types to keep old modules compiling while new flow is active.

## 4. Backend API Routes (Next.js App Router)

_All routes live under `apps/web/src/app/api`. Key handlers:_

| Route | Method(s) | Responsibilities | Notable Logic |
| --- | --- | --- | --- |
| `/api/memories` | GET, POST | List, create memories with pagination/filter | GET supports `limit`, `offset`, `capture_mode`. POST validates with `MemorySchema`, seeds `processing_status='pending'`. |
| `/api/memories/[id]` | GET, PATCH, DELETE | Single-memory CRUD | PATCH merges updates (e.g., assign `chapter_id`, set `cleaned_content`). DELETE cascades triggers to keep counts accurate. |
| `/api/chapters` | GET, POST | List/create chapters | GET filters by `status`, sorts by `display_order`. POST sets next order number per user. |
| `/api/chapters/[id]` | GET, PATCH, DELETE | Retrieve chapter with child memories, update metadata, delete & unassign memories. |
| `/api/chapters/generate` | POST | AI pipeline: fetch eligible memories, call OpenAI via `generateObject`, insert chapters, assign memories by index map. Handles `force_regenerate` by wiping prior chapters. |
| `/api/biography` | GET, POST | Fetch current or all versions (`?all=true`), create manual entry. Ensures `is_current` uniqueness per user. |
| `/api/biography/generate` | POST | Collects chapters/memories + user profile, prompts OpenAI, stores new version, demotes previous `is_current`. |
| `/api/interview-sessions` | GET, POST | Manage session metadata for voice capture. |

Shared utilities: Supabase client (`@/lib/supabase/server`), `withUser` guard ensures auth context, `try/catch` surfaces JSON error envelopes.

## 5. Hooks & Data Access Layer (`apps/web/src/hooks`)

| Hook | Purpose | Highlights |
| --- | --- | --- |
| `useMemories` | Manage list-level operations | Exposes `memories`, `loading`, `createMemory`, `updateMemory`, `deleteMemory`. Optimistic updates keep UI snappy. Groups via `groupMemoriesByDate`. |
| `useMemory` | Single memory detail page | Fetches / updates / deletes single record, handles router back navigation after deletion. |
| `useChapters` | List and AI generation | Stores `chapters`, tracks `generating`. `generateChapters` hits `/api/chapters/generate`, merges results, and reports toastable state. |
| `useChapter` | Single chapter detail + associated memories | GET `/api/chapters/[id]`, surfaces `chapter`, `memories`, `loading`. |
| `useBiography` | Manage biography view | `biography`, `versions`, `loadHistory`, `generateBiography`, `updateTone`. Keeps `selectedTone` memoized. |
| `useVoiceAgent` | Core voice control state machine | Wraps `useChat`, `useVoiceInput`, `useAudioPlayer`. Manages `agentState`, `liveTranscript`, handles STT→LLM→TTS cycle, emits `onMemorySaved` when server signals persistence. |

All hooks rely on Supabase-authenticated fetches; errors bubble out via returned `error` state for toasts/snackbars.

## 6. Frontend Modules & Components

### Navigation & Layout
- `/app/(protected)/dash/layout.tsx`: Sets tab order `Feed → Chapters → Biography → Contact → Profile`. Renders `HeaderNavigation` with active route detection.
- `HeaderNavigation.tsx`: Luxury dark theme tabs, accessible focus states.

### Memory Feed (`MemoryFeedModule`)
- Uses `useMemories` to fetch and group by date.
- Provides CTA row for `InterviewInterface`, `FreeTalkInterface`, `TextMemoryInput`.
- Cards: `MemoryCard` shows transcript excerpt, capture mode badge, assigned chapter snippet.

### Chapters Experience
- `/dash/chapters`: Renders `ChaptersModule`, which lists chapters in `display_order`, shows status badges, and provides "Generate Chapters" control tied to `useChapters.generateChapters`.
- `/dash/chapters/[id]`: `ChapterDetailPage` uses `useChapter` for metadata + associated memories (rendered via `MemoryCard`). Edit button launches future inline editing.
- Legacy route `/dash/[chapter]` now acts as a client redirect: static IDs route to `/dash/chapters`, UUIDs route to new detail page.

### Biography Experience
- `/dash/biography`: `BiographyModule` shows current biography, tone selector, regenerate button, edit textarea, export placeholders. Hooks keep history panel in sync.

### Memory Detail
- `/dash/memory/[id]`: Allows editing `cleaned_content`, assigning to chapter, deleting memory. Pulls `useMemory` + `useChapters` for dropdown data.

### Voice Capture Surfaces
- `InterviewInterface`: Full-screen guided mode. Displays chapter context (title only), uses `useVoiceAgent` with `autoStart=true`. On close, stops session.
- `FreeTalkInterface`: Lightweight always-on recorder; now references `chapter.title` fallback text.
- `ChapterChatInterface`: Textual fallback for chapter-specific prompts; uses `useChat` and posts to `/api/events/extract` for legacy flow compatibility.

### Additional Assets
- Static prototypes in `apps/web/public/*.html` (e.g., `feed.html`, `chapters.html`) demonstrate luxury dark styling for marketing.

## 7. Data & Interaction Flows

### 7.1 Voice Memory Capture → Feed
1. User opens `InterviewInterface` (from feed CTA).
2. `useVoiceAgent` starts session: obtains auth token, sets `agentState='listening'`.
3. Audio captured via Web Speech API → transcripts appended to conversation history via AI SDK.
4. On AI signal to save, client calls `/api/memories` with `raw_transcript`, `capture_mode='interview'`, `source='voice'`. Hook adds optimistic row with `processing_status='pending'`.
5. Feed re-fetch (or optimistic state) shows new memory at top grouped under today’s date.

### 7.2 Chapter Generation
1. User taps "Generate Chapters" in `ChaptersModule`.
2. `useChapters.generateChapters` POSTs to `/api/chapters/generate` with optional `force_regenerate` flag.
3. Route fetches recent memories lacking chapter assignment, prompts OpenAI to cluster & summarize.
4. Each returned suggestion is inserted as a `chapters` row. Memory indices map to actual `memories` rows; each memory gets `chapter_id` set and triggers `update_chapter_memory_count`.
5. Client receives structured payload and merges into `chapters` state; UI updates counts + statuses immediately.

### 7.3 Biography Generation
1. In `BiographyModule`, user selects tone and clicks "Generate".
2. Hook POSTs to `/api/biography/generate` with chosen tone.
3. Route fetches published chapters + their memories + `user_profile`, crafts prompt for OpenAI, receives narrative sections.
4. New biography row inserted with `is_current=true`; previous versions set to `false`.
5. Client revalidates data; main panel shows fresh content, history drawer lists all versions with timestamps.

### 7.4 Memory Detail Editing
- `MemoryDetailPage` loads specific memory by id. User can:
  - Assign/unassign chapter: triggers `useMemory.updateMemory`, which PATCHes `/api/memories/[id]`.
  - Edit cleaned content: same endpoint.
  - Delete memory: DELETE route, then `router.push('/dash/feed')`.

## 8. Testing & Tooling

- **Vitest** installed (`apps/web/package.json` scripts `test`, `test:run`, `test:coverage`).
- Test suites reside in `apps/web/src/__tests__/`:
  - `api/memories.test.ts`, `api/chapters.test.ts`, `api/biography.test.ts`: exercise REST endpoints (happy paths + auth-expected fallbacks).
  - `e2e/memory-flow.test.ts`: simulates end-to-end lifecycle (create memory → generate chapters → assign memory → generate biography → verify feed grouping).
- `vitest.config.ts` defines Node env, globs, aliases (`@` → `src`).
- `pnpm run build` now succeeds end-to-end (after adding `@ai-sdk/openai`, `zod`, cleaning legacy type usage).

## 9. Legacy Compatibility & Redirects

- Static chapter config (`lib/chapters/config.ts`) now typed as `LegacyChapter`. Still used by portions of Timeline module and marketing prototypes.
- `/dash/[chapter]` route converted to redirect shim. Old URLs still work.
- Timeline module still references voice/chat components (with `as any` casts) while new feed-first experience lives elsewhere. Future cleanup could fully remove these surfaces.

## 10. Outstanding Considerations

1. **Processing pipeline**: backend currently stores `processing_status='pending'`; actual NLP enrichment jobs should be triggered via background workers (not yet implemented here).
2. **UI polish for marketing HTML**: static prototypes exist but aren’t integrated; they serve design reference only.
3. **Testing**: current Vitest suites rely on live API endpoints; consider mocking Supabase or using edge test harness.
4. **Voice Agent**: Ensure Deepgram / STT credentials configured (`.env`) for real microphone capture.

---

This document should provide the canonical snapshot of how backend logic, React hooks, and the luxury dark frontend interact in the new voice-first memory system. Update it whenever schema/API/UX flows shift.
