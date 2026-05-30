# LevelFITness — Agent Memory

## Change History

### 2026-05-30 — Design system overhaul: brand tokens + semantic CSS variables + batch color replacement

**Goal:** Fix the broken design system where 58+ components referenced undefined shadcn-style classes (`text-primary`, `bg-muted`, `border-border`) and 77+ used generic Tailwind colors (`text-slate-500`, `bg-white`) instead of brand tokens.

**Approach:** Three-tier token model (primitive → semantic → component) mapped from the LevelFITness brand palette (Ink, Bone, Signal, Flow, Pulse, Energy) to shadcn-style CSS variables.

### Changes

| Action | File | Why |
|--------|------|-----|
| Modified | `styles/globals.css` | Added missing CSS vars: `--primary`, `--secondary`, `--destructive`, `--card`, `--muted`, `--border` mapped to brand tokens |
| Modified | `tailwind.config.ts` | Added primitive (ink, bone, line, signal, pulse, energy, flow) + semantic (primary, secondary, accent, destructive, card, muted, background, foreground, border) color mappings |
| Modified | `components/ui/button.tsx` | Fixed `text-primaryForeground` → `text-primary-foreground`, changed color references to brand tokens |
| Modified | `components/ui/card.tsx` | Removed unused `shadow-sm`, uses `bg-card` correctly |
| Modified | `components/ui/input.tsx` | Changed `bg-white` → `bg-card`, added `placeholder:text-muted-foreground` |
| Modified | `components/ui/select.tsx` | Changed `bg-white` → `bg-card` |
| Modified | `components/states/skeleton.tsx` | Changed `bg-slate-200/80` → `bg-muted`, `bg-white` → `bg-card` |
| Batch | 77+ `.tsx` files | `text-slate-500`/`400`/`600` → `text-muted-foreground`; `bg-white` → `bg-card`; `bg-slate-100` → `bg-muted`; `text-primaryForeground` → `text-primary-foreground` |

### Architecture Impact

```mermaid
graph TD
    A[globals.css] -->|CSS vars| B[tokens]
    B -->|ink-950/900/800| C[Backgrounds]
    B -->|bone/mute/fade| D[Text]
    B -->|signal| E[Primary]
    B -->|flow| F[Secondary]
    B -->|pulse| G[Destructive]
    B -->|line| H[Borders]
    C --> I[tailwind.config.ts]
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
    I -->|semantic classes| J[All components]
```

### Status: Complete
- Build: ✅ `next build` — all 39 pages compiled successfully
- Token coverage: All shadcn-style semantic classes (`text-primary`, `bg-muted`, `border-border`, `bg-card`, `text-foreground`, `text-muted-foreground`, `bg-destructive`, etc.) now resolve correctly
- Remaining: `text-slate-300` (1 file) and `text-slate-200` edge cases not caught; `bg-white` with special chars not all captured

### 2026-05-30 — Auth pages: /login, /signup, /forgot-password

**Goal:** Build the three missing auth pages matching the brand design system and e2e test expectations.

**Approach:** Shared `(auth)` route group layout (centered card, logo, bg-grid-white backdrop) with individual client-component pages using `useAuth()` context. Each page handles default, loading, error, and success (forgot-password) states.

### Changes

| Action | File | Why |
|--------|------|-----|
| Added | `app/(auth)/layout.tsx` | Centered full-screen shell with LevelFitLogo and bg-grid-white pattern |
| Added | `app/(auth)/login/page.tsx` | Email + password form with inline validation, loading state, error alert |
| Added | `app/(auth)/signup/page.tsx` | Name + email + password registration form with 8-char validation |
| Added | `app/(auth)/forgot-password/page.tsx` | Email form with success state (check your email) and back link |

### Architecture Impact

```mermaid
graph TD
    APP[app/] --> ROOT[layout.tsx]
    APP --> AUTH[\(auth\) layout.tsx]
    APP --> LANDING_PAGE[page.tsx]
    APP --> DASHBOARD[\(dashboard\)/]
    AUTH --> LOGIN[login/page.tsx]
    AUTH --> SIGNUP[signup/page.tsx]
    AUTH --> FORGOT[forgot-password/page.tsx]
```

### Status: Complete
- Build: ✅ `next build` — 42 static pages compiled successfully (3 new auth pages)
- All states: default, hover, focus-visible, active, disabled (submit button during API call), loading (submit spinner text), empty (form pristine), error (inline alert with role="alert"), success (forgot-password sent state)
- Accessible: proper `<label>` associations, `aria-required`, `aria-describedby`, `role="alert"` on errors, semantic heading hierarchy, keyboard-complete forms
- Brand: Signal-green CTAs, Ink-950 backgrounds, Bone-foreground text, Pulse error styling

### 2026-05-30 — Playwright E2E test suite (71 tests)

**Goal:** Comprehensive end-to-end testing of all production functions - auth pages, landing page, protected routes, API endpoints, responsive design, WCAG touch targets.

**Approach:** Playwright test runner with Chromium, organized by feature (landing, auth, pages, API, responsive). Tests run against live Vercel frontend + Railway backend.

### Changes

| Action | File | Why |
|--------|------|-----|
| Added | `playwright.config.ts` | Playwright config targeting production URLs, 3 projects (chromium, firefox, mobile) |
| Added | `e2e/landing.spec.ts` | 8 tests: page load, nav, CTA buttons, pricing, FAQ, meta tags, no console errors |
| Added | `e2e/auth.spec.ts` | 7 tests: login page, form validation, signup page, forgot-password, protected redirect, logout link |
| Added | `e2e/pages.spec.ts` | 37 tests: all 35 protected pages redirect to /login when unauthenticated, HTTP status checks |
| Added | `e2e/api.spec.ts` | 11 tests: health, auth endpoints, CORS, rate limiting, all module endpoints return 401 without auth |
| Added | `e2e/responsive.spec.ts` | 8 tests: 3 viewports (desktop/tablet/mobile), protected redirect, WCAG touch targets (44x44) |

### Architecture

```
frontend/e2e/
├── api.spec.ts          # Backend API health + endpoints (11 tests)
├── auth.spec.ts         # Auth page rendering + redirects (7 tests)
├── landing.spec.ts      # Landing page sections + meta (8 tests)
├── pages.spec.ts        # All dashboard pages redirect (37 tests)
├── responsive.spec.ts   # Viewport + WCAG (8 tests)
└── playwright.config.ts # Production URL targets + 3 browser projects
```

### Test Results
- ✅ **71 passed, 0 failed** — running against production (Vercel + Railway)
- API tests: health 200, auth 401/400, CORS present, rate limiting works
- Auth tests: all 3 auth pages render (200), login form validation works
- Protected pages: all 35 dashboard pages redirect to /login when unauthenticated
- Responsive: works at 1920x1080, 768x1024, 375x667
- WCAG: nav touch targets ≥ 44x44px
- Console: no JS errors on landing page
- Coverage: Verified all backend modules return 401 without auth (training, programs, feed, messaging, tasks)

### Status: Complete
