# TS-LANDING-MEETING-RUNTIME-SMOKE

## Objective
Verify landing (`/`) and meeting (`/meeting`) render successfully after route work and no blank-page regression is present.

## Prerequisites
- Run from `apps/web`.

## Run Commands
1. `pnpm build`
2. `pnpm dev --port 3011`
3. `curl -I http://127.0.0.1:3011/`
4. `curl -I http://127.0.0.1:3011/meeting`

## Expected Observations
- Build completes successfully.
- Both curl checks return `HTTP/1.1 200 OK`.
- Dev server logs include successful `GET /` and `GET /meeting`.

## Cleanup
- Stop dev server (`Ctrl+C`).
