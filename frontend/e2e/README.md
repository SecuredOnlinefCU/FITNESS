# Playwright E2E Coverage

## Test Coverage
- `/` — Home page: loads, key sections visible
- `/auth/login` — Login: form loads
- `/auth/signup` — Signup: form loads
- `/auth/forgot-password` — Forgot password: form loads
- `/auth/callback` — Auth callback: page loads

## Running E2E Tests

1. Start your frontend dev server (e.g., `pnpm dev` or `npm run dev`).
2. In another terminal, run:
   ```sh
   npx playwright test e2e/
   ```

## Manual Browser Navigation

To open the app in a browser for manual navigation:
1. Start your frontend dev server.
2. Open [http://localhost:3000](http://localhost:3000) in your browser.

You can also run Playwright in headed mode for visual debugging:
```sh
npx playwright test e2e/ --headed --debug
```

---

- All tests follow modern accessibility and UI/UX best practices.
- Expand tests as you add new routes or flows.
