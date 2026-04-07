## Script Identifier
- `TS-LOGIN-ASSET-REDIRECT-GUARD-001`

## Objective
- Verify login redirects never target Next internal asset paths and that root layout CSS stays reachable during auth flows.

## Prerequisites
- `pnpm install`
- Web app env configured.

## Setup
1. Start app: `pnpm --filter web dev`
2. Open `http://localhost:3000/login?mode=signup`.

## Run Steps
1. Load `http://localhost:3000/login?redirectTo=/_next/static/css/app/layout.css`.
2. Complete a valid sign-in flow.
3. Confirm post-login navigation lands on `/dash` (or onboarding route), never on `/_next/*`.
4. In dev terminal, confirm no repeated `GET /_next/static/css/app/layout.css ... 404` loop.

## Expected
- Redirect parameter to internal asset paths is ignored.
- App remains usable after registration/login transitions.
- Styles are present and no layout.css 404 loop occurs.

## Cleanup
- Stop dev server.
