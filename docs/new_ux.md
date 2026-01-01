New UX Flow 



Product North Star
A voice-first memory capture app that:
1. makes it effortless to record life moments (no structure required),
2. naturally organizes them over time,
3. condenses them into life chapters, and
4. generates a draft biography the user can refine.
Core UX principle:Capture → Accumulate → Condense → Reflect → Edit(Chapters/biography are not created at input time.)

Core Data Objects
* Memory (atomic unit)
    * Raw text transcript
    * Timestamp (primary organizer)
    * System-inferred metadata (optional): people, places, topics, emotions, intensity, confidence
* Chapter (emergent cluster)
    * Time range + theme label
    * Summary paragraph
    * Contains many memories
    * Always starts as Draft
* Biography (generated artifact)
    * A structured narrative composed from chapters
    * Editable text output (not a separate “mode”)

Primary Navigation Model
Keep nav minimal:
* Home (Feed) = default, daily use
* Chapters (New Timeline) = appears when ready or on demand
* Biography (Draft Document) = generated artifact entry point
* (Optional later) Insights = only when meaningful
Navigation tab remains the same for now 

End-to-End User Journey (this is already done)
1) Login
Goal: get user into capture quickly.UI: standard auth (email/SSO/Apple/Google).

2) Onboarding (Voice Agent or Chat)
Goal: personalize tone and reduce blank-page anxiety.
UX pattern: conversational onboarding use questions from onboarding.txt

Outcome: a lightweight “user profile” that adjusts:
* prompt style
* resurfacing cadence
* biography tone (neutral vs poetic)
* how assertive AI suggestions are
* bASIC INFformqtion about the person: what they like, who their parents are, brothers 

3) Home Screen (Memory Feed) — The Main Product
Default view: chronological feed grouped by date.
UI components
* Date headers: “Today / Yesterday / Dec 2025”
* Memory cards (short excerpt + time)
* Primary CTA: “+ Add Memory”

Behavior
* Scrolling = reviewing life
* No complex organization UI
* No mandatory tags, mood, categories

4) Add Memory (Single Modal which already exists) 
Trigger: tap +,
Modal states
1. Listening (live waveform optional)
2. Processing (short “Working…” state)
3. Saved confirmation (“Added to Today”)
Input options
* Voice: user talks naturally
* Text: quick entry
Critical rule:No chapter selection, no tagging, no classification during capture.

5) Processing & Storage (Behind the Scenes)
Pipeline (conceptual):
1. Transcribe (if voice)
2. Clean/format (punctuation, paragraphs)
3. Extract optional entities (people/places/topics)
4. Infer optional emotion signals (valence/arousal/confidence)
5. Store memory atom with timestamp
6. Update clustering candidates (chapters) asynchronously
UX promise:User never has to understand this; they just see “Saved.”

How “Life Chapters” Enter the Flow
When chapters are created
Chapters appear only after enough signal exists:
* sufficient memory volume
* temporal density clusters
* user shows reflective intent (e.g., they browse old entries)
Chapters are always introduced softly, never forced.
Where the user sees the chapter entry point
A gentle card in the feed after thresholds are met:
* “We’ve noticed meaningful periods forming. View your life as chapters?”
* Buttons: View Chapters / Not now
This keeps Home clean and preserves capture flow.

Chapters UI (Story View)
First time opening chapters: user sees Draft Chapters (read-only first).
Chapter list
* Chapter title (AI-generated draft)
* Time range
* One-sentence summary
Chapter detail
* Summary paragraph
* “View memories” (shows the memories within the chapter chronologically)
* “Rename” (simple text field)
* Optional: “Adjust boundaries” (v2+)
Important UX rules
* Chapters start as “Draft” to preserve trust.
* Editing is optional and lightweight (rename first, restructure later).

Chapter Creation (What Actually Happens)
When the user taps View chapters, the system does this:
Behind the sChapter Creation (What Actually Happens)
When the user taps View chapters, the system does this:
Behind the scenes
* Groups memory atoms by:
    * Time
    * Semantic similarity
    * Emotional tone
* Names chapters provisionally
cenes
* Groups memory atoms by:
    * Time
    * Semantic similarity
    * Emotional tone
* Names chapters provisionally



Where Biography Happens in the Flow
Biography is not the default
Biography is an intentional artifact the user chooses to generate.
Entry points
* In Chapters view: “Create my biography”
* Or after user revisits Story View: a gentle prompt
Biography UI
A simple document-style draft:
* Sections created from chapters
* Editable text
* Buttons: “Edit”, “Regenerate”, “Change tone”
Key principle:AI is a layer (buttons), not an autonomous narrator.

Connecting Daily Memories ↔ Chapters ↔ Biography
In Memory Detail View
When user taps a memory card, they see:
* full text
* timestamp + capture source (“voice”)
* subtle “Part of: [Chapter Name]” label
    * default auto-assigned
    * optional “Change” action
This creates a quiet, persistent connection without making structure part of capture.

Optional: Insights (Only After It’s Earned)
Insights should not be a default tab in v1.
When it exists, it’s text-first:
* “Patterns we notice…”
* “View examples” (links to memories)
* No heavy charts unless user asks



The UX “Why” (What Makes This Work)
* Low friction capture: one modal, no taxonomy at entry
* Time as the default organizer: humans understand chronology instantly
* Chapters emerge naturally: introduced only when meaningful
* Biography is intentional: feels valuable, not noisy
* AI is controllable: user initiates summaries/rewrites, preserving trust


