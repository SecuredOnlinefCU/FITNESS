# LevelFit — Complete Product Design Document

> **Version:** 1.0 — June 2026  
> **Status:** Production-grade architecture  
> **Competitive Targets:** Nike Training Club, MyFitnessPal, Trainerize, Everfit, Future

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Core Features Breakdown](#2-core-features-breakdown)
3. [User Experience Flow](#3-user-experience-flow)
4. [Client Dossier System](#4-client-dossier-system)
5. [Progress Intelligence System](#5-progress-intelligence-system)
6. [UX/UI Structure](#6-uxui-structure)
7. [Differentiation Strategy](#7-differentiation-strategy)
8. [Monetization Plan](#8-monetization-plan)
9. [Technical Architecture](#9-technical-architecture)
10. [Self-Critique & Improvements](#10-self-critique--improvements)

---

## 1. Product Overview

### 1.1 What LevelFit Is

LevelFit is a **coach-first intelligent fitness platform** that bridges the gap between premium coaching (like Future at $150/mo) and self-guided apps (like Nike Training Club, free). It gives coaches enterprise-grade client intelligence tools while giving clients a premium, motivating daily experience.

### 1.2 Core Philosophy

**"The coach is the product. The intelligence is the moat."**

Most fitness apps either:
- Give users workouts but no intelligence (Nike Training Club)
- Give users tracking but no coaching (MyFitnessPal)
- Give coaches tools but bad UX (Trainerize, Everfit)

LevelFit does all three at a premium level:
- **Clients** get a premium daily experience with AI-powered recommendations
- **Coaches** get enterprise-grade client intelligence (momentum scoring, churn prediction, plateau detection, overtraining risk)
- **The system** gets smarter over time as it learns client patterns

### 1.3 Four Pillars

| Pillar | What It Does | Why It Wins |
|--------|-------------|-------------|
| **Smart Onboarding** | Deep personalization via adaptive questioning + fitness blueprint generation | Competitors ask 3-5 questions. LevelFit builds a complete training profile in 2 minutes. |
| **Workout System** | Periodized, adaptive programs with real-time performance feedback | Not just "here's a workout" — the system adapts volume/intensity based on logged RPE, recovery, and plateaus. |
| **Client Dossier** | Enterprise-grade coach intelligence: momentum scoring, churn prediction, risk alerts, next-best-action | No competitor has this. Coaches see exactly who needs attention and why. |
| **Progress Intelligence** | Turns raw data into actionable insights: plateau detection, overtraining risk, strength progression | Moves beyond "here's your weight chart" to "here's what your data means and what to do about it." |

### 1.4 How the Pillars Connect

```
Smart Onboarding → generates Fitness Blueprint → seeds Workout System
         ↓                                              ↓
    Client Profile                              Workout Sessions
         ↓                                              ↓
    Daily Behavior ←←←←←← Progress Intelligence ←←←← Set Logs
         ↓                                              ↓
    Momentum Score →→→ Coach Dossier →→→ Risk Alerts + Next Best Action
```

The system is a **closed loop**: onboarding seeds the profile, workouts generate data, intelligence analyzes the data, coaches act on insights, and the next workout adapts.

---

## 2. Core Features Breakdown

### 2.1 Smart Onboarding

#### Current State (What Exists)
- Basic `/assessment` endpoint collects: goal, level, equipment, daysPerWeek, limitations
- `/generate-plan` creates a 4-week program with periodization (Accumulation → Intensification → Deload)
- Muscle group splitting by days (3/4/5/6 day PPL/Full Body)
- Equipment filtering, volume presets, level multipliers

#### What's Missing (What We're Building)
The current onboarding is a single API call. A world-class onboarding must be a **multi-step adaptive experience** that:

1. **Feels fast** — each screen is one decision, progress bar visible
2. **Builds a deep profile** — not just goal/level, but movement history, injury patterns, lifestyle constraints, psychological profile
3. **Uses intelligent logic** — answers branch the flow (injury → skip certain movements, advanced → skip beginner tutorials)
4. **Generates a "Fitness Blueprint"** — a personalized training identity, not just a program

#### Onboarding Flow Design

**Step 1: Goal Selection (Visual, not text)**
- 6 goal cards with premium illustrations:
  - Build Muscle (hypertrophy focus)
  - Get Stronger (strength focus)
  - Lose Fat (fat loss focus)
  - Improve Endurance (cardio focus)
  - General Fitness (balanced)
  - Athletic Performance (sport-specific)
- Smart classification: maps to training style + periodization model

**Step 2: Fitness Level Detection (Not just asking)**
Instead of "Are you beginner/intermediate/advanced?", ask **calibrated questions**:
- "How many push-ups can you do in one set?" → maps to upper body strength
- "How long can you hold a plank?" → maps to core endurance
- "How many bodyweight squats in 60 seconds?" → maps to lower body power
- "How many days per week have you trained in the last month?" → consistency level

Backend logic:
```
pushups ≥ 30 + plank ≥ 120s + squats ≥ 25 = ADVANCED
pushups ≥ 15 + plank ≥ 60s + squats ≥ 15 = INTERMEDIATE
else = BEGINNER
```

**Step 3: Equipment Availability**
- Visual grid of equipment with toggle:
  - Full Gym (everything)
  - Home Gym (dumbbells, barbell, bench)
  - Minimal (dumbbells + bands only)
  - Bodyweight Only (no equipment)
- Each card shows what's included

**Step 4: Time & Schedule**
- "How many days per week can you train?" (3/4/5/6)
- "How long per session?" (30min/45min/60min/75min/90min)
- Visual weekly calendar showing when you prefer to train

**Step 5: Injury & Limitation Profile**
- Body map (clickable regions) to mark:
  - Current injuries (red)
  - Past injuries (yellow)
  - Chronic limitations (orange)
- Each selection triggers smart exercise exclusion

**Step 6: Lifestyle & Recovery**
- Sleep hours (slider)
- Stress level (1-5 scale)
- Activity level outside gym (sedentary/light/moderate/heavy)
- Water intake goal

**Step 7: Fitness Blueprint Generation**
The onboarding culminates in a **Fitness Blueprint** — a personalized training identity:

```json
{
  "goal": "muscle_gain",
  "trainingStyle": "hypertrophy",
  "level": "intermediate",
  "levelConfidence": 0.82,
  "equipment": "home",
  "daysPerWeek": 4,
  "sessionLength": 60,
  "split": "Upper/Lower/Push/Pull",
  "injuryExclusions": ["overhead press", "behind-neck pulldown"],
  "weeklyVolume": {
    "chest": 18,
    "back": 16,
    "legs": 20,
    "shoulders": 12,
    "arms": 14
  },
  "periodization": "4-week accumulation → intensification → deload",
  "recoveryProfile": {
    "sleepQuality": "moderate",
    "stressLevel": 3,
    "recommendation": "Prioritize recovery protocols, limit sessions to 50min"
  },
  "estimatedTimeline": "12-16 weeks to visible progress"
}
```

#### Backend Changes Required

New model: `FitnessBlueprint`
```prisma
model FitnessBlueprint {
  id                String   @id @default(uuid())
  userId            String   @unique
  goal              String
  trainingStyle     String
  level             String
  levelConfidence   Float
  equipment         String
  daysPerWeek       Int
  sessionLength     Int
  split             String
  injuryExclusions  Json     @default("[]")
  weeklyVolume      Json     @default("{}")
  periodization     String
  recoveryProfile   Json     @default("{}")
  estimatedTimeline String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

New endpoint: `POST /api/onboarding/blueprint` — accepts answers, computes blueprint, stores it, and returns it.

### 2.2 Workout System

#### Current State
- Exercise library with muscle groups, equipment, demo video, coach cues
- Workout builder (exercise selection, sets/reps/rest/RPE/tempo prescription)
- Superset grouping via `supersetGroupId`
- Set types: warmup, working, drop, failure
- Program structure: Program → ProgramWeek → Workout → WorkoutExercise → SetLog
- Periodization: 4-week blocks with Accumulation/Intensification/Deload phases
- 1RM estimation via Epley formula
- Calendar-based assignment with date filtering
- Session logging with real-time set tracking

#### What's Missing (What We're Building)

**A. Adaptive Workouts (Auto-Regulation)**
Currently, prescriptions are static. The system should adapt based on:
- **Logged RPE vs prescribed RPE**: If client logs RPE 9 on prescribed RPE 7, next session reduces volume
- **Recovery readiness**: Low readiness → swap heavy compounds for accessory work
- **Performance trends**: If estimated 1RM is climbing, increase load recommendations
- **Missed sessions**: Reschedule automatically, don't just mark as missed

Implementation:
```
IF loggedRPE > prescribedRPE + 2:
  nextSession.volume = currentSession.volume * 0.85
  nextSession.note = "RPE was high — backing off today"
ELIF loggedRPE < prescribedRPE - 2 AND recovery.readiness > 70:
  nextSession.volume = currentSession.volume * 1.1
  nextSession.note = "Looking strong — pushing harder today"
```

**B. Workout Templates & Smart Substitution**
- Coaches create template workouts (not just one-off)
- Smart substitution: if equipment unavailable or injury flagged, suggest alternatives
- Exercise database with movement patterns (horizontal push, vertical pull, etc.) for substitution

**C. Real-Time Workout Mode**
The client workout session needs a premium in-session experience:
- **Rest timer** with countdown (configurable per exercise)
- **Set completion swipe** — swipe right to complete, left to skip
- **RPE quick-select** — 1-10 scale after each set
- **Fatigue meter** — visual indicator of session RPE trend
- **Superset grouping** — exercises grouped with visual indicators
- **Video playback** — inline demo videos from exercise library
- **Coach cues** — displayed as tooltips during exercise

**D. Progressive Overload Engine**
```
For each exercise in the program:
  1. Calculate current estimated 1RM from recent sessions
  2. Apply periodization multiplier (week 1: 0.7, week 2: 0.75, week 3: 0.8, week 4: 0.6)
  3. Adjust for recovery readiness (±10%)
  4. Generate prescription: weight = estimated1RM × periodizationMultiplier
  5. Adjust reps based on goal (strength: 3-5, hypertrophy: 8-12, fat loss: 12-15)
```

#### New Backend Endpoints

- `POST /api/training/adaptive-adjustment` — computes next-session adjustments based on logged performance
- `GET /api/training/exercises/substitutions?exerciseId=X` — returns movement-pattern alternatives
- `POST /api/training/templates` — CRUD for workout templates
- `GET /api/training/progression/:exerciseId` — returns estimated 1RM trend over time

### 2.3 Client/Coach System

#### Current State (What Exists)
- **Coach Dossier**: `getClientDossier()` returns user, health score, risk flags, assignments, sessions, metrics, notes, program memberships, momentum, plateaus, overtraining risk, churn risk, smart actions
- **Momentum Scoring**: 4-dimension composite (performance 35%, behavior 25%, engagement 25%, recovery 15%) with daily snapshots
- **Health Scores**: adherence, progress, engagement, payment scores
- **Risk Signals**: plateau detection, overtraining risk, churn prediction
- **Attention Queue**: prioritized list of clients needing attention
- **Action Engine**: next-best-action recommendations
- **Coach-Client Notes**: private notes per client
- **Messaging**: thread-based with real-time delivery

#### What's Missing (What We're Building)

**A. Enhanced Client Dossier UI**
The data exists but needs a premium UI:

**Client Dossier Page** (`/coach/clients/[clientId]`):
```
┌─────────────────────────────────────────────────────────┐
│  [Avatar] Sarah Chen                    Momentum: 82 ↑  │
│  Joined: Mar 2026 · Phase: Intensification              │
│  Current Program: Hypertrophy Phase 2                    │
├─────────────────────────────────────────────────────────┤
│  TABS: Overview | Progress | Workouts | Recovery | Notes │
├─────────────────────────────────────────────────────────┤
│  OVERVIEW TAB:                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Health   │ │ Momentum │ │ Adherence│ │ Churn    │  │
│  │ Score:88 │ │ Score:82 │ │ Score:95 │ │ Risk:Low │  │
│  │ ●●●●○    │ │ ↑ Rising │ │ 14/15    │ │          │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                          │
│  NEXT BEST ACTIONS:                                      │
│  1. 🔴 Overtraining risk — 7 sessions this week          │
│  2. 🟡 Plateau detected — Bench Press stagnant           │
│  3. 🟢 Check in — Missed Tuesday session                 │
│                                                          │
│  RECENT ACTIVITY:                                        │
│  Today: Completed Push Day (RPE 7.5)                     │
│  Yesterday: Rest day — logged 7h sleep                    │
│  Mon: Completed Pull Day (RPE 8.2)                       │
└─────────────────────────────────────────────────────────┘
```

**B. Client Health Dashboard**
Aggregate view of all clients with sortable columns:
- Client name
- Momentum score + trend arrow
- Adherence rate (%)
- Last active
- Risk level (LOW/MEDIUM/HIGH with color)
- Next action

**C. Behavior Insights Panel**
Shows behavioral patterns over time:
- Sleep consistency (% of nights with 7+ hours)
- Training consistency (% of scheduled sessions completed)
- Logging consistency (% of days with metrics logged)
- Communication responsiveness (avg response time to messages)
- Habit adherence (% of habits completed)

**D. Risk Alert System**
Real-time alerts with severity levels:
- **CRITICAL (Red)**: Overtraining risk + low readiness + 7+ sessions/week
- **HIGH (Orange)**: Plateau > 3 weeks, churn risk > 70%, missed 3+ consecutive days
- **MEDIUM (Yellow)**: Inconsistent logging, declining momentum trend
- **LOW (Green)**: Minor variations, routine monitoring

**E. Client Side: Daily Dashboard**
```
┌─────────────────────────────────────────────────────────┐
│  Good morning, Sarah 💪                                  │
│  Wednesday, June 4 · Streak: 12 days                    │
├─────────────────────────────────────────────────────────┤
│  TODAY'S FOCUS                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 🏋️ Push Day A — Chest, Shoulders, Triceps         │  │
│  │ 5 exercises · ~55 min · Start →                   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │ Habits   │ │ Recovery │ │ Metrics  │                │
│  │ 3/5 done │ │ 😴 7.2h  │ │ Log →    │                │
│  └──────────┘ └──────────┘ └──────────┘                │
│                                                          │
│  COACH UPDATE                                           │
│  "Great session yesterday! Today we're pushing harder   │
│   on bench — try for 3 reps at 185lb."                  │
│                                                          │
│  PROGRESS                                                │
│  Your bench 1RM estimate: 195lb (+5lb this week)        │
│  ████████████████████████░░░░ 78% to goal               │
└─────────────────────────────────────────────────────────┘
```

### 2.4 Progress Intelligence

#### Current State
- **Plateau Detection**: Compares estimated 1RM between recent (45d) and previous (45-90d) periods
- **Overtraining Risk**: Session count + readiness + RPE analysis
- **Momentum Score**: 4-dimension composite with daily snapshots
- **Today Intelligence**: Task, habit, and message recommendations
- **Health Scores**: Adherence, progress, engagement, payment

#### What's Missing (What We're Building)

**A. Strength Progression Tracker**
- Per-exercise estimated 1RM over time (already have Epley formula)
- Visualized as sparkline charts with trend lines
- Volume load tracking (sets × reps × weight) over time
- Relative intensity tracking (actual RPE / prescribed RPE)

**B. Body Transformation Tracker**
- Weight, body fat %, measurements over time
- Progress photo comparison (side-by-side with date overlay)
- Body composition trends

**C. Adherence Scoring**
- Workout completion rate (% of assigned workouts completed)
- Session consistency (days trained / days planned)
- Metric logging consistency (% of days with data)
- Habit completion rate

**D. Recommendations Engine**
```
INPUT: momentumScore, plateauStatus, overtrainingRisk, adherenceRate, recoveryReadiness
OUTPUT:
  - IF overtrainingRisk == HIGH → "Reduce volume by 20% this week, add rest day"
  - IF plateau && adherence > 80% → "Try deload week, then increase intensity"
  - IF momentum < 50 && adherence < 60% → "Schedule check-in, review goals"
  - IF recoveryReadiness < 40 → "Postpone heavy session, focus on mobility"
  - IF momentum > 80 && no plateaus → "Client is crushing it — consider progression"
```

**E. Alert System**
| Alert Type | Trigger | Severity | Action |
|------------|---------|----------|--------|
| Overtraining | 7+ sessions/week AND readiness < 40 | CRITICAL | Reduce volume, add rest |
| Plateau | No 1RM improvement in 3+ weeks | HIGH | Deload + intensity change |
| Churn Risk | Declining adherence + engagement | HIGH | Check-in call |
| Missed Check-in | 2+ days past expected check-in | MEDIUM | Send reminder |
| Recovery Drop | Readiness < 30 for 2+ days | MEDIUM | Review sleep/stress |
| Logging Gap | 3+ days without metrics | LOW | Prompt logging |

---

## 3. User Experience Flow

### 3.1 Client Journey

```
SIGNUP → ONBOARDING (7 steps) → BLUEPRINT GENERATED
    ↓
HOME DASHBOARD (today's focus + habits + recovery + coach message)
    ↓
WORKOUT (start session → real-time logging → complete → RPE feedback)
    ↓
PROGRESS (metrics + photos + 1RM tracker + body composition)
    ↓
NUTRITION (meal plan + logging + hydration)
    ↓
RECOVERY (sleep + HRV + readiness)
    ↓
FEED (coach posts + community)
    ↓
MESSAGES (coach communication)
    ↓
DAILY CYCLE: Wake → Check readiness → See today's plan → Train → Log → Recover
```

### 3.2 Coach Journey

```
LOGIN → COMMAND CENTER (attention queue + risk alerts + client health grid)
    ↓
CLIENT DOSSIER (individual intelligence dashboard)
    ↓
WORKOUT BUILDER (create/assign workouts + programs)
    ↓
PROGRAM MANAGEMENT (periodized programs with weeks)
    ↓
PROGRESS REVIEW (client metrics + photos + check-ins)
    ↓
NUTRITION (meal plans + macro goals)
    ↓
MESSAGES (client communication)
    ↓
TASKS (assign + review submissions)
    ↓
DAILY CYCLE: Review attention queue → Act on risk alerts → Build workouts → Review submissions
```

### 3.3 Navigation Structure

**Client Sidebar:**
1. Home (Today's dashboard)
2. Workouts (calendar + list view)
3. Program (current program details)
4. Progress (metrics + photos + 1RM)
5. Nutrition (meal plan + logging)
6. Recovery (sleep + HRV + readiness)
7. Feed (coach posts)
8. Tasks (assigned tasks)
9. Messages
10. Billing
11. Notifications
12. Settings

**Coach Sidebar:**
1. Command Center (attention queue + risk alerts)
2. Client Dossiers (list + individual)
3. Client Health (aggregate health grid)
4. Risk Signals (full risk scan)
5. Intelligence (momentum + recommendations)
6. Workouts (builder + calendar + review)
7. Programs (create + manage)
8. Tasks (create + assign + review)
9. Progress (client metrics + photos)
10. Nutrition (plans + recipes)
11. Feed (create posts)
12. Packages (billing)
13. Messages
14. Settings

---

## 4. Client Dossier System

### 4.1 Architecture

The dossier is a **read-heavy, write-light** system. It aggregates data from multiple sources into a single client view.

**Data Sources → Dossier:**
```
User + Profile → basic info, join date, current phase
Health Score → adherence, progress, engagement, payment
Momentum Score → composite + 4 dimensions
Risk Flags → open alerts with severity
Plateau Detector → exercise-level stagnation
Overtraining Risk → session load vs readiness
Churn Predictor → probability of dropout
Smart Actions → next-best-action recommendations
Workout Assignments → scheduled workouts
Workout Sessions → completed sessions with set logs
Metrics → body measurements, weight, body fat
Notes → coach's private notes
Program Memberships → active programs
```

### 4.2 Coach-Side: Dossier Page

**Route:** `/coach/clients/[clientId]`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  HEADER: Avatar + Name + Momentum Score + Trend         │
│  Quick actions: Message | Assign Workout | Add Note      │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  LEFT    │  MAIN CONTENT (tabbed)                       │
│  PANEL   │                                              │
│          │  Tab: Overview                               │
│  Stats   │    → Health Score Card                       │
│  Grid    │    → Momentum Breakdown (4 gauges)           │
│          │    → Next Best Actions (prioritized list)    │
│  Health  │    → Recent Activity Timeline                │
│  Score   │                                              │
│          │  Tab: Progress                               │
│  Momentum│    → Metrics Dashboard (sparklines)          │
│  Score   │    → Progress Photos (grid + compare)        │
│          │    → 1RM Tracker (per exercise)              │
│  Adhere. │    → Body Composition Trends                 │
│  Score   │                                              │
│          │  Tab: Workouts                               │
│  Risk    │    → Training Calendar (assigned workouts)   │
│  Level   │    → Session History (completed sessions)    │
│          │    → Performance per Exercise                 │
│  Churn   │                                              │
│  Risk    │  Tab: Recovery                               │
│          │    → Sleep Trends (sparkline)                 │
│          │    → HRV Trends (sparkline)                   │
│          │    → Readiness Gauge                          │
│          │                                              │
│          │  Tab: Notes                                  │
│          │    → Coach Notes (add + list)                 │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### 4.3 Coach-Side: Health Grid

**Route:** `/coach/client-health`

Shows all clients in a sortable, filterable grid:

| Client | Momentum | Trend | Adherence | Last Active | Risk | Action |
|--------|----------|-------|-----------|-------------|------|--------|
| Sarah Chen | 82 | ↑ | 95% | Today | Low | View |
| Mike Johnson | 45 | ↓ | 60% | 3 days ago | High | ⚠️ Alert |
| Emma Wilson | 71 | → | 85% | Yesterday | Medium | View |

**Filters:** Risk level, momentum range, adherence %, last active date
**Sort:** Momentum, adherence, risk, last active

### 4.4 Client-Side: Daily Dashboard

**Route:** `/client/home`

```
┌─────────────────────────────────────────────────────────┐
│  Good morning, Sarah 💪                                  │
│  Wednesday, June 4 · Streak: 12 days                    │
├─────────────────────────────────────────────────────────┤
│  TODAY'S FOCUS                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 🏋️ Push Day A — Chest, Shoulders, Triceps         │  │
│  │ 5 exercises · ~55 min                             │  │
│  │ [Start Workout →]                                  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  HABITS (3/5 done)                                      │
│  [x] Morning water   [x] Protein target   [ ] Stretch  │
│  [x] Steps 8K        [ ] Read 10min                      │
│                                                          │
│  RECOVERY                                                │
│  😴 Sleep: 7.2h · ❤️ HRV: 58ms · 🟢 Readiness: 78     │
│                                                          │
│  COACH MESSAGE                                          │
│  "Great session yesterday! Today we're pushing harder   │
│   on bench — try for 3 reps at 185lb."                  │
│  [Reply →]                                               │
│                                                          │
│  PROGRESS SNAPSHOT                                       │
│  Bench 1RM: 195lb (+5lb this week)                      │
│  ████████████████████████░░░░ 78% to goal               │
│  [View Full Progress →]                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Progress Intelligence System

### 5.1 Strength Progression Tracking

**Data Flow:**
```
SetLog (weight, reps, rpe) → Epley Formula → Estimated 1RM
    ↓
Per-exercise history → Trend Analysis → Plateau Detection
    ↓
Visual: Sparkline chart with trend line + % change badge
```

**Visualization:**
```
Bench Press — Estimated 1RM
210 ┤
200 ┤         ●───●
190 ┤     ●───┘
180 ┤ ●───┘
170 ┤
    └─────────────────
     W1  W2  W3  W4  W5  W6
     
     Current: 200lb · +12% (6 weeks) · Trend: IMPROVING ↑
```

### 5.2 Body Transformation Tracking

**Metrics tracked:**
- Weight (daily/weekly)
- Body fat % (weekly)
- Chest, waist, hips, arms, thighs (bi-weekly)
- Progress photos (front, side, back — monthly)

**Visualization:**
- Sparkline per metric with % change
- Photo comparison slider (before/after with date overlay)
- Body composition trend chart

### 5.3 Adherence Scoring

**Formula:**
```
adherenceScore = (
  workoutCompletionRate × 0.40 +
  sessionConsistency × 0.25 +
  metricLoggingRate × 0.20 +
  habitCompletionRate × 0.15
) × 100

WHERE:
  workoutCompletionRate = completedSessions / assignedSessions (last 30d)
  sessionConsistency = daysTrained / daysPlanned (last 30d)
  metricLoggingRate = daysWithMetrics / 30
  habitCompletionRate = habitsCompleted / habitsExpected (last 7d)
```

### 5.4 Momentum Score (Composite)

Already implemented in `momentum.service.ts`. The 4 dimensions:

| Dimension | Weight | Inputs |
|-----------|--------|--------|
| Performance | 35% | Workout completion rate, session consistency, health snapshot progress |
| Behavior | 25% | Habit adherence, metric logging consistency |
| Engagement | 25% | Check-in submissions, messaging activity, health snapshot engagement |
| Recovery | 15% | Average readiness, sleep quality |

**Trend calculation:** Compare today's score to yesterday's. >3 = RISING, <-3 = FALLING, else STABLE.

### 5.5 Alert & Recommendation Engine

**Alert Generation (runs daily via cron):**
```
FOR each active client:
  1. Calculate momentum score
  2. Run plateau detection
  3. Calculate overtraining risk
  4. Calculate churn risk
  5. Check adherence rate
  6. Check recovery readiness
  
  IF any alert triggers:
    CREATE ClientRiskFlag with severity + evidence
    ADD to coach attention queue
    SEND notification to coach
```

**Recommendation Generation (runs per-client on demand):**
```
INPUT: momentumScore, plateauStatus, overtrainingRisk, adherenceRate, recoveryReadiness
OUTPUT: prioritized list of actions

RULES:
  1. overtrainingRisk == HIGH → "Reduce volume by 20%, add rest day" (priority: 95)
  2. plateau detected && adherence > 80% → "Deload week + intensity change" (priority: 90)
  3. churnRisk > 70% → "Schedule check-in call" (priority: 85)
  4. missedCheckin > 2 days → "Send reminder message" (priority: 80)
  5. recoveryReadiness < 30 → "Postpone heavy session, focus on mobility" (priority: 75)
  6. momentum > 80 && no plateaus → "Client crushing it — consider progression" (priority: 70)
  7. adherence < 60% → "Review goals and adjust program" (priority: 65)
  8. loggingGap > 3 days → "Prompt metric logging" (priority: 60)
```

---

## 6. UX/UI Structure

### 6.1 Design System

**Color Tokens (Existing):**
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

**Typography:**
- Display: Fraunces (serif, premium feel)
- Body: Inter Variable (clean, readable)
- Mono: JetBrains Mono (data, code)

**Component Library:**
- shadcn/ui primitives (Button, Card, Input, Select, Dialog, etc.)
- Custom: MetricCard, Sparkline, MomentumGauge, RiskBadge, HealthScoreCard
- Framer Motion for all transitions and micro-interactions

### 6.2 Screen Hierarchy

```
ROOT
├── LANDING (marketing)
│   ├── Hero
│   ├── Features
│   ├── Pricing
│   ├── Testimonials
│   └── CTA
├── AUTH
│   ├── Login
│   ├── Signup
│   └── Forgot Password
├── ONBOARDING (post-signup)
│   ├── Goal Selection
│   ├── Fitness Level
│   ├── Equipment
│   ├── Schedule
│   ├── Injuries
│   ├── Lifestyle
│   └── Blueprint Generation
└── DASHBOARD
    ├── CLIENT
    │   ├── Home (today's focus)
    │   ├── Workouts (calendar + list)
    │   ├── Program (current program)
    │   ├── Progress (metrics + photos + 1RM)
    │   ├── Nutrition (plans + logging)
    │   ├── Recovery (sleep + HRV + readiness)
    │   ├── Feed (coach posts)
    │   ├── Tasks (assigned tasks)
    │   ├── Messages
    │   ├── Billing
    │   └── Notifications
    ├── COACH
    │   ├── Command Center (attention queue + risk alerts)
    │   ├── Client Dossiers (list + individual)
    │   ├── Client Health (aggregate grid)
    │   ├── Risk Signals (full scan)
    │   ├── Intelligence (momentum + recommendations)
    │   ├── Workouts (builder + calendar + review)
    │   ├── Programs (create + manage)
    │   ├── Tasks (create + assign + review)
    │   ├── Progress (client metrics + photos)
    │   ├── Nutrition (plans + recipes)
    │   ├── Feed (create posts)
    │   ├── Packages (billing)
    │   ├── Messages
    │   └── Settings
    └── ADMIN
        ├── Dashboard
        ├── Users
        ├── Reports
        ├── Audit Logs
        ├── Delivery Logs
        ├── Feature Flags
        └── Webhooks
```

### 6.3 Key Screen Designs

**Screen 1: Onboarding Goal Selection**
```
┌─────────────────────────────────────────────────────────┐
│  What's your primary goal?                    2/7       │
│  ████████████░░░░░░░░░░░░░░░░░░░░                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│  │  💪     │ │  🏋️     │ │  🔥     │                  │
│  │ Build   │ │ Get     │ │ Lose    │                  │
│  │ Muscle  │ │ Stronger│ │ Fat     │                  │
│  │         │ │         │ │         │                  │
│  └─────────┘ └─────────┘ └─────────┘                  │
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│  │  🏃     │ │  ⚡     │ │  🎯     │                  │
│  │ Improve │ │ General │ │Athletic │                  │
│  │ Endurance│ │Fitness │ │Performance│                 │
│  │         │ │         │ │         │                  │
│  └─────────┘ └─────────┘ └─────────┘                  │
│                                                          │
│                              [Continue →]               │
└─────────────────────────────────────────────────────────┘
```

**Screen 2: Workout Session (Real-Time)**
```
┌─────────────────────────────────────────────────────────┐
│  ← Back        PUSH DAY A        ⏱️ 32:15 remaining    │
├─────────────────────────────────────────────────────────┤
│  EXERCISE 3/5: Incline Dumbbell Press                   │
│  Prescribed: 4 × 10 @ RPE 7 · Rest: 75s                │
│                                                          │
│  SET 1: [10] reps × [75] kg  RPE [7]  ✓               │
│  SET 2: [10] reps × [75] kg  RPE [8]  ✓               │
│  SET 3: [  ] reps × [  ] kg  RPE [  ]  ← current      │
│  SET 4: [  ] reps × [  ] kg  RPE [  ]                  │
│                                                          │
│  ⏱️ REST TIMER: 0:42 remaining                          │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░                                  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 🎥 Watch Demo · 📝 Coach Cues: "Control the      │  │
│  │    eccentric, pause at bottom, drive through       │  │
│  │    the chest"                                      │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  FATIGUE METER: ▓▓▓▓▓▓▓▓░░ Moderate                    │
│                                                          │
│  [Complete Set]  [Skip Set]  [Next Exercise →]          │
└─────────────────────────────────────────────────────────┘
```

**Screen 3: Coach Dossier**
```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Clients                                      │
│                                                          │
│  [Avatar] Sarah Chen                    Momentum: 82 ↑  │
│  Joined: Mar 2026 · Phase: Intensification              │
│  Current Program: Hypertrophy Phase 2                    │
│                                                          │
│  [Message] [Assign Workout] [Add Note]                  │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Health   │ │ Adherence│ │ Plateaus │ │ Churn    │  │
│  │ Score:88 │ │ Score:95 │ │ None     │ │ Risk:Low │  │
│  │ ●●●●○    │ │ 14/15    │ │          │ │          │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
├─────────────────────────────────────────────────────────┤
│  MOMENTUM BREAKDOWN                                     │
│  Performance: 85 ████████████████████░░                 │
│  Behavior:    78 █████████████████░░░░                  │
│  Engagement:  82 ████████████████████░░                 │
│  Recovery:    75 █████████████████░░░░                  │
├─────────────────────────────────────────────────────────┤
│  NEXT BEST ACTIONS                                      │
│  1. 🟡 Plateau detected — Bench Press stagnant (3 weeks)│
│     → Suggest deload + intensity variation               │
│  2. 🟢 Check in — Missed Tuesday session                │
│     → Send encouraging message                          │
│  3. 🟢 Great progress — Squat 1RM up 8% this month      │
│     → Consider increasing training max                  │
├─────────────────────────────────────────────────────────┤
│  RECENT ACTIVITY                                        │
│  Today: Completed Push Day (RPE 7.5) · 55 min          │
│  Yesterday: Rest day — logged 7h sleep                   │
│  Mon: Completed Pull Day (RPE 8.2) · 48 min            │
│  Sun: Completed Leg Day (RPE 8.8) · 62 min             │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Differentiation Strategy

### 7.1 Five Features That Beat Competitors

#### Feature 1: Momentum Scoring System
**What it is:** A composite 0-100 score combining performance, behavior, engagement, and recovery into a single metric with daily trend tracking.

**Why it beats competitors:**
- **Nike Training Club:** No coaching, no scoring
- **MyFitnessPal:** Tracks nutrition but no composite fitness score
- **Trainerize:** Basic adherence tracking, no multi-dimensional scoring
- **Everfit:** Has health scores but not the 4-dimension momentum composite
- **Future:** Relies on coach intuition, not data-driven scoring

**The moat:** Momentum scoring requires 14 days of data across 4 dimensions. Once a coach sees the score and trend, they can't go back to guessing. It's the "single number" that tells you everything.

#### Feature 2: Adaptive Workout Programming
**What it is:** Workouts that automatically adjust based on logged RPE, recovery readiness, and performance trends. Not just "do this workout" — the system learns and adapts.

**Why it beats competitors:**
- **Nike Training Club:** Static programs, no adaptation
- **MyFitnessPal:** No workout programming
- **Trainerize:** Static prescriptions, coach must manually adjust
- **Everfit:** Basic auto-regulation, not full adaptive system
- **Future:** Coach adjusts manually, no system-level adaptation

**The moat:** The adaptive engine creates a feedback loop: client logs → system analyzes → next workout adapts → client feels understood → adherence increases.

#### Feature 3: Coach Intelligence Dashboard
**What it is:** Enterprise-grade client intelligence: attention queue, risk alerts, churn prediction, plateau detection, next-best-action — all in one view.

**Why it beats competitors:**
- **Nike Training Club:** No coach interface
- **MyFitnessPal:** No coach interface
- **Trainerize:** Basic client list, no intelligence
- **Everfit:** Has some risk signals, but not the full intelligence suite
- **Future:** Coach relies on spreadsheets and intuition

**The moat:** A coach managing 20 clients can see in 5 seconds who needs attention and why. Without this, they're guessing or checking each client individually (30+ minutes).

#### Feature 4: Smart Onboarding with Fitness Blueprint
**What it is:** A 7-step adaptive onboarding that builds a complete fitness profile and generates a personalized "Fitness Blueprint" — not just a program, but a training identity.

**Why it beats competitors:**
- **Nike Training Club:** 3-4 questions, generic program
- **MyFitnessPal:** Basic profile, no training plan generation
- **Trainerize:** Coach sets up manually, no automated blueprint
- **Everfit:** Basic assessment, no intelligent branching
- **Future:** Coach interviews client manually

**The moat:** The blueprint creates a "known entity" — the system knows the client's level, equipment, injuries, and goals before the first workout. This enables all downstream intelligence.

#### Feature 5: Plateau Detection + Overtraining Prevention
**What it is:** Automated detection of strength plateaus (via estimated 1RM trends) and overtraining risk (via session load + recovery readiness analysis), with actionable alerts.

**Why it beats competitors:**
- **Nike Training Club:** No performance tracking
- **MyFitnessPal:** No strength tracking
- **Trainerize:** No automated plateau detection
- **Everfit:** Basic progress tracking, no plateau alerts
- **Future:** Coach must manually notice plateaus

**The moat:** The system catches problems before the coach or client notices. A plateau detected at week 3 means the program adapts at week 4, not week 8 when the client is frustrated.

### 7.2 Competitive Positioning

| Feature | LevelFit | NTC | MyFitnessPal | Trainerize | Everfit | Future |
|---------|----------|-----|--------------|------------|---------|--------|
| Smart Onboarding | ✅ Deep | ❌ Basic | ❌ None | ⚠️ Manual | ⚠️ Basic | ⚠️ Manual |
| Adaptive Workouts | ✅ Auto | ❌ Static | ❌ None | ⚠️ Manual | ⚠️ Basic | ⚠️ Manual |
| Coach Intelligence | ✅ Full | ❌ None | ❌ None | ⚠️ Basic | ⚠️ Partial | ❌ None |
| Momentum Scoring | ✅ 4D | ❌ None | ❌ None | ❌ None | ⚠️ 2D | ❌ None |
| Plateau Detection | ✅ Auto | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None |
| Overtraining Prevention | ✅ Auto | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None |
| Nutrition Tracking | ✅ Full | ❌ None | ✅ Full | ✅ Full | ✅ Full | ⚠️ Basic |
| Recovery Tracking | ✅ Full | ❌ None | ❌ None | ⚠️ Basic | ✅ Full | ⚠️ Basic |
| Messaging | ✅ Real-time | ❌ None | ❌ None | ✅ Basic | ✅ Basic | ✅ Full |
| Billing/Payments | ✅ Stripe | ❌ None | ❌ None | ✅ Full | ✅ Full | ✅ Full |

---

## 8. Monetization Plan

### 8.1 Business Model

LevelFit operates on a **B2B2C model**: coaches pay for the platform, clients get the app for free (or with premium features).

### 8.2 Subscription Tiers

#### Free Tier (Client)
- Basic workout tracking
- Limited progress metrics (3 metrics)
- Basic recovery logging
- Community feed access
- 1 coach connection

#### Pro Tier (Coach) — $49/month
- Unlimited clients
- Full intelligence suite (momentum, plateau, overtraining)
- Workout builder + program management
- Nutrition planning
- Task management
- Messaging
- Billing/payments integration
- Client health dashboard

#### Enterprise Tier (Coach) — $99/month
Everything in Pro, plus:
- White-label client app
- Advanced analytics
- API access
- Priority support
- Custom integrations
- Team coaching (assistant coaches)

### 8.3 Revenue Projections

**Target Market:** Online fitness coaches, personal trainers, gym owners
**Addressable Market:** ~500,000 online fitness coaches globally
**Penetration Target:** 1% in Year 1 = 5,000 coaches
**Average Revenue Per Coach:** $60/month (mix of Pro + Enterprise)

**Year 1 Revenue:** 5,000 × $60 × 12 = **$3.6M ARR**
**Year 2 Revenue:** 15,000 × $65 × 12 = **$11.7M ARR**
**Year 3 Revenue:** 40,000 × $70 × 12 = **$33.6M ARR**

### 8.4 What Makes Users Upgrade

**Free → Pro (Coach):**
- "You're managing 5+ clients — Pro gives you intelligence to coach them better"
- "See who's at risk of dropping off before they leave"
- "Automated plateau detection saves you 2 hours/week"

**Pro → Enterprise (Coach):**
- "White-label the app with your brand"
- "Team coaching with assistant coaches"
- "API access for custom integrations"

---

## 9. Technical Architecture

### 9.1 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  Next.js 15 (App Router) + React 19 + Tailwind CSS     │
│  Framer Motion · Lenis · React Three Fiber              │
│  shadcn/ui primitives · Custom brand tokens             │
├─────────────────────────────────────────────────────────┤
│                    API LAYER                             │
│  Express.js + TypeScript                                │
│  JWT auth (access + refresh tokens)                     │
│  Role-based middleware (coach, client, admin)            │
│  Rate limiting · CORS · Request validation              │
├─────────────────────────────────────────────────────────┤
│                  INTELLIGENCE LAYER                      │
│  Momentum Service · Plateau Detector                    │
│  Overtraining Risk · Churn Predictor                    │
│  Action Engine · Health Score Calculator                │
│  Today Intelligence · Adaptive Workout Engine           │
├─────────────────────────────────────────────────────────┤
│                   DATA LAYER                             │
│  PostgreSQL (Prisma ORM)                                │
│  50+ models · UUID primary keys                         │
│  Composite indexes · Unique constraints                 │
│  JSON columns for flexible evidence/metadata            │
├─────────────────────────────────────────────────────────┤
│                  STORAGE LAYER                           │
│  Vercel Blob (media uploads)                            │
│  S3-compatible (exercise videos, progress photos)       │
├─────────────────────────────────────────────────────────┤
│                  DEPLOYMENT                              │
│  Frontend: Vercel (Edge Network)                        │
│  Backend: Railway (Docker containers)                   │
│  Database: PostgreSQL (Railway)                         │
│  CI: GitHub Actions (lint, typecheck, build, test)      │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Data Models (Key Entities)

**User & Profile:**
```
User (id, email, passwordHash, status, firstName, lastName, avatarUrl)
  ├── UserRole (userId, roleId) → Role (name: super_admin|coach|assistant_coach|client)
  ├── ClientProfile (userId, displayName, dateOfBirth, gender, heightCm, startingWeight, currentGoal, goalTimeline, currentPhase, communicationStyle, disciplineLevel)
  ├── CoachProfile (userId, displayName, bio)
  ├── ClientGoal (clientUserId, goalType, title, targetValue, targetUnit, currentValue, startDate, targetDate, status)
  └── FitnessBlueprint (userId, goal, trainingStyle, level, levelConfidence, equipment, daysPerWeek, sessionLength, split, injuryExclusions, weeklyVolume, periodization, recoveryProfile, estimatedTimeline)
```

**Training:**
```
Program (id, coachUserId, name, description)
  ├── ProgramWeek (programId, weekIndex, phaseLabel, focus)
  └── ProgramMembership (programId, clientUserId, addedByUserId, status)

Workout (id, coachUserId, programId?, weekId?, dayIndex?, title, description)
  └── WorkoutExercise (workoutId, exerciseId, orderIndex, prescribedSets, prescribedReps, prescribedRestSeconds, prescribedRpe, supersetGroupId, tempo, notes)
      └── Exercise (id, coachUserId?, name, instructions, demoVideoUrl, coachCues, muscleGroups, equipment)

WorkoutAssignment (workoutId, clientUserId, assignedByUserId, assignedForDate, status)
  └── WorkoutSession (assignmentId, clientUserId, startedAt, completedAt, status, offlineCreated, coachReview)
      └── SetLog (sessionId, workoutExerciseId, setNumber, reps, weight, rpe, setType, notes)
```

**Intelligence:**
```
MomentumScore (clientUserId, coachUserId, score, trend, performanceScore, behaviorScore, engagementScore, recoveryScore, evidenceJson, snapshotDate)
ClientHealthScoreSnapshot (coachUserId, clientUserId, score, healthStatus, adherenceScore, progressScore, engagementScore, paymentScore, riskPenalty, evidenceJson, snapshotDate)
ClientRiskFlag (coachUserId, clientUserId, flagType, severity, title, body, status, evidenceJson)
CoachAttentionSnapshot (coachUserId, clientUserId, score, severity, missedCheckins, openTasks, unreadMessages, inactiveDays, riskFlagsOpen, evidenceJson, snapshotDate)
CoachActionRecommendation (coachUserId, clientUserId, recommendationType, title, body, priority, actionHref, status, evidenceJson)
WorkoutWarningSignal (coachUserId?, clientUserId, warningType, severity, title, body, workoutId?, metricDate?, status, evidenceJson)
```

**Progress:**
```
MetricEntry (clientUserId, programId?, metricType, unit, value, recordedAt, source)
ProgressPhoto (clientUserId, programId?, mediaAssetId, photoType, capturedAt, notes)
DailyRecoveryMetric (userId, metricDate, provider, sleepMinutes, sleepScore, restingHeartRate, hrvMs, steps, caloriesBurned, readinessScore, recoveryStatus, sourcePayloadJson)
```

**Nutrition:**
```
NutritionPlan (coachUserId, clientUserId, programId?, planType, title, notes, startDate, endDate)
  ├── NutritionPlanDay (planId, dayIndex)
  │   └── NutritionPlanMeal (dayId, mealType, title, instructions, calories, protein, carbs, fat, recipeId?)
MacroGoal (clientUserId, programId?, calories, protein, carbs, fat, effectiveFrom)
MealLog (clientUserId, programId?, mealType, mealTime, title, notes, mediaAssetId?, calories, protein, carbs, fat)
HydrationLog (clientUserId, amountMl, loggedAt)
```

**Communication:**
```
Thread (coachUserId, clientUserId, status)
  └── Message (threadId, senderUserId, messageType, bodyText?, mediaAssetId?, durationMs?)
      └── MessageFlag (messageId, userId, isRead, readAt, isStarred, isPinned)

Task (coachUserId, programId?, title, description?, taskType)
  └── TaskAssignment (taskId, clientUserId, dueAt?, recurrenceRule?, status)
      └── TaskSubmission (assignmentId, clientUserId, bodyText?, mediaAssetId?, reviewStatus)
          └── TaskFeedback (submissionId, coachUserId, feedbackText?, feedbackMediaAssetId?)
```

### 9.3 Scalability Approach

**Database:**
- PostgreSQL with connection pooling (PgBouncer via Railway)
- Read replicas for analytics queries (future)
- Indexes on all query patterns (composite indexes for multi-column filters)

**API:**
- Stateless JWT auth (no session storage)
- Rate limiting per user (100 req/min)
- Request validation at middleware level
- Pagination on all list endpoints (cursor-based)

**Frontend:**
- Next.js App Router with React Server Components
- Code splitting per route (automatic)
- Framer Motion lazy loading for animations
- Image optimization via next/image

**Intelligence Services:**
- Momentum score calculated daily (cron job)
- Health scores recalculated on data change
- Plateau detection runs on session completion
- Overtraining risk checked daily
- Churn prediction runs weekly

**Future Scaling:**
- Redis caching for frequently-accessed intelligence (momentum scores, health scores)
- Background job queue (BullMQ) for heavy computations
- WebSocket for real-time messaging (currently REST fallback)
- CDN for media assets (Vercel Edge + Blob Storage)

---

## 10. Self-Critique & Improvements

### 10.1 Identified Weaknesses

| Area | Issue | Severity | Fix |
|------|-------|----------|-----|
| Onboarding | Current implementation is a single API call, not a multi-step UI | HIGH | Build onboarding wizard component + multi-step flow |
| Adaptive Workouts | No auto-regulation logic exists yet | HIGH | Implement RPE-based adjustment engine |
| Onboarding | No FitnessBlueprint model in Prisma schema | HIGH | Add model + migration |
| Workout Session | Rest timer is not implemented in UI | MEDIUM | Add countdown timer component |
| Workout Session | RPE quick-select not in session UI | MEDIUM | Add 1-10 scale after each set |
| Dossier | Client dossier page exists but lacks tabbed layout | MEDIUM | Rebuild with tabs (Overview/Progress/Workouts/Recovery/Notes) |
| Intelligence | Alerts are stored but not surfaced to coach in real-time | MEDIUM | Add notification system for risk alerts |
| Nutrition | No macro calculator based on goals/body data | LOW | Add TDEE calculator in onboarding |
| Recovery | No integration with wearable data sync | LOW | Implement Apple Health / Google Health Connect sync |
| UX | No skeleton loading states on all pages | LOW | Audit and add skeleton components |

### 10.2 What Would Make This Elite (Beyond Current Scope)

1. **AI Coaching Assistant**: LLM-powered chat that answers client questions using their data ("Should I increase my bench weight?")
2. **Video Form Analysis**: Computer vision analyzing exercise form from phone camera
3. **Social Challenges**: Client-vs-client challenges within a coach's roster
4. **Periodization Templates**: Pre-built 12/16/24-week periodization templates for common goals
5. **Integration Ecosystem**: MyFitnessPal, Cronometer, Apple Health, Garmin, Oura, Whoop
6. **Client Mobile App**: Native iOS/Android (currently web-only)
7. **White-Label**: Coach-branded client app with custom domain
8. **Advanced Analytics**: Predictive modeling for goal achievement timeline

### 10.3 Priority Implementation Order

**Phase 1 (Weeks 1-2): Foundation**
- [ ] FitnessBlueprint model + migration
- [ ] Onboarding wizard UI (7-step flow)
- [ ] Onboarding API endpoints
- [ ] Skeleton loading states audit

**Phase 2 (Weeks 3-4): Workout Intelligence**
- [ ] Adaptive workout adjustment engine
- [ ] Rest timer component
- [ ] RPE quick-select in session
- [ ] Exercise substitution system

**Phase 3 (Weeks 5-6): Dossier & Intelligence**
- [ ] Client dossier tabbed layout
- [ ] Health grid page
- [ ] Alert notification system
- [ ] Recommendation engine UI

**Phase 4 (Weeks 7-8): Polish & Scale**
- [ ] Performance optimization (caching, lazy loading)
- [ ] Wearable integration (Apple Health, Google Health Connect)
- [ ] Advanced analytics dashboard
- [ ] A/B testing framework

---

## Appendix A: API Endpoints Reference

### Onboarding
- `POST /api/onboarding/assessment` — Submit assessment answers
- `POST /api/onboarding/generate-plan` — Generate program from answers
- `POST /api/onboarding/blueprint` — Generate Fitness Blueprint

### Training
- `GET /api/training/exercises` — List exercises
- `POST /api/training/exercises` — Create exercise
- `PATCH /api/training/exercises/:id` — Update exercise
- `POST /api/training/workouts` — Create workout
- `POST /api/training/assign` — Assign workout to client
- `GET /api/training/assignments/calendar` — Calendar-filtered assignments
- `PATCH /api/training/assignments/:id` — Update assignment
- `DELETE /api/training/assignments/:id` — Unassign workout
- `GET /api/training/assignments/client` — Client's assignments
- `GET /api/training/history` — Workout history
- `GET /api/training/estimated-max` — 1RM estimates
- `POST /api/training/adaptive-adjustment` — Compute adaptive adjustments
- `GET /api/training/exercises/substitutions` — Movement pattern alternatives

### Programs
- `GET /api/programs` — List programs
- `POST /api/programs` — Create program
- `GET /api/programs/:id` — Get program with weeks
- `PATCH /api/programs/:id` — Update program
- `DELETE /api/programs/:id` — Delete program
- `POST /api/programs/:id/weeks` — Add week
- `PATCH /api/programs/weeks/:id` — Update week
- `DELETE /api/programs/weeks/:id` — Delete week

### Progress
- `GET /api/progress/metrics` — List metrics (filterable)
- `GET /api/progress/metrics/summary` — Per-metric aggregation
- `POST /api/progress/metrics` — Log metric
- `GET /api/progress/photos` — List progress photos
- `POST /api/progress/photos` — Upload progress photo

### Nutrition
- `GET /api/nutrition/plans` — List nutrition plans
- `POST /api/nutrition/plans` — Create plan
- `POST /api/nutrition/meals/log` — Log meal
- `GET /api/nutrition/meals` — List meal logs
- `POST /api/nutrition/hydration` — Log hydration
- `GET /api/nutrition/hydration` — Get hydration logs
- `POST /api/nutrition/recipes` — Create recipe

### Recovery
- `POST /api/recovery/metrics` — Upsert daily recovery
- `GET /api/recovery/today` — Today's recovery
- `GET /api/recovery/history` — Recovery history

### Intelligence
- `GET /api/intelligence/today` — Client today snapshot
- `POST /api/intelligence/today/:id/complete` — Complete recommendation
- `GET /api/coach-intelligence/attention-queue` — Attention queue
- `POST /api/coach-intelligence/refresh-queue` — Refresh queue
- `GET /api/coach-intelligence/risk-scan` — Full risk scan
- `GET /api/coach-intelligence/health-scores` — Health scores
- `GET /api/coach-intelligence/recommendations` — Action recommendations

### Clients
- `GET /api/clients/:id/dossier` — Full client dossier
- `GET /api/clients/notes/:userId` — Client notes
- `POST /api/clients/notes/:userId` — Add note
- `DELETE /api/clients/notes/:noteId` — Delete note

### Messaging
- `GET /api/messaging/threads` — List threads
- `POST /api/messaging/threads` — Create thread
- `GET /api/messaging/threads/:id/messages` — List messages
- `POST /api/messaging/threads/:id/messages` — Send message
- `POST /api/messaging/messages/:id/read` — Mark read

### Tasks
- `GET /api/tasks` — List tasks
- `POST /api/tasks` — Create task
- `POST /api/tasks/:id/assign` — Assign task
- `GET /api/tasks/client` — Client's tasks
- `POST /api/tasks/assignments/:id/submissions` — Submit task
- `POST /api/tasks/submissions/:id/review` — Review submission

### Payments
- `GET /api/payments/packages` — List packages
- `POST /api/payments/packages` — Create package
- `POST /api/payments/checkout` — Create checkout session

### Habits
- `GET /api/habits` — List habits
- `POST /api/habits` — Create habit
- `POST /api/habits/:id/log` — Log habit completion

### Check-ins
- `GET /api/checkins/expectations` — Check-in expectations

---

## Appendix B: Prisma Schema Additions

### New Models Needed

```prisma
model FitnessBlueprint {
  id                String   @id @default(uuid())
  userId            String   @unique
  goal              String
  trainingStyle     String
  level             String
  levelConfidence   Float    @default(0.5)
  equipment         String
  daysPerWeek       Int
  sessionLength     Int
  split             String
  injuryExclusions  Json     @default("[]")
  weeklyVolume      Json     @default("{}")
  periodization     String
  recoveryProfile   Json     @default("{}")
  estimatedTimeline String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model WorkoutTemplate {
  id          String   @id @default(uuid())
  coachUserId String
  name        String
  description String?
  splitType   String?
  exercises   Json     @default("[]")
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Migration SQL

```sql
-- FitnessBlueprint table
CREATE TABLE "FitnessBlueprint" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "goal" TEXT NOT NULL,
  "trainingStyle" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "levelConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  "equipment" TEXT NOT NULL,
  "daysPerWeek" INTEGER NOT NULL,
  "sessionLength" INTEGER NOT NULL,
  "split" TEXT NOT NULL,
  "injuryExclusions" JSONB NOT NULL DEFAULT '[]',
  "weeklyVolume" JSONB NOT NULL DEFAULT '{}',
  "periodization" TEXT NOT NULL,
  "recoveryProfile" JSONB NOT NULL DEFAULT '{}',
  "estimatedTimeline" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FitnessBlueprint_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FitnessBlueprint_userId_key" ON "FitnessBlueprint"("userId");

-- WorkoutTemplate table
CREATE TABLE "WorkoutTemplate" (
  "id" TEXT NOT NULL,
  "coachUserId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "splitType" TEXT,
  "exercises" JSONB NOT NULL DEFAULT '[]',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorkoutTemplate_pkey" PRIMARY KEY ("id")
);
```

---

*Document generated: June 1, 2026*
*LevelFit v1.0 — Production-grade fitness platform architecture*
