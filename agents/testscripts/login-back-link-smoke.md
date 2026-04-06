# TS-LOGIN-BACK-LINK-SMOKE

## Objective
Verify the login page provides an accessible link back to landing (`/`) without changing login/signup behavior.

## Prerequisites
- Web app dependencies installed (`pnpm install` at repo root)
- Ability to run web app locally

## Steps
1. Run: `pnpm --filter web dev`
2. Open: `http://localhost:3000/login`
3. Confirm a visible **Back to landing** link appears at the top of the login card.
4. Keyboard test: press `Tab` until the back link is focused; confirm visible focus ring.
5. Activate back link with `Enter`.
6. Verify browser navigates to `http://localhost:3000/`.
7. Return to `/login` and verify existing sign-in/sign-up form interactions are unchanged.

## Expected Results
- Link is present, readable, and unobtrusive.
- Focus-visible state is clear.
- Navigation to `/` succeeds.
- Login/signup form still behaves as before.
