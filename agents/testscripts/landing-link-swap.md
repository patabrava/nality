# TS-LANDING-LINK-SWAP

## Objective
Validate landing page route swaps from `/login` <-> `/meeting` with no non-landing impact.

## Prerequisites
- Run from repository root.

## Run Commands
1. `rg -n "(/login|/meeting)" apps/web/src/components/landing`
2. `npm run lint -- --file "src/components/landing/FAQSection.tsx" --file "src/components/landing/OutcomesGallerySection.tsx" --file "src/components/landing/PricingSection.tsx" --file "src/components/landing/FinalCTASection.tsx" --file "src/components/landing/HeroSection.tsx" --file "src/components/landing/LandingHeader.tsx"`

## Expected Observations
- Landing components show swapped destinations only:
  - CTA/login links now target `/meeting`.
  - Header login links now target `/login`.
- Lint command reports no errors for changed landing components.

## Manual Runtime Check
1. Start app: `npm run dev`.
2. Open `/` and verify all landing CTAs previously routing to `/login` now open `/meeting`.
3. Verify header "login" links now open `/login`.

## Cleanup
- Stop the dev server.
