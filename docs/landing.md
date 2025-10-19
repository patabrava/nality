## Nality landing page — product, content, layout, and assets (handoff spec)

This document specifies the public marketing landing page for Nality. It includes page goals, audience, IA, components, layout, content copy, figures/illustrations, accessibility, SEO, analytics, and acceptance criteria. Designed for implementation in Next.js App Router with Tailwind CSS and shadcn/ui.

Assumptions
- Primary audience: individuals and families who want to preserve their life stories; secondary: interviewers/journalists who help capture stories; tertiary: gift-givers.
- Core product: AI-assisted onboarding chat → personal timeline of life events → add photos/video/audio → optional professional interview → export as a beautiful PDF/print-ready “Life Book”.
- Tech basis (from repo): Next.js, Supabase (Auth, Postgres w/ RLS, Storage, Edge Functions), Stripe, Calendly.


## Page objectives

- Explain Nality’s value in <8 seconds: “Turn your memories into a living timeline and a beautiful book.”
- Drive sign-ups and top-of-funnel conversions (CTA: Start My Story).
- Address trust and privacy (RLS, GDPR delete) to remove anxiety.
- Show outcome (book preview) and process (3–4 steps) clearly.
- Provide plan options and basic pricing.
- Capture email for later if user is not ready.


## Information architecture (top-level sections)

1) Header (logo, navigation, CTAs)
2) Hero (value prop + visual + primary CTA)
3) Social proof (logos/testimonials)
4) How it works (step-by-step)
5) Product highlights (timeline, media, interview, export)
6) Outcomes gallery (PDF/print previews)
7) Pricing (Free, Standard, Pro)
8) FAQ (privacy, data, features, billing)
9) Final CTA band
10) Footer (legal, contact, language)


## Navigation and header

- Left: Nality logo wordmark (text or SVG placeholder). Link to `/`.
- Center: links to Features, How it Works, Pricing, FAQ.
- Right: Login and Start My Story (primary).
- Mobile: hamburger → slide-in menu, sticky header.

Copy
- Links: Features · How it works · Pricing · FAQ
- Buttons: Log in · Start My Story

Accessibility
- Provide skip-to-content link.
- Ensure focus rings visible and logical tab order.


## Hero section

Purpose
- Communicate the promise. Show an immediate artifact (book/timeline). One strong primary CTA.

Layout
- Left: headline + subhead + primary CTA + secondary CTA + trust microcopy.
- Right: illustrative visual (timeline + book preview), responsive down-stack on mobile.

Copy
- Headline: Your life, beautifully told.
- Subheadline: Nality helps you turn memories into a living timeline and a gorgeous Life Book—guided by an intelligent companion and, if you like, a real interviewer.
- Primary CTA (button): Start My Story
- Secondary CTA (ghost button): See a sample Life Book
- Microcopy (trust): Private by design. You control who sees your story.

Figure(s)
- Use a composed hero image showing: a vertical timeline with alternating cards and a 3D-ish PDF/book preview.
- Proposed assets:
  - `public/hero/hero-timeline-book.png` (1200×800, <250KB, transparent bg)
  - `public/hero/hero-timeline-book@2x.png` (2400×1600, <600KB)
  - Optional short loop: `public/hero/hero-demo.mp4` (6–8s, muted, <2.5MB)
- Alt text: “A life timeline with photos alongside a preview of a printed Life Book.”

SEO
- Title suggestion: Nality — Your life, beautifully told
- Meta description: Turn memories into a living timeline and a beautiful Life Book. Private by design. Start in minutes.


## Social proof (logos and testimonials)

Layout
- Row of grayscale logos (press or partner placeholders) and short rotating testimonials.

Copy
- Headline: Trusted for the moments that matter
- Testimonials (rotate or stacked):
  - “I recorded my mother’s stories over a weekend. The book we printed is now the centerpiece of our family.” — Sofia R.
  - “The AI prompts helped me remember things I hadn’t thought about in years.” — David K.
  - “As a journalist, I use Nality to structure interviews and deliver a finished keepsake.” — Leila M.

Figures
- Placeholder logos: `public/press/logo-01.svg` … `logo-05.svg` (monotone)

Accessibility
- Provide readable text alternative for carousel content.


## How it works (4-step process)

Layout
- Four steps with numbered icons, each with a short description and optional mini-illustration. On mobile: vertical stack.

Copy
1) Tell us your story
   - Chat naturally by voice or text. Our assistant asks friendly, specific questions to capture events, dates, and details.
2) See your timeline grow
   - Moments become a living, editable timeline—with space for photos, videos, and audio notes.
3) Add depth (optional interview)
   - Prefer a guided conversation? Book a session with a real interviewer. We handle scheduling and transcripts.
4) Save and share your Life Book
   - Export a beautifully designed PDF that’s ready to print or share with family.

Icons / images
- Use existing thematic SVGs for step badges:
  - `public/childhood.svg`, `public/adolescence.svg`, `public/career_growth.svg`, `public/achievements_successes.svg`
- Alt texts: “Childhood milestones”, “Adolescence”, “Career growth”, “Achievements”.


## Product highlights (feature grid)

Layout
- Two rows, two columns. Each block: headline, short body, mini-visual or screenshot.

Copy blocks
- Smart onboarding
  - Start with a guided chat that turns your memories into structured events. Edit anytime.
- A timeline that feels alive
  - Clean, alternating layout. Drag, categorize, and tag important moments. See photos and clips in context.
- Interview, when it matters
  - Professional interviewers can help you go deeper—especially for elder stories. We’ll handle scheduling.
- Export a beautiful Life Book
  - One click to a polished PDF designed for printing and sharing.

Suggested screenshots/figures
- `public/screens/timeline.png` — use a real or staged timeline from the `demo/timeline-alternating` route.
- `public/screens/onboarding-chat.png` — the chat UI capturing a memory.
- `public/screens/media-grid.png` — a small grid of images with captions.
- `public/screens/pdf-preview.png` — a book spread mockup.
- Each with descriptive alt text.


## Outcomes gallery (book and timeline previews)

Layout
- Full-width light surface with 2–3 mocked spreads and an animated page flip (optional). Tap to zoom on mobile.

Copy
- Headline: A keepsake you can hold
- Body: Nality turns your timeline into a polished, print-ready PDF. Choose cover styles and share digitally or order prints.

Figures
- `public/gallery/book-spread-1.jpg`
- `public/gallery/book-spread-2.jpg`
- `public/gallery/book-cover.jpg`
- Alt: “Open book spread showing photos and captions.”


## Pricing

Notes
- Align with Stripe plans once finalized. Below is copy-ready scaffolding.

Copy
- Headline: Simple, flexible plans
- Subhead: Start free. Upgrade when you’re ready to export or book an interview.

Tiers
- Free
  - $0
  - Features: AI onboarding chat, timeline editing, up to 50 photos, basic privacy controls.
- Standard
  - €8 / month or €60 / year
  - Features: Everything in Free, plus unlimited photos, video clips (≤ 2 minutes each), advanced categories/tags, export to PDF.
- Pro
  - €29 / month
  - Features: Everything in Standard, plus interviewer booking and transcript, priority support, custom book themes.

Legal note under table: Prices include VAT where applicable. Interview sessions are billed separately if outside Pro plan.


## FAQ

Q: Who can see my story?
A: Only you by default. You choose what to share and with whom. Access is protected by secure logins.

Q: What happens to my data?
A: Your data lives in a secure database with per-user access controls. You can export or delete it anytime.

Q: Do I need to know exact dates?
A: No—approximate dates are fine. You can edit details later.

Q: Can I add videos and audio?
A: Yes. Short videos (up to ~2 minutes each) and audio notes are supported.

Q: Is there a way to involve a professional interviewer?
A: Yes. You can book an interviewer at any time. They will help you capture richer stories.

Q: Can I print a physical book?
A: Yes. Export a high-resolution PDF and take it to any print service. Print partnerships are coming soon.

Q: Do you support families?
A: Yes. You can collaborate on timelines, and we’ll soon support shared family spaces.

Q: What if I change my mind?
A: You can pause or cancel anytime. Your timeline remains available on the Free plan.

Q: What languages are supported?
A: Start with English; more languages are on the roadmap.

Q: Is this suitable for elders?
A: Absolutely. The guided prompts and optional interviewer help make it easy and enjoyable.


## Final CTA band

Copy
- Headline: Start your story today
- Subhead: It takes just a few minutes to begin. You can always come back to add more.
- Buttons: Start My Story · Explore the Timeline

Background
- Soft gradient using brand colors; ensure contrast for WCAG AA.


## Footer

Columns
- Product: Features, How it works, Pricing, Blog (placeholder)
- Company: About, Contact, Careers (placeholder)
- Legal: Terms, Privacy, Cookie Settings
- Social: LinkedIn, Instagram (placeholders)

Microcopy
- “Nality is a modern way to preserve your life stories.”

Internationalization
- Language switcher (EN · DE placeholder).


## Voice and tone

- Warm, encouraging, clear. Avoid technical jargon on the landing page; save it for docs.
- Use second person (“your story”, “you can”) and tangible outcomes.
- Keep paragraphs short (2–3 lines) with strong verbs.


## Copy deck (ready-to-use text)

Headlines
- Your life, beautifully told.
- Trusted for the moments that matter.
- How it works.
- A timeline that feels alive.
- A keepsake you can hold.
- Simple, flexible plans.
- Start your story today.

Buttons and microcopy
- Start My Story
- See a sample Life Book
- Log in
- Continue
- Private by design. You control who sees your story.

Paragraphs (marketing)
- Nality helps you turn memories into a living timeline and a beautiful Life Book. Begin with a friendly, guided chat—by voice or text—that draws out the moments that matter. Add photos, videos, and audio notes. When you’re ready, export a polished book you’ll be proud to share.

- Whether you’re documenting a life for future generations or creating a gift for someone you love, Nality makes the process simple, secure, and surprisingly fun.

Privacy and trust snippet
- Your story is yours. Nality is private by design with modern access controls. You can export or delete your data at any time.


## Imagery and asset guidance

Use existing repo assets where possible:
- `apps/web/public/childhood.svg`
- `apps/web/public/adolescence.svg`
- `apps/web/public/career_growth.svg`
- `apps/web/public/achievements_successes.svg`
- `apps/web/public/community_contribution.svg`
- `apps/web/public/early_work_life.svg`

Proposed new assets to create (filenames and notes)
- `apps/web/public/hero/hero-timeline-book.png` — Composite hero visual combining timeline UI and book preview.
- `apps/web/public/hero/hero-demo.mp4` — Short muted loop showing a timeline card added after a chat message.
- `apps/web/public/screens/timeline.png` — Screenshot from demo route with 6–8 mixed events.
- `apps/web/public/screens/onboarding-chat.png` — Screenshot of onboarding chat entering a memory.
- `apps/web/public/screens/media-grid.png` — Grid of photos and a video thumbnail with duration badge.
- `apps/web/public/screens/pdf-preview.png` — PDF viewer or mocked book spread.
- `apps/web/public/gallery/book-spread-1.jpg`, `book-spread-2.jpg`, `book-cover.jpg` — Lifestyle-ish product shots.
- `apps/web/public/press/logo-01.svg` … `logo-05.svg` — Neutral grayscale press/partner logo placeholders.

Alt text catalog (assign to <img> or next/image)
- Hero: “A life timeline with photos alongside a preview of a printed Life Book.”
- Timeline screenshot: “Editable life timeline with photos and dates in an alternating layout.”
- Chat screenshot: “Onboarding chat asking about a meaningful life moment.”
- Media grid: “Photo and video tiles with captions and durations.”
- PDF preview: “Two-page Life Book spread with a large image and a caption.”
- Book cover: “Hardcover Life Book on a table.”


## Accessibility and UX details

- WCAG AA minimum contrast for text and interactive elements.
- Keyboard-accessible nav and menus; visible focus indicators.
- Reduce motion preference respected; provide static hero image if `prefers-reduced-motion`.
- Semantic headings: one H1 per page; section headings H2/H3.
- Link purpose clear from text; buttons use verbs.
- Alt text required for all images; decorative images use empty alt.
- Form elements labeled; error messages descriptive.


## SEO and metadata

Meta
- Title: Nality — Your life, beautifully told
- Description: Turn memories into a living timeline and a beautiful Life Book. Private by design. Start in minutes.
- Canonical: https://nality.app/ (placeholder)
- Open Graph
  - `og:title`: Nality — Your life, beautifully told
  - `og:description`: Turn memories into a living timeline and a beautiful Life Book.
  - `og:image`: /hero/hero-timeline-book.png
  - `og:type`: website
- Twitter cards
  - `twitter:card`: summary_large_image
  - `twitter:title`: Nality — Your life, beautifully told
  - `twitter:description`: Turn memories into a living timeline and a beautiful Life Book.
  - `twitter:image`: /hero/hero-timeline-book.png

Structured data (JSON-LD snippets to embed)
- Organization
  - name: Nality
  - url: https://nality.app/
- Product
  - name: Nality Life Book
  - description: Create a living timeline and export a beautiful Life Book.
- FAQPage
  - Use Q/A pairs from FAQ above.


## Analytics and experiments

Primary events
- hero_start_my_story_clicked
- hero_sample_book_clicked
- nav_login_clicked
- how_it_works_step_viewed (1–4)
- feature_screenshot_viewed (timeline/chat/pdf)
- pricing_tier_viewed (free/standard/pro)
- pricing_cta_clicked (free/standard/pro)
- faq_question_expanded
- final_cta_clicked

Funnels to watch
- Landing → Start My Story → Auth success → Onboarding started
- Landing → See sample → Pricing → Start My Story

A/B ideas
- Headline variants (emotional vs. practical)
- Hero visual: static vs. short loop
- Pricing copy emphasis: “Export” vs. “Interview” value


## Performance budget and implementation notes

- Largest Contentful Paint (LCP): ≤ 2.5 s on 3G Fast; hero image ≤ 250KB, serve responsive sizes and preconnect.
- Cumulative Layout Shift (CLS): ≤ 0.1; reserve image heights.
- Total JS on landing: ≤ 150KB gz (exclude app-only code; no heavy deps).
- Defer non-critical scripts; load analytics after interaction or with consent.
- Use next/image for all raster media; lazy-load below the fold.


## Responsive behavior

- Mobile-first single column; important CTAs sticky on small screens.
- Tablet: two-column hero, grid features.
- Desktop: 12-col grid; hero 6/6; features 6/6; gallery full-bleed.
- Support prefers-reduced-motion and dark mode (optional).


## Implementation checklist (acceptance criteria)

- Header and navigation render correctly on desktop and mobile; skip link present.
- Hero shows headline, subhead, primary and secondary CTAs; hero image or loop loads quickly.
- Social proof section displays 4–6 logos and cycles testimonials accessibly.
- How it works section shows 4 steps with icons and short copy.
- Feature grid shows 4 highlight blocks with images.
- Outcomes gallery shows at least 3 book visuals with zoom.
- Pricing table with three tiers and a clear footnote; CTAs track events.
- FAQ supports expand/collapse and deep-linking (hash anchors).
- Final CTA band present with primary action.
- Footer includes legal links and language switcher placeholder.
- All images have meaningful alt text; interactive elements accessible by keyboard.
- Meta tags and structured data in the page metadata export.
- Analytics events implemented as per list above.
- LCP ≤ 2.5s on 3G Fast; CLS ≤ 0.1.


## Handoff notes for design

- Provide both light and dark variants for hero and gallery surfaces.
- Supply a minimal brand color palette with AA contrast at 16px+:
  - Primary: #3B7CE5 (or current brand) ; Hover: darken by 8% ; Focus ring: 2px #3B7CE5 at 40% alpha.
  - Accent: soft gold or coral for highlights; ensure AA with white/black.
  - Backgrounds: neutral 50/950 surfaces for light/dark.
- Typography: system default or Inter; headline weight 700, body 400/500.
- Iconography: lucide-react set for consistency.


## Content inventory (for tracking)

- Copy: all included above; final microcopy can be adjusted in dev.
- New assets to create: hero image/loop, 4 screenshots, 3 gallery photos, 5 logo placeholders.
- Existing assets to reuse: thematic SVGs listed in Imagery and asset guidance.


---

Appendix: quick route mapping (suggested)
- `/` — landing page (this spec)
- `/sample` — sample Life Book preview (static)
- `/pricing` — dedicated pricing (optional; anchors to section otherwise)
- `/login` — existing auth route
