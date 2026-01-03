# Nality Landing Page Rebuild Plan - Granular Implementation

**Status:** Engineering Ready  
**Target:** MVP with bilingual support, booking integration, prototype showcase, and GDPR compliance  
**Implementation Approach:** Atomic tasks, test-driven, dependency-aware

---

## 🎯 Project Overview

This plan rebuilds the Nality landing page content according to marketing specifications:
- **Bilingual support** (DE/EN) with route-based i18n
- **Conversion optimization** via Calendly/Cal.com booking modal
- **Prototype showcase** section with carousel
- **Legal compliance** with GDPR-compliant consent management
- **Performance optimization** (LCP < 2.5s, lazy loading)

Each task is atomic, testable, and has clear acceptance criteria.

---

## 📋 Phase 1: Foundation & Infrastructure (14 tasks)

### 1.1: Enhance i18n Infrastructure
**Dependency:** None  
**Start:** Current basic i18n setup exists  
**End:** Full route-based i18n with locale persistence  
**Test:** `/en` routes work, locale switcher functions, URLs update correctly  
**Focus:** Route-based internationalization foundation

**Files:**
- `apps/web/src/app/[locale]/layout.tsx` (create)
- `apps/web/src/app/[locale]/page.tsx` (create)
- `apps/web/src/lib/i18n.ts` (update)
- `apps/web/middleware.ts` (update)

**Acceptance Criteria:**
- [ ] `/` defaults to German
- [ ] `/en` shows English content
- [ ] Locale switching persists across navigation
- [ ] URL reflects current locale
- [ ] Fallback to default locale on invalid locale

---

### 1.2: Update Content Dictionary Structure
**Dependency:** 1.1  
**Start:** Basic message files exist  
**End:** Complete content dictionaries for new sections  
**Test:** All new sections have corresponding content keys  
**Focus:** Content management structure

**Files:**
- `apps/web/messages/de.json` (update)
- `apps/web/messages/en.json` (update)

**Content Additions Needed:**
- `booking` section (modal, CTA, consent text)
- `prototype` section (platform preview)
- `problem` section (4 pain points)
- `solution` section (3 methodology cards)
- `differentiators` section
- `trust` section (3 pillars)
- `legal` section (placeholder text)
- `consent` section (banner, categories)

**Acceptance Criteria:**
- [ ] All new sections have German text
- [ ] English text is "premium" (not direct translation)
- [ ] No hardcoded strings in components
- [ ] Keys follow consistent naming convention
- [ ] Special characters properly escaped

---

### 1.3: Create Language Switcher Component
**Dependency:** 1.1  
**Start:** i18n routes working  
**End:** Header language switcher with persistence  
**Test:** Language switch changes URL and content, choice persists  
**Focus:** User language selection

**Files:**
- `apps/web/src/components/i18n/LanguageSwitch.tsx` (create)
- `apps/web/src/components/i18n/useLocale.ts` (create)

**Features:**
- Toggle between DE | EN in header
- Updates URL to correct locale route
- Maintains current page context
- Accessible keyboard navigation
- Visual active state

**Acceptance Criteria:**
- [ ] Switcher appears in header right
- [ ] Clicking changes language immediately
- [ ] URL updates correctly (/ ↔ /en)
- [ ] Current language visually highlighted
- [ ] Screen reader accessible

---

### 1.4: Add SEO Metadata for Bilingual Support
**Dependency:** 1.1, 1.2  
**Start:** Language switcher working  
**End:** Proper hreflang, meta tags per locale  
**Test:** HTML head contains correct lang attributes, hreflang links  
**Focus:** SEO and crawling

**Files:**
- `apps/web/src/app/[locale]/layout.tsx` (update)
- `apps/web/src/lib/seo.ts` (create)

**Implementation:**
- Dynamic title/description per locale
- hreflang links (de, en, x-default)
- Canonical URLs per language
- Open Graph tags per locale
- JSON-LD structured data

**Acceptance Criteria:**
- [ ] `<html lang="de">` for German pages
- [ ] `<html lang="en">` for English pages
- [ ] hreflang alternates point to correct URLs
- [ ] Meta descriptions differ per language
- [ ] Canonical links avoid duplicate content

---

## 📋 Phase 2: Consent Management & GDPR (8 tasks)

### 2.1: Create Consent Banner Component
**Dependency:** 1.2  
**Start:** Content dictionaries complete  
**End:** GDPR-compliant consent banner  
**Test:** Banner shows on first visit, saves preferences, respects choice  
**Focus:** Legal compliance foundation

**Files:**
- `apps/web/src/components/consent/ConsentBanner.tsx` (create)
- `apps/web/src/lib/consent.ts` (create)
- `apps/web/src/hooks/useConsent.ts` (create)

**Features:**
- Two categories: "Necessary", "External Services"
- Accept All / Reject All / Manage options
- Stores choice in localStorage
- Re-appears on consent withdrawal
- Cookie-free default state

**Acceptance Criteria:**
- [ ] Shows on first visit to any page
- [ ] "Accept All" enables all tracking
- [ ] "Reject" allows only necessary
- [ ] Settings persist across sessions
- [ ] Can re-open to change preferences

---

### 2.2: Implement Consent Context Provider
**Dependency:** 2.1  
**Start:** Consent banner exists  
**End:** App-wide consent state management  
**Test:** Components can check consent status, external scripts respect choices  
**Focus:** State management for consent

**Files:**
- `apps/web/src/contexts/ConsentContext.tsx` (create)
- `apps/web/src/app/[locale]/layout.tsx` (update)

**Features:**
- Global consent state
- Methods to check category permissions
- Event system for consent changes
- Integration with banner component
- TypeScript types for categories

**Acceptance Criteria:**
- [ ] `useConsent()` hook available globally
- [ ] `hasConsent('external-services')` works
- [ ] Consent changes trigger re-renders
- [ ] No external scripts load without consent
- [ ] State syncs with localStorage

---

### 2.3: Create ConsentGate Wrapper Component
**Dependency:** 2.2  
**Start:** Consent context working  
**End:** Wrapper for external service gating  
**Test:** Wrapped components only render with consent  
**Focus:** Conditional rendering for consent-required features

**Files:**
- `apps/web/src/components/consent/ConsentGate.tsx` (create)
- `apps/web/src/components/consent/ConsentFallback.tsx` (create)

**Features:**
- Wraps consent-requiring components
- Shows fallback when no consent
- Fallback explains consent requirement
- Link to external service as backup
- Re-renders on consent change

**Acceptance Criteria:**
- [ ] No wrapped content shows without consent
- [ ] Fallback message explains requirement
- [ ] Provides external link alternative
- [ ] Automatically shows content when consent given
- [ ] Accessible fallback design

---

## 📋 Phase 3: Booking Integration (12 tasks)

### 3.1: Create Booking Modal Base Component
**Dependency:** 2.3  
**Start:** Consent gating working  
**End:** Modal framework ready for embed  
**Test:** Modal opens/closes, keyboard accessible, no external scripts yet  
**Focus:** Modal UX foundation

**Files:**
- `apps/web/src/components/booking/BookingModal.tsx` (create)
- `apps/web/src/hooks/useModal.ts` (create)

**Features:**
- Accessible modal with proper focus management
- Backdrop click to close
- Escape key to close
- Portal rendering
- Loading states
- Error states

**Acceptance Criteria:**
- [ ] Modal opens centered on screen
- [ ] Focus traps within modal
- [ ] Escape key closes modal
- [ ] Backdrop click closes modal
- [ ] Screen reader accessible

---

### 3.2: Implement Calendly/Cal.com Embed
**Dependency:** 3.1, 2.3  
**Start:** Modal component ready, consent gating available  
**End:** Working booking embed with consent protection  
**Test:** Embed loads only with consent, booking flow works  
**Focus:** External service integration

**Files:**
- `apps/web/src/components/booking/CalendlyEmbed.tsx` (create)
- `apps/web/src/components/booking/BookingModal.tsx` (update)

**Features:**
- Calendly inline embed component
- Dynamic script loading with consent check
- Embed sizing and responsiveness
- Loading state while embed loads
- Fallback link if embed fails

**Acceptance Criteria:**
- [ ] Embed loads only after external services consent
- [ ] Shows "external link" fallback without consent
- [ ] Responsive within modal
- [ ] Booking events trackable
- [ ] Graceful failure if embed unavailable

---

### 3.3: Add Primary CTA Buttons Throughout Page
**Dependency:** 3.2, 1.2  
**Start:** Booking modal working, content dictionaries complete  
**End:** "Book Call" CTAs in all required sections  
**Test:** All CTAs open booking modal, track analytics events  
**Focus:** Conversion optimization

**Files:**
- `apps/web/src/components/buttons/BookingCTA.tsx` (create)
- `apps/web/src/components/landing/HeroSection.tsx` (update)
- `apps/web/src/components/landing/FinalCTASection.tsx` (update)
- All section components (update for inline CTAs)

**CTA Placements:**
- Hero primary button
- After How It Works section
- After Prototype Preview section
- Trust section inline
- Final CTA section
- Pricing section (consultation tier)

**Acceptance Criteria:**
- [ ] All CTAs use consistent styling
- [ ] CTAs track `cta_primary_click` with section context
- [ ] Text matches locale (DE: "Erstgespräch buchen", EN: "Book a call")
- [ ] All CTAs open same booking modal
- [ ] Button states (loading, success, error)

---

### 3.4: Implement Event Tracking for Booking
**Dependency:** 3.3  
**Start:** CTAs working  
**End:** Complete booking funnel tracking  
**Test:** Analytics events fire for each booking interaction  
**Focus:** Conversion measurement

**Files:**
- `apps/web/src/lib/analytics.ts` (create/update)
- `apps/web/src/components/booking/BookingModal.tsx` (update)

**Events to Track:**
- `cta_primary_click` (props: section, locale)
- `booking_modal_open`
- `booking_modal_close`
- `booking_embed_load`
- `booking_external_link_click`
- `booking_submit` (if provider supports webhooks)

**Acceptance Criteria:**
- [ ] All events include locale and section context
- [ ] Events respect consent for external services
- [ ] Events fire reliably across browsers
- [ ] Debug mode logs events to console
- [ ] Production events sent to analytics

---

## 📋 Phase 4: Content Sections Rebuild (24 tasks)

### 4.1: Update Hero Section for Bilingual
**Dependency:** 1.3, 3.3  
**Start:** Language switcher working, booking CTAs ready  
**End:** Hero section fully bilingual with new CTA  
**Test:** Hero content changes with language, primary CTA opens booking  
**Focus:** Hero conversion optimization

**Files:**
- `apps/web/src/components/landing/HeroSection.tsx` (major update)

**Changes:**
- Replace hardcoded text with i18n keys
- Update primary CTA to "Book Call"
- Keep secondary CTA as "Sample Book"
- Add language switcher to design
- Update trust microcopy

**Acceptance Criteria:**
- [ ] Headline changes DE/EN correctly
- [ ] Primary CTA opens booking modal
- [ ] Secondary CTA maintains current functionality
- [ ] Trust text updates per locale
- [ ] Visual hierarchy preserved

---

### 4.2: Create Problem Section Component
**Dependency:** 1.2, 4.1  
**Start:** Hero updated, content ready  
**End:** New problem section before solution  
**Test:** Section renders with 4 problem points, responsive  
**Focus:** Problem-solution narrative

**Files:**
- `apps/web/src/components/landing/ProblemSection.tsx` (create)

**Content (4 Problems):**
1. Fragmented memories across platforms
2. Manual, time-intensive documentation
3. Too chronological, misses themes
4. No access control or sharing rules

**Acceptance Criteria:**
- [ ] 4 problem cards with icons
- [ ] Responsive grid layout
- [ ] Smooth animations on scroll
- [ ] Bilingual content support
- [ ] Accessible hierarchy

---

### 4.3: Update Solution/Features to 3-Card Layout
**Dependency:** 4.2  
**Start:** Problem section complete  
**End:** Solution section with 3 clear value props  
**Test:** 3 cards render correctly, content matches marketing brief  
**Focus:** Solution clarity

**Files:**
- `apps/web/src/components/landing/ProductHighlightsSection.tsx` (major update)

**3 Solution Cards:**
1. **Methodisch** - AI-guided structure and prompts
2. **Personalisiert** - Adaptive to individual story style
3. **Audience Control** - Granular sharing and privacy

**Acceptance Criteria:**
- [ ] Exactly 3 solution cards
- [ ] Clear icon for each value prop
- [ ] Bilingual titles and descriptions
- [ ] Responsive card layout
- [ ] Visual connection to problem section

---

### 4.4: Create Prototype Preview Section
**Dependency:** 4.3  
**Start:** Solution section updated  
**End:** New section showcasing platform screenshots  
**Test:** Carousel works, images load lazily, responsive  
**Focus:** Product demonstration

**Files:**
- `apps/web/src/components/landing/PrototypePreviewSection.tsx` (create)
- `apps/web/src/components/ui/Carousel.tsx` (create)
- `apps/web/public/prototype/` (directory create)

**Features:**
- 5-slide carousel with lazy loading
- Screenshot placeholders with TODO comments
- Captions per slide
- Touch/swipe support on mobile
- Keyboard navigation
- Lightbox option on click

**Slides:**
1. Guided sessions interface
2. Chapter structure view
3. Access control settings
4. Review and edit flow
5. Export options

**Acceptance Criteria:**
- [ ] Carousel scrolls smoothly
- [ ] Images lazy load below fold
- [ ] Captions change per slide
- [ ] Touch gestures work on mobile
- [ ] TODO comments for missing screenshots
- [ ] Lightbox opens on image click

---

### 4.5: Update How It Works Section
**Dependency:** 4.4  
**Start:** Prototype section complete  
**End:** Refined 4-step process  
**Test:** Steps clearly explain user journey  
**Focus:** Process clarification

**Files:**
- `apps/web/src/components/landing/HowItWorksSection.tsx` (update)

**Refined Steps:**
1. **Share memories** - AI prompts guide recall
2. **Build timeline** - Structure emerges naturally
3. **Review & refine** - Edit and enhance content
4. **Export & share** - Control access, print books

**Acceptance Criteria:**
- [ ] 4 steps with clear progression
- [ ] Each step has descriptive icon
- [ ] Bilingual step titles and descriptions
- [ ] Visual flow between steps
- [ ] Mobile-friendly layout

---

### 4.6: Create Differentiators Section
**Dependency:** 4.5  
**Start:** How It Works updated  
**End:** New section highlighting competitive advantages  
**Test:** Differentiators clearly communicate unique value  
**Focus:** Competitive positioning

**Files:**
- `apps/web/src/components/landing/DifferentiatorsSection.tsx` (create)

**4-6 Differentiators:**
1. AI + Human combination
2. Privacy-first architecture
3. Multi-format output (digital + print)
4. Professional interview option
5. 100-year preservation guarantee
6. No subscription lock-in

**Layout Options:**
- Tile grid (6 cards)
- Comparison table (vs competitors)
- Feature highlight blocks

**Acceptance Criteria:**
- [ ] 4-6 clear differentiators
- [ ] Visual icons for each point
- [ ] Bilingual content
- [ ] Responsive layout choice
- [ ] No competitor naming (focus on features)

---

### 4.7: Create Trust Pillars Section
**Dependency:** 4.6  
**Start:** Differentiators complete  
**End:** Trust section with 3 pillars  
**Test:** Trust elements reinforce security and quality  
**Focus:** Trust building

**Files:**
- `apps/web/src/components/landing/TrustSection.tsx` (create)

**3 Trust Pillars:**
1. **Diskretion** - GDPR, encryption, privacy controls
2. **Qualitätsprozess** - Professional standards, review cycles
3. **Souveränität** - Data ownership, export rights, no lock-in

**Acceptance Criteria:**
- [ ] 3 pillar layout with icons
- [ ] Trust signals (security badges, certifications)
- [ ] Bilingual trust messaging
- [ ] Subtle CTA integration
- [ ] Professional visual design

---

### 4.8: Update FAQ Section with New Content
**Dependency:** 4.7, 1.2  
**Start:** Trust section complete, content dictionaries updated  
**End:** FAQ addresses common concerns about new features  
**Test:** FAQ accordion works, content comprehensive  
**Focus:** Objection handling

**Files:**
- `apps/web/src/components/landing/FAQSection.tsx` (update)

**New FAQ Topics:**
- Booking process and consultation format
- Prototype vs final product expectations
- Data privacy and European hosting
- Bilingual support availability
- Export format options
- Professional interviewer qualifications

**Acceptance Criteria:**
- [ ] 8-12 relevant questions
- [ ] Expand/collapse functionality
- [ ] Bilingual Q&A content
- [ ] Deep link support (hash anchors)
- [ ] Search-friendly structure

---

## 📋 Phase 5: Legal & Compliance (8 tasks)

### 5.1: Create Legal Pages Structure
**Dependency:** 1.1  
**Start:** Route structure working  
**End:** Legal page templates with placeholders  
**Test:** `/impressum`, `/privacy`, `/terms` accessible  
**Focus:** Legal compliance foundation

**Files:**
- `apps/web/src/app/[locale]/impressum/page.tsx` (create)
- `apps/web/src/app/[locale]/privacy/page.tsx` (create)
- `apps/web/src/app/[locale]/terms/page.tsx` (create)

**Page Structure:**
- Clear "Placeholder" header warning
- Structured sections (contact, hosting, tracking, etc.)
- TODO comments for legal team
- Basic responsive layout
- Consistent styling with main site

**Acceptance Criteria:**
- [ ] All 3 pages load without error
- [ ] Pages accessible from German and English routes
- [ ] Placeholder warning prominent
- [ ] Section structure ready for content
- [ ] Mobile responsive layout

---

### 5.2: Add Legal Content to Dictionaries
**Dependency:** 5.1, 1.2  
**Start:** Legal pages exist, content system ready  
**End:** Placeholder legal text in both languages  
**Test:** Legal pages show localized placeholder content  
**Focus:** Bilingual legal structure

**Files:**
- `apps/web/messages/de.json` (update)
- `apps/web/messages/en.json` (update)

**Content Structure:**
```json
{
  "legal": {
    "placeholder": "Placeholder – will be replaced before launch",
    "impressum": {
      "title": "Legal Notice",
      "sections": {
        "responsible": "Responsible Person",
        "contact": "Contact Information",
        "hosting": "Hosting Information"
      }
    },
    "privacy": {
      "title": "Privacy Policy",
      "sections": {
        "overview": "Data Processing Overview",
        "tracking": "Tracking and Analytics",
        "external": "External Services",
        "rights": "Your Rights"
      }
    },
    "terms": {
      "title": "Terms of Service",
      "sections": {
        "scope": "Scope of Services",
        "data": "Data Ownership",
        "liability": "Liability"
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] German legal text structure
- [ ] English legal text structure
- [ ] Placeholder warnings in both languages
- [ ] Section headers for legal team
- [ ] Consistent key naming

---

### 5.3: Update Footer with Legal Links
**Dependency:** 5.2  
**Start:** Legal pages and content ready  
**End:** Footer contains all required legal links  
**Test:** Footer links work from any page, open correct legal pages  
**Focus:** Legal link accessibility

**Files:**
- `apps/web/src/components/landing/Footer.tsx` (update)

**Footer Additions:**
- Impressum link (German pages)
- Privacy Policy link
- Terms of Service link
- Language switcher (if not in header)
- Consistent with locale routing

**Acceptance Criteria:**
- [ ] All 3 legal links present
- [ ] Links respect current locale
- [ ] Links styled consistently
- [ ] Footer responsive on mobile
- [ ] Legal links easily findable

---

## 📋 Phase 6: Performance & Testing (10 tasks)

### 6.1: Implement Lazy Loading for Images
**Dependency:** 4.4  
**Start:** Prototype section with images  
**End:** All images below fold lazy load  
**Test:** LCP improves, images load as user scrolls  
**Focus:** Performance optimization

**Files:**
- `apps/web/src/components/ui/LazyImage.tsx` (create)
- All landing page components (update)

**Features:**
- Next.js Image component optimization
- Intersection Observer for lazy loading
- Responsive image sizing (srcset)
- Blur placeholder while loading
- Error fallback images

**Acceptance Criteria:**
- [ ] Hero image loads immediately
- [ ] Below-fold images lazy load
- [ ] Responsive sizes serve appropriate resolution
- [ ] Loading states visible
- [ ] Graceful error handling

---

### 6.2: Optimize Critical Rendering Path
**Dependency:** 6.1  
**Start:** Lazy loading implemented  
**End:** Hero section loads quickly without layout shift  
**Test:** LCP < 2.5s, CLS < 0.1  
**Focus:** Core Web Vitals

**Files:**
- `apps/web/src/app/[locale]/layout.tsx` (update)
- `apps/web/src/styles/critical.css` (create)

**Optimizations:**
- Critical CSS inlined for hero section
- Font preloading for hero typography
- Hero image preload hint
- Eliminate render-blocking resources
- Reserve space for dynamic content

**Acceptance Criteria:**
- [ ] LCP ≤ 2.5s on 3G Fast throttling
- [ ] CLS ≤ 0.1 throughout page
- [ ] No layout shifts during load
- [ ] Hero interactive quickly
- [ ] Lighthouse Performance > 90

---

### 6.3: Add Analytics Events for New Sections
**Dependency:** 3.4, 4.4, 4.6, 4.7  
**Start:** All new sections complete  
**End:** Complete analytics tracking for new features  
**Test:** All user interactions tracked properly  
**Focus:** Measurement and optimization

**Files:**
- `apps/web/src/lib/analytics.ts` (update)
- All landing page components (update)

**New Events:**
- `section_viewed` (problem, solution, prototype, trust, differentiators)
- `prototype_carousel_slide` (which slide viewed)
- `prototype_lightbox_open` (image clicked)
- `language_switch` (to which locale)
- `legal_link_click` (which page)
- `consent_banner_action` (accept/reject/manage)

**Acceptance Criteria:**
- [ ] All sections fire view events
- [ ] Carousel interactions tracked
- [ ] Language switching measured
- [ ] Consent choices recorded
- [ ] Events include locale context

---

### 6.4: Cross-Browser Testing
**Dependency:** 6.3  
**Start:** All features implemented  
**End:** Functionality verified across browsers  
**Test:** Chrome, Firefox, Safari, Edge work correctly  
**Focus:** Browser compatibility

**Test Matrix:**
- **Desktop**: Chrome, Firefox, Safari, Edge (latest)
- **Mobile**: iOS Safari, Android Chrome
- **Features**: Booking modal, carousel, language switching, consent banner

**Acceptance Criteria:**
- [ ] All CTAs work in all browsers
- [ ] Carousel functions on touch devices
- [ ] Modal focus management works
- [ ] Language switching persists
- [ ] Consent preferences save correctly

---

### 6.5: Accessibility Audit
**Dependency:** 6.4  
**Start:** Cross-browser testing complete  
**End:** WCAG 2.1 AA compliance verified  
**Test:** Screen reader navigation, keyboard access, color contrast  
**Focus:** Accessibility compliance

**Files:**
- All landing page components (update)
- `apps/web/src/styles/a11y.css` (create)

**Accessibility Checks:**
- Screen reader navigation flow
- Keyboard-only navigation
- Color contrast ratios
- Focus management in modals
- Alt text for all images
- ARIA labels for interactive elements
- Skip links functionality

**Acceptance Criteria:**
- [ ] Screen reader announces sections correctly
- [ ] All interactive elements keyboard accessible
- [ ] Color contrast meets WCAG AA
- [ ] Modal focus management works with screen readers
- [ ] Alt text descriptive and helpful
- [ ] Skip to content link works

---

## 📋 Phase 7: Integration & Launch Prep (6 tasks)

### 7.1: Integration Testing
**Dependency:** 6.5  
**Start:** Accessibility audit complete  
**End:** End-to-end user flows tested  
**Test:** Complete user journeys work from landing to booking  
**Focus:** User experience validation

**Test Scenarios:**
1. **German user journey**: Land on `/` → explore sections → book call
2. **English user journey**: Land on `/en` → explore sections → book call  
3. **Language switching**: Start German, switch to English, complete booking
4. **Consent flows**: Reject consent → use fallback links → grant consent → use embeds
5. **Mobile experience**: Complete journeys on mobile devices

**Acceptance Criteria:**
- [ ] All user journeys complete successfully
- [ ] No broken links or 404 errors
- [ ] Language switching maintains context
- [ ] Consent choices persist through journey
- [ ] Mobile experience equivalent to desktop

---

### 7.2: Content Review & Localization QA
**Dependency:** 7.1, 1.2  
**Start:** Integration testing complete  
**End:** All content reviewed for accuracy and tone  
**Test:** Copy matches marketing brief, tone consistent per language  
**Focus:** Content quality assurance

**Review Areas:**
- **German copy**: Natural language, no literal translations
- **English copy**: "Premium English", short sentences, clear value props
- **CTA text**: Consistent across all sections
- **Legal placeholders**: Clear structure for legal team
- **Error messages**: Localized and helpful

**Acceptance Criteria:**
- [ ] German text sounds natural to native speakers
- [ ] English avoids buzzwords, focuses on benefits
- [ ] All CTAs use consistent terminology
- [ ] Legal pages ready for content insertion
- [ ] Error states have appropriate messaging

---

### 7.3: Performance Final Validation
**Dependency:** 7.2  
**Start:** Content review complete  
**End:** Performance metrics meet requirements  
**Test:** Lighthouse scores and Core Web Vitals validated  
**Focus:** Performance compliance

**Performance Requirements:**
- **LCP**: ≤ 2.5s (3G Fast throttling)
- **CLS**: ≤ 0.1
- **FID**: ≤ 100ms
- **Lighthouse Performance**: ≥ 90
- **Total JS**: ≤ 150KB gzipped
- **Hero image**: ≤ 250KB

**Acceptance Criteria:**
- [ ] LCP consistently under 2.5s
- [ ] No layout shifts during page load
- [ ] Interaction delay minimal
- [ ] Lighthouse Performance score green
- [ ] JavaScript bundle size optimized

---

### 7.4: Security Review
**Dependency:** 7.3  
**Start:** Performance validated  
**End:** Security vulnerabilities addressed  
**Test:** External scripts, consent management, data handling secure  
**Focus:** Security compliance

**Security Areas:**
- **External scripts**: Only load with consent, from trusted domains
- **Consent storage**: No sensitive data in localStorage
- **Form submissions**: CSRF protection if needed
- **Content Security Policy**: Restrict script sources
- **Input sanitization**: Prevent XSS in any user inputs

**Acceptance Criteria:**
- [ ] External scripts controlled by consent
- [ ] No sensitive data stored client-side
- [ ] CSP headers prevent unauthorized scripts
- [ ] No XSS vulnerabilities
- [ ] HTTPS enforced throughout

---

### 7.5: Deployment Preparation
**Dependency:** 7.4  
**Start:** Security review complete  
**End:** Ready for staging deployment  
**Test:** Build succeeds, environment variables correct  
**Focus:** Deployment readiness

**Deployment Checklist:**
- Environment variables for Calendly/Cal.com
- Analytics configuration
- Error monitoring setup
- CDN configuration for images
- Routing rules for i18n
- Backup plans for external service failures

**Acceptance Criteria:**
- [ ] Build completes without errors
- [ ] Environment variables documented
- [ ] Analytics connected and testing
- [ ] Error monitoring active
- [ ] Image CDN functioning

---

### 7.6: Staging Validation
**Dependency:** 7.5  
**Start:** Deployed to staging  
**End:** Staging environment fully validated  
**Test:** All functionality works in production-like environment  
**Focus:** Production readiness verification

**Staging Tests:**
- **Functionality**: All features work as in development
- **Performance**: Metrics maintained in production environment
- **Analytics**: Events firing to production analytics
- **External services**: Calendly/Cal.com embed functioning
- **Error handling**: 404s, network failures handled gracefully

**Acceptance Criteria:**
- [ ] All user journeys work on staging
- [ ] Performance metrics meet requirements
- [ ] Analytics events captured correctly
- [ ] External services integrate properly
- [ ] Error pages styled and helpful

---

## 🔄 Implementation Notes

### Dependency Management
- **Parallel execution**: Tasks within same phase can run in parallel where dependencies allow
- **Blocking dependencies**: Phase 1 must complete before Phase 2, etc.
- **Critical path**: i18n infrastructure → content → booking → sections → testing

### Testing Strategy
- **Component level**: Each component tested in isolation
- **Integration level**: User flows tested end-to-end
- **Performance level**: Core Web Vitals measured continuously
- **Accessibility level**: WCAG compliance verified

### Quality Gates
Each phase requires sign-off before proceeding:
1. **Phase 1**: i18n routing works, content structure complete
2. **Phase 2**: Consent management functional
3. **Phase 3**: Booking integration operational
4. **Phase 4**: All content sections complete
5. **Phase 5**: Legal compliance ready
6. **Phase 6**: Performance and accessibility validated
7. **Phase 7**: Production ready

### Risk Mitigation
- **External services**: Fallback links always available
- **Content quality**: Review checkpoints for both languages
- **Performance**: Continuous monitoring throughout development
- **Browser compatibility**: Testing matrix covers major browsers
- **Accessibility**: Early validation prevents late rework

---

## 📊 Success Metrics

### Technical KPIs
- **Performance**: LCP < 2.5s, CLS < 0.1, Lighthouse > 90
- **Accessibility**: WCAG 2.1 AA compliance
- **Browser compatibility**: 99%+ function across target browsers
- **SEO**: Proper meta tags and hreflang implementation

### Business KPIs  
- **Conversion tracking**: All booking events measurable
- **Language usage**: DE/EN traffic and conversion rates
- **Section engagement**: Time spent on prototype/trust sections
- **Consent rates**: Percentage accepting external services

### Quality KPIs
- **Zero critical bugs** in production
- **Content accuracy** verified by native speakers
- **Legal compliance** ready for final review
- **User experience** validated through testing

---

*This plan represents 76 atomic, testable tasks organized into 7 phases. Each task has clear start/end criteria and focuses on one specific concern, enabling reliable implementation by an AI coding assistant with testing validation between tasks.*