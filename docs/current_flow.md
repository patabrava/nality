Here’s how onboarding “memories” and the “Add memory” button flow are persisted and shown, with file pointers.

Onboarding (text chat and voice)
- Capture:
  - Text chat: `/api/chat` intercepts each request, finds the latest user message + preceding assistant question, and infers a topic. It inserts a row into `onboarding_answers` with `user_id`, `session_id`, `question_topic`, `question_text`, `answer_text`, etc., via a Supabase service client (bypassing RLS). @apps/web/src/app/api/chat/route.ts#118-222
  - Voice onboarding: [useVoiceAgent](cci:1://file:///Users/camiloecheverri/Documents/AI/Nality/nality/apps/web/src/hooks/useVoiceAgent.ts:31:0-516:1) saves each user/assistant turn to `chat_messages` through `/api/onboarding/session` (POST). It ensures an onboarding chat session exists (`chat_sessions` row with type `onboarding`) and persists each utterance (`role`, `content`). @apps/web/src/hooks/useVoiceAgent.ts#93-153 @apps/web/src/app/api/onboarding/session/route.ts#162-280
- Session creation/resume:
  - GET `/api/onboarding/session` checks for an incomplete `chat_sessions` row for the user (`type='onboarding'`), returns it with messages from `chat_messages`, or creates a new one. @apps/web/src/app/api/onboarding/session/route.ts#62-155
- Completion:
  - Voice flow detects completion phrases, then POSTs to `/api/onboarding/session` with `markComplete: true` to set `chat_sessions.metadata.is_complete` and mark `users.onboarding_complete`. It then calls `/api/events/convert-onboarding`. @apps/web/src/hooks/useVoiceAgent.ts#325-380
- Conversion to life events/profile:
  - `/api/events/convert-onboarding` calls `convertOnboardingToEvents`, which fetches all `onboarding_answers` for the user and runs them through the extraction API. Depending on the destination, it updates `users`, `user_profile`, or inserts `life_event` rows. @apps/web/src/app/api/events/convert-onboarding/route.ts#1-91 @apps/web/src/lib/events/onboarding-mapper.ts#41-182 @apps/web/src/app/api/events/extract/route.ts#1-311
- Where onboarding answers are stored:
  - `onboarding_answers` table: inserted in `/api/chat` (text onboarding). @apps/web/src/app/api/chat/route.ts#118-222
  - `chat_messages` table: voice onboarding turns saved through `/api/onboarding/session` (POST with role/content). @apps/web/src/app/api/onboarding/session/route.ts#162-280
  - `chat_sessions` table: onboarding session container (type `onboarding`), created/read in `/api/onboarding/session`. @apps/web/src/app/api/onboarding/session/route.ts#62-155
- How shown in the app:
  - Onboarding UI (`ChatInterface` / `useChat`) displays streamed messages and uses `/api/onboarding/session` to load/persist history; [useVoiceAgent](cci:1://file:///Users/camiloecheverri/Documents/AI/Nality/nality/apps/web/src/hooks/useVoiceAgent.ts:31:0-516:1) builds `conversationHistory` for the InterviewInterface.
  - After conversion, life events appear in the timeline via [useLifeEvents](cci:1://file:///Users/camiloecheverri/Documents/AI/Nality/nality/apps/web/src/hooks/useLifeEvents.ts:44:0-472:1) (fetches `life_event` where `user_id = current user`). @apps/web/src/hooks/useLifeEvents.ts#126-189

“Add memory” button flow
- UI trigger:
  - `AddMemoryButton` is a stylized button; in the dashboard and timeline it opens `VoiceModeSelector` to choose interview/free-talk/text. @apps/web/src/components/buttons/AddMemoryButton.tsx#1-86 @apps/web/src/modules/timeline/TimelineModule.tsx#410-425 @apps/web/src/app/(protected)/dash/page.tsx#170-195
- Voice interview/free-talk path:
  - [InterviewInterface](cci:1://file:///Users/camiloecheverri/Documents/AI/Nality/nality/apps/web/src/components/voice/InterviewInterface.tsx:16:0-381:1) -> [useVoiceAgent](cci:1://file:///Users/camiloecheverri/Documents/AI/Nality/nality/apps/web/src/hooks/useVoiceAgent.ts:31:0-516:1) (with `chapterId` when in a chapter). AI replies include save markers.
  - [useVoiceAgent](cci:1://file:///Users/camiloecheverri/Documents/AI/Nality/nality/apps/web/src/hooks/useVoiceAgent.ts:31:0-516:1) watches assistant messages for `[SAVE_MEMORY]`/“memory saved” patterns; when found, it calls [onMemorySaved](cci:1://file:///Users/camiloecheverri/Documents/AI/Nality/nality/apps/web/src/components/voice/InterviewInterface.tsx:43:4-45:5) (passed down from parent) with the event ID if present. @apps/web/src/hooks/useVoiceAgent.ts#392-402
  - Extraction/persistence: When AI decides to save, the assistant content is sent to `/api/events/extract` with `source='chapter_chat'`, which looks for `[SAVE_MEMORY]` blocks and inserts into `life_event` via a Supabase service client. @apps/web/src/app/api/events/extract/route.ts#116-210 @apps/web/src/app/api/events/extract/route.ts#225-299
- Text chapter chat path:
  - [ChapterChatInterface](cci:1://file:///Users/camiloecheverri/Documents/AI/Nality/nality/apps/web/src/components/chat/ChapterChatInterface.tsx:30:0-337:1) uses `/api/chat/chapter`; when an assistant message matches save patterns, it POSTs to `/api/events/extract` (source `chapter_chat`, chapterId), which inserts `life_event`. On success, `onEventCreated` is fired, and the parent refreshes. @apps/web/src/components/chat/ChapterChatInterface.tsx#58-110
- Timeline display:
  - [useLifeEvents](cci:1://file:///Users/camiloecheverri/Documents/AI/Nality/nality/apps/web/src/hooks/useLifeEvents.ts:44:0-472:1) fetches `life_event` rows for the user (optionally filtered), transforms them, and the `TimelineModule` renders them via `LifeEventCard`. @apps/web/src/hooks/useLifeEvents.ts#126-189 @apps/web/src/hooks/useLifeEvents.ts#205-248

Database tables touched
- `onboarding_answers`: persisted per-question answers (text onboarding).
- `chat_sessions`: onboarding session container (type `onboarding`).
- `chat_messages`: onboarding voice/user/assistant turns.
- `users`: updated with onboarding_complete and identity/origins fields.
- `user_profile`: updated with influences/values.
- `life_event`: stores memories/events from chapter chat or onboarding conversion.

Display points
- Onboarding chat shows live messages; voice InterviewInterface shows `conversationHistory`.
- Timeline/Dashboard shows `life_event` data fetched by [useLifeEvents](cci:1://file:///Users/camiloecheverri/Documents/AI/Nality/nality/apps/web/src/hooks/useLifeEvents.ts:44:0-472:1).
- Completion hooks (`handleMemoryComplete`) refresh the page to show new events.

In short: onboarding answers are persisted to `onboarding_answers` (text) or `chat_messages` within an onboarding `chat_sessions` (voice). On completion, `/api/events/convert-onboarding` moves those into `users/user_profile/life_event`. The “Add memory” button launches chat/voice; when AI emits a save signal, `/api/events/extract` writes to `life_event`, which is read by [useLifeEvents](cci:1://file:///Users/camiloecheverri/Documents/AI/Nality/nality/apps/web/src/hooks/useLifeEvents.ts:44:0-472:1) for display.