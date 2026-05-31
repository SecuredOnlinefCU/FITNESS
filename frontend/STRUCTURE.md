# LevelFITness — Project Structure

```mermaid
graph TD
    ROOT[frontend/] --> APP[app/]
    ROOT --> COMPONENTS[components/]
    ROOT --> STYLES[styles/]
    ROOT --> LIBS[lib/]
    ROOT --> HOOKS[hooks/]
    ROOT --> TAILWIND[tailwind.config.ts]
    ROOT --> CONFIG[package.json]

    APP --> ROUTES[page.tsx + layout.tsx]
    APP --> LOADING[loading.tsx]
    APP --> ERROR[error.tsx]
    APP --> NOTFOUND[not-found.tsx]
    APP --> LANDING[landing/]
    APP --> AUTH[\(auth\)/]
    APP --> DASHBOARD[\(dashboard\)/]

    DASHBOARD --> ADMIN[admin/]
    DASHBOARD --> CLIENT[client/]
    DASHBOARD --> COACH[coach/]
    DASHBOARD --> MSG[messages/]

    COMPONENTS --> UI[ui/]
    COMPONENTS --> LAYOUT[layout/]
    COMPONENTS --> LANDING_C[landing/]
    COMPONENTS --> 3D[3d/]
    COMPONENTS --> LEVELFIT[levelfitness/]
    COMPONENTS --> STATES[states/]
    COMPONENTS --> CLIENT_C[client/]
    COMPONENTS --> COACH_C[coach/]
    COMPONENTS --> INTEL[intelligence/]
    COMPONENTS --> RECOVERY[recovery/]
    COMPONENTS --> HABITS[habits/]
    COMPONENTS --> WEARABLES[wearables/]
    COMPONENTS --> BILLING[billing/]
    COMPONENTS --> MESSAGING[messaging/]
    COMPONENTS --> NOTIFICATIONS[notifications/]
    COMPONENTS --> AUTH_C[auth/]
    COMPONENTS --> DASHBOARD_C[dashboard/]

    STYLES --> GLOBALS[globals.css]
```

## Directory Layout

```
frontend/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Landing page (assembles all sections)
│   ├── layout.tsx              # Root layout with AuthProvider
│   ├── loading.tsx             # Route-level loading spinner
│   ├── error.tsx               # Route-level error boundary
│   ├── not-found.tsx           # Custom 404 page
│   ├── (auth)/                 # Auth pages (login, signup, forgot-password)
│   │   ├── layout.tsx          # Shared auth layout (centered card + logo)
│   │   ├── login/page.tsx      # Email + password sign-in form
│   │   ├── signup/page.tsx     # Name + email + password registration
│   │   └── forgot-password/    # Email form + success state
│   │       └── page.tsx
│   └── (dashboard)/            # Dashboard pages
│       ├── admin/              # Admin pages (6 routes)
│       ├── client/             # Client pages (11 routes)
│       ├── coach/              # Coach pages (16 routes)
│       └── dashboard/          # Messages route
├── components/
│   ├── ui/                     # Core primitives (Button, Card, Input, Select)
│   ├── layout/                 # DashboardShell, SmoothScroll
│   ├── landing/                # Landing sections (Navbar, Hero, Stats, Features, etc.)
│   ├── 3d/                     # R3F hologram (HologramCanvas, HologramScene)
│   ├── levelfitness/           # Brand (Logo, BrandMark, ClientPageHeader)
│   ├── states/                 # Skeleton, EmptyState, ErrorState, DataSection
│   ├── client/                 # Client dashboard components
│   ├── coach/                  # Coach dashboard components
│   ├── intelligence/           # TodayScoreCard, NextBestActionList
│   ├── habits/                 # HabitLoopCard
│   ├── recovery/               # RecoverySummaryCard
│   ├── wearables/              # WearableConnectionStatus, RecoverySignalCard
│   ├── billing/                # Billing components
│   ├── messaging/              # ThreadList, realtime chat components
│   ├── notifications/          # NotificationBell
│   └── auth/                   # AuthProvider, ProtectedRoute
├── styles/
│   └── globals.css             # Brand CSS vars, utility classes, fonts
├── lib/                        # API modules, brand constants
├── hooks/                      # Custom React hooks (messaging, etc.)
├── public/
│   └── logos/                  # levelFit SVG logo assets (6 variants)
├── tailwind.config.ts          # Brand + semantic color tokens
└── package.json
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
| signal | `#d7ff2f` | Primary accent (CTAs, actions) |
| flow | `#38bdf8` | Info/progress accent |
| energy | `#f97316` | Warm data viz accent |
| pulse | `#ef4444` | Danger/critical |
| line | `#20241d` | Borders and dividers |

### Semantic CSS Variables (shadcn-style)
| Variable | Maps to | Component class usage |
|----------|---------|----------------------|
| `--background` | ink-950 | `bg-background` |
| `--foreground` | bone | `text-foreground` |
| `--card` | ink-900 | `bg-card` |
| `--primary` | signal | `bg-primary`, `text-primary` |
| `--primary-foreground` | ink-950 | `text-primary-foreground` |
| `--muted` | ink-800 | `bg-muted` |
| `--muted-foreground` | bone-fade | `text-muted-foreground` |
| `--border` | line | `border-border` |
| `--destructive` | pulse | `bg-destructive`, `text-destructive` |
