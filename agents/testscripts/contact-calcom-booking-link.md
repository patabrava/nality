# TS-CONTACT-CALCOM-BOOKING-POPUP

## Objective
Validate Contact module booking CTA opens an accessible popup and embeds Cal.com (`https://cal.com/nality`) via iframe.

## Prerequisites
- Run from repository root.

## Run Commands
1. `npm --prefix apps/web run lint -- --file "src/modules/contact/ContactPlaceholder.tsx"`

## Expected Observations
- Lint reports no errors for `ContactPlaceholder.tsx`.
- Contact booking CTA copy includes Cal.com and opens an in-page modal dialog.
- Modal has `role="dialog"`, `aria-modal="true"`, close button, and Escape key closes dialog.
- Modal iframe points to `https://cal.com/nality`.

## Manual Runtime Check
1. Start app: `npm --prefix apps/web run dev`.
2. Open contact page containing `ContactPlaceholder`.
3. Click **Jetzt einen Termin mit Cal.com buchen**.
4. Confirm popup appears with embedded Cal.com booking page.
5. Confirm popup closes via close button, backdrop click, and Escape key.

## Cleanup
- Stop the dev server.
