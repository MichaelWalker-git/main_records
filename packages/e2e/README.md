# Maine RMS E2E Tests

Playwright-based smoke and regression tests against the running frontend.

## Setup

```bash
cd packages/e2e
npm install
npx playwright install chromium
```

## Running

```bash
# headless against local dev server (vite at :5173, default)
npm test

# headed (browser visible)
npm run test:headed

# interactive UI mode for debugging
npm run test:ui

# open the HTML report from the last run
npm run report

# against the deployed cloud environment
BASE_URL=http://maine--alb16-kxi3dpqk8uzt-480421270.us-east-1.elb.amazonaws.com npm test
```

## Prerequisites

- Frontend dev server running on `http://localhost:5173` (or set `BASE_URL`).
- Backend reachable at `/api` from the frontend (vite proxy handles this in dev).
- Demo seed must be applied (`packages/backend/migrations/005_demo_seed.ts`).

## Conventions

- Use `data-testid` selectors; avoid CSS class or text-content selectors when a
  testid exists.
- Login via the `adminPage` fixture in `fixtures/auth.ts` for tests that need an
  authenticated session.
- Group tests by feature area (one `*.spec.ts` per area).
- Avoid brittle waits — prefer `expect(...).toBeVisible()` with the configured
  timeout over `waitForTimeout`.
