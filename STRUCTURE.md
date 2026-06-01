# LevelFITness — Project Structure

```mermaid
graph TD
    ROOT[fitness app/] --> FRONTEND[frontend/]
    ROOT --> BACKEND[backend/]
    ROOT --> ARCHIVE[archive/]
    ROOT --> DOCS[docs/]

    FRONTEND --> FAPP[app/]
    FRONTEND --> FCOMP[components/]
    FRONTEND --> FSTYLES[styles/]
    FRONTEND --> FLIB[lib/]
    FRONTEND --> FHOOKS[hooks/]
    FRONTEND --> FCONFIG[package.json]

    FAPP --> FROUTES[page.tsx + layout.tsx]
    FAPP --> FLOADING[loading.tsx]
    FAPP --> FERROR[error.tsx]
    FAPP --> FNOTFOUND[not-found.tsx]
    FAPP --> LANDING[landing/]
    FAPP --> AUTH[(auth)/]
    FAPP --> DASHBOARD[(dashboard)/]

    DASHBOARD --> ADMIN[admin/]
    DASHBOARD --> CLIENT[client/]
    DASHBOARD --> COACH[coach/]
    DASHBOARD --> MSG[dashboard/messages/]

    FCOMP --> UI[ui/]
    FCOMP --> LAYOUT_C[layout/]
    FCOMP --> LANDING_C[landing/]
    FCOMP --> 3D[3d/]
    FCOMP --> LEVELFIT[levelfitness/]
    FCOMP --> STATES[states/]
    FCOMP --> CLIENT_C[client/]
    FCOMP --> COACH_C[coach/]
    FCOMP --> INTEL[intelligence/]
    FCOMP --> RECOVERY_C[recovery/]
    FCOMP --> HABITS_C[habits/]
    FCOMP --> WEARABLES_C[wearables/]
    FCOMP --> BILLING_C[billing/]
    FCOMP --> MESSAGING_C[messaging/]
    FCOMP --> NOTIFICATIONS_C[notifications/]
    FCOMP --> AUTH_C[auth/]
    FCOMP --> METRICS_C[metrics/]
    FCOMP --> WORKOUT_C[workout/]
    FCOMP --> EXERCISE_C[exercise/]
    FCOMP --> FEED_C[feed/]
    FCOMP --> ONBOARDING_C[onboarding/]
    FCOMP --> PROGRESS_C[progress/]
    FCOMP --> NUTRITION_C[nutrition/]
    FCOMP --> DASHBOARD_C[dashboard/]
    FCOMP --> ADMIN_C[admin/]

    BACKEND --> BPRISMA[prisma/]
    BACKEND --> BSRC[src/]
    BACKEND --> BTC[tsconfig.json]

    BSRC --> BMODULES[modules/]
    BSRC --> BCOMMON[common/]
    BSRC --> BLIB[lib/]

    BMODULES --> AUTH_M[auth/]
    BMODULES --> TRAINING_M[training/]
    BMODULES --> PROGRAMS_M[programs/]
    BMODULES --> PROGRESS_M[progress/]
    BMODULES --> NUTRITION_M[nutrition/]
    BMODULES --> RECOVERY_M[recovery/]
    BMODULES --> WEARABLES_M[wearables/]
    BMODULES --> CLIENTS_M[clients/]
    BMODULES --> INTEL_M[intelligence/]
    BMODULES --> COACH_INTEL_M[coach-intelligence/]
    BMODULES --> MESSAGING_M[messaging/]
    BMODULES --> FEED_M[feed/]
    BMODULES --> TASKS_M[tasks/]
    BMODULES --> HABITS_M[habits/]
    BMODULES --> CHECKINS_M[checkins/]
    BMODULES --> PAYMENTS_M[payments/]
    BMODULES --> NOTIFICATIONS_M[notifications/]
    BMODULES --> MEDIA_M[media/]
    BMODULES --> ONBOARDING_M[onboarding/]
    BMODULES --> INTEGRATIONS_M[integrations/]
    BMODULES --> ADMIN_M[admin/]
    BMODULES --> EMAIL_M[email/]
```

## Directory Layout

```
fitness app/
├── frontend/                        # Next.js 15 + React 19 + Tailwind CSS
│   ├── app/                         # App Router pages (44 pages)
│   │   ├── page.tsx                 # Landing page
│   │   ├── layout.tsx               # Root layout with AuthProvider
│   │   ├── loading.tsx              # Route-level loading spinner
│   │   ├── error.tsx                # Route-level error boundary
│   │   ├── not-found.tsx            # Custom 404 page
│   │   ├── terms/page.tsx           # Terms of Service
│   │   ├── privacy/page.tsx         # Privacy Policy
│   │   ├── (auth)/                  # Auth pages
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   └── (dashboard)/             # Dashboard pages
│   │       ├── admin/               # 7 routes
│   │       ├── client/              # 12 routes
│   │       ├── coach/               # 18 routes
│   │       └── dashboard/           # Messages routes
│   ├── components/                  # 71+ components
│   │   ├── ui/                      # Button, Card, Input, Select
│   │   ├── layout/                  # DashboardShell, SmoothScroll
│   │   ├── landing/                 # Navbar, Hero, Stats, Features, Pricing, etc.
│   │   ├── 3d/                      # R3F Hologram
│   │   ├── levelfitness/            # Logo, BrandMark, ClientPageHeader
│   │   ├── states/                  # Skeleton, EmptyState, ErrorState, DataSection
│   │   ├── client/                  # Client dashboard components
│   │   ├── coach/                   # Coach dashboard components
│   │   ├── intelligence/            # TodayScoreCard, NextBestActionList
│   │   ├── recovery/                # RecoverySummaryCard
│   │   ├── habits/                  # HabitLoopCard
│   │   ├── wearables/               # WearableConnectionStatus, RecoverySignalCard
│   │   ├── billing/                 # Billing components
│   │   ├── messaging/               # ThreadList, realtime chat
│   │   ├── notifications/           # NotificationBell
│   │   ├── auth/                    # AuthProvider, ProtectedRoute
│   │   ├── metrics/                 # MetricSparkline, MetricCard, MetricsDashboard
│   │   ├── workout/                 # TrainingCalendar, CalendarWorkoutCard
│   │   ├── exercise/                # VideoPlayerModal, CreateExerciseDialog
│   │   ├── feed/                    # PostCard, CommentSection, etc.
│   │   ├── onboarding/              # OnboardingWizard
│   │   ├── progress/                # ProgressPhotoCompare
│   │   ├── nutrition/               # NutritionPlanList, etc.
│   │   ├── dashboard/               # DashboardSidebar
│   │   └── admin/                   # AdminDashboardLive, etc.
│   ├── styles/globals.css           # Brand CSS vars, utility classes, fonts
│   ├── lib/                         # API modules, brand constants, types
│   ├── hooks/                       # Custom React hooks
│   ├── public/                      # Logos, images
│   ├── tailwind.config.ts           # Brand + semantic color tokens
│   ├── playwright.config.ts         # E2E test config
│   └── package.json                 # Dependencies
├── backend/                         # Express.js + TypeScript + Prisma
│   ├── prisma/
│   │   ├── schema.prisma            # 50+ models, 15 enums
│   │   └── migrations/              # Database migrations
│   └── src/
│       ├── modules/                 # 19 feature modules
│       │   ├── auth/                # JWT auth, tokens, routes
│       │   ├── training/            # Exercises, workouts, assignments, sessions
│       │   ├── programs/            # Programs, weeks, memberships
│       │   ├── progress/            # Metrics, photos, check-ins
│       │   ├── nutrition/           # Plans, meals, hydration, recipes
│       │   ├── recovery/            # Daily recovery metrics, readiness
│       │   ├── wearables/           # Wearable connections, sync
│       │   ├── clients/             # Dossier, momentum, plateau, churn, actions
│       │   ├── intelligence/        # Today snapshot, recommendations
│       │   ├── coach-intelligence/  # Health scores, risk signals, attention queue
│       │   ├── messaging/           # Threads, messages
│       │   ├── feed/                # Posts, comments, reactions
│       │   ├── tasks/               # Tasks, assignments, submissions
│       │   ├── habits/              # Habit definitions, logs
│       │   ├── checkins/            # Check-in forms, submissions
│       │   ├── payments/            # Packages, checkout, subscriptions
│       │   ├── notifications/       # Notifications, templates
│       │   ├── media/               # Media assets, uploads
│       │   ├── onboarding/          # Assessment, plan generation
│       │   ├── integrations/        # Third-party integrations
│       │   ├── admin/               # Admin dashboard
│       │   └── email/               # Email service
│       ├── common/                  # Middleware, errors, utils
│       └── lib/                     # Prisma client, env config, storage, Power Automate
├── archive/                         # Historical files, debug logs
├── docs/                            # Documentation
│   ├── levelfit-product-design.md   # Complete product design document
│   └── power-automate-flows.md      # Power Automate flow specifications
├── .github/workflows/               # CI/CD
│   ├── ci.yml
│   └── datadog-synthetics.yml
├── package.json                     # Monorepo root
├── pnpm-workspace.yaml              # Workspace config
├── railway.json                     # Railway deployment
└── .env.example                     # Environment variables
```

## Design System

### Color Tokens
| Token | Hex | Usage |
|-------|-----|-------|
| ink-950 | `#05060a` | Deepest background |
| ink-900 | `#080a07` | Card surfaces |
| ink-800 | `#11140f` | Muted/secondary bg |
| bone | `#f4f5ef` | Primary text |
| bone-mute | `#b7bba8` | Secondary text |
| bone-fade | `#8a907c` | Tertiary text/icons |
| signal | `#d7ff2f` | Primary accent (CTAs) |
| flow | `#38bdf8` | Info/progress accent |
| energy | `#f97316` | Warm data viz |
| pulse | `#ef4444` | Danger/critical |
| line | `#20241d` | Borders |

### Semantic CSS Variables
| Variable | Maps to | Component class |
|----------|---------|-----------------|
| `--background` | ink-950 | `bg-background` |
| `--foreground` | bone | `text-foreground` |
| `--card` | ink-900 | `bg-card` |
| `--primary` | signal | `bg-primary`, `text-primary` |
| `--primary-foreground` | ink-950 | `text-primary-foreground` |
| `--muted` | ink-800 | `bg-muted` |
| `--muted-foreground` | bone-fade | `text-muted-foreground` |
| `--border` | line | `border-border` |
| `--destructive` | pulse | `bg-destructive`, `text-destructive` |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS, Framer Motion, Lenis |
| UI | shadcn/ui primitives, Lucide icons, React Three Fiber |
| Backend | Express.js, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT + Entra ID (Microsoft SSO - planned Phase 2) |
| Email | Power Automate flows (primary, via HTTP webhook); Microsoft Graph API (fallback, OAuth 2.0) |
| Identity Provider | Entra ID (Azure AD) - `LevelFITness API` app registration |
| Storage | Railway S3-compatible buckets (feed/progress photos); SharePoint (exercise demo videos via Graph API) |
| Automation | Power Automate flows (welcome, invite, password reset, payment receipts, scheduled reminders) |
| Analytics | Power BI (planned Phase 5) |
| Deployment | Vercel (frontend), Railway (backend + DB + env vars) |
| Testing | Playwright E2E (71 tests) |
| CI | GitHub Actions |

### Microsoft Platform Integration

```mermaid
graph LR
    subgraph Railway
        FE[Next.js Frontend] --> BE[Express API]
        BE --> PG[(PostgreSQL)]
        BE --> S3[(S3 Buckets)]
    end
    subgraph "Microsoft 365 (Enterprise)"
        BE -->|POST /welcome| PA[Power Automate Flows]
        BE -->|POST /invite| PA
        BE -->|POST /reset| PA
        PA -->|Office 365 connector| EXO[Exchange Online]
        FE -->|POST /upload-sharepoint| BE
        BE -->|PUT /sites/{id}/drive/root| SPO[SharePoint ExerciseVideos]
        AAD[Entra ID] -->|app-only token| GRAPH[Microsoft Graph]
        GRAPH --> EXO
        GRAPH --> SPO
        EXO -->|noreply@levelfitcoach.com| MAIL[Transactional Email]
    end
    subgraph "Platform Roadmap"
        SSO[Entra ID SSO - Phase 2]
        PBI[Power BI - Phase 5]
    end
```

## Build Status

| Check | Status |
|-------|--------|
| Frontend build | ✅ 51 pages, 0 errors |
| Frontend type-check | ✅ 0 errors |
| Backend type-check | ✅ 0 errors (strict mode) |
| E2E tests | ✅ 71/71 pass |
| API endpoints | ✅ 49/49 verified |
