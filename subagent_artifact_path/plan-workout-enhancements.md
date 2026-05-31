# Strategic Coach Workout Enhancements — Implementation Plan

## Track: FULL

## Strategic Framing

A fitness coach's core job: **assess → design → deliver → review → adapt**.

LevelFITness has the assessment, review, and adaptation pieces (progress tracking, session review, coach intelligence). The **design and delivery** pipeline is where the strategic gaps are — the tools a coach uses daily to write and assign training.

These are ranked by **coach workflow value**, not developer convenience.

---

## Tier 1 — Core Coaching Infrastructure (must-haves)

### 1. Program Periodization — Week-by-week training structure

**Coach need:** A program isn't just a named bucket. It's a 4-12 week structured plan where workouts have week numbers, days, and progression. "Week 3 of the Upper/Lower program" should be a concept in the app.

**What exists today:** `Program` has only name + description + guidelines. `Workout` has a nullable `programId`. No weeks, no phases, no ordering.

**Plan:**

| Step | File | Change |
|------|------|--------|
| 1a | `backend/prisma/schema.prisma` | Add `ProgramWeek` model: `{ id, programId, weekIndex, phaseLabel?, focus?, createdAt }`. Add `weekId` FK to `Workout` plus `dayIndex` (1-7). |
| 1b | `backend/src/modules/programs/programs.routes.ts` | Add `GET /programs/:id/weeks` (list weeks with workouts), `POST /programs/:id/weeks` (create week), `PATCH /weeks/:id`, `DELETE /weeks/:id` |
| 1c | `frontend/lib/types/domain.ts` | Add `ProgramWeek`, `WeekWithWorkouts` types |
| 1d | `frontend/lib/api/modules/programs.ts` | Add `getProgramWeeks()`, `createProgramWeek()`, `updateProgramWeek()`, `deleteProgramWeek()` |
| 1e | `frontend/app/(dashboard)/coach/programs/[id]/page.tsx` | Add a week-by-week tab/below the current detail. Each week shows its workouts. Drag to reorder. Add week button. |

**Backend endpoints to add:**
```
GET    /api/programs/:id/weeks          → program weeks with nested workouts
POST   /api/programs/:id/weeks          → create week (body: weekIndex, phaseLabel?)
PATCH  /api/programs/weeks/:weekId      → update week
DELETE /api/programs/weeks/:weekId      → delete week + unlink workouts
```

**States:** Empty week list → "Add your first training week"; loading skeleton; populated with expandable week cards showing workout titles; error on save.

---

### 2. 1RM / Estimated Max Tracking

**Coach need:** Know a client's strength on main lifts to prescribe appropriate loads. Epley formula from set log data.

**What exists:** `SetLog` has reps + weight + RPE for every logged set. No calculation layer.

**Plan:**

| Step | File | Change |
|------|------|--------|
| 2a | `backend/src/modules/training/training.routes.ts` | Add `GET /training/estimated-maxes` — computes Epley formula across all client sessions, returns top estimated max per exercise |
| 2b | `frontend/lib/types/domain.ts` | Add `EstimatedMax { exerciseId, exerciseName, estimatedMax, reps, weight, date, formula }` |
| 2c | `frontend/lib/api/modules/training.ts` | Add `getEstimatedMaxes()` method |
| 2d | `frontend/app/(dashboard)/client/progress/page.tsx` | Add a "Strength" tab below the metrics dashboard — shows top estimated 1RM per lift with progression chart |
| 2e | `frontend/app/(dashboard)/client/workouts/session/[sessionId]/page.tsx` | After logging a set, check if it's a new PR. If so, show a subtle "New PR!" indicator (text + icon, no animation library needed). |

**Epley formula:** `estimatedMax = weight × (1 + reps / 30)` — simplest, works well for reps ≤ 10.

**Data source:** `SetLog` entries across all completed `WorkoutSession` records, grouped by `workoutExerciseId` → resolved through `WorkoutExercise.exerciseId` → `Exercise.name`.

**States:** No data → "Log some workouts to see your estimated maxes"; loading skeleton; populated with per-exercise max cards with progression; error.

---

### 3. Exercise Video / Coach Cues

**Coach need:** A picture is worth 1000 words. Coaches need to attach video demos and cue notes to exercises so clients see proper form.

**What exists:** `Exercise.defaultDemoMediaId` orphan column + generic presigned-URL upload pipeline. The `EXERCISE_VIDEO` enum value already exists but is unused.

**Plan:**

| Step | File | Change |
|------|------|--------|
| 3a | `backend/prisma/schema.prisma` | Add `@relation` from `Exercise.defaultDemoMediaId` to `FeedMedia`. Or simpler: add `demoVideoUrl String?` and `coachCues String?` directly to `Exercise` (avoids media pipeline complexity for v1). |
| 3b | `backend/src/modules/training/training.routes.ts` | Accept `demoVideoUrl` and `coachCues` in `POST /exercises` and `PUT /workouts/:id` |
| 3c | `frontend/lib/types/domain.ts` | Add `demoVideoUrl?: string \| null`, `coachCues?: string \| null` to `Exercise` type |
| 3d | `frontend/components/coach/workout-builder-shell.tsx` | Add a "Demo video URL" text field and "Coach cue" textarea in each exercise row |
| 3e | `frontend/app/(dashboard)/client/workouts/session/[sessionId]/page.tsx` | Render video embed and cue text above the set logging form |

**Why URL-based vs media pipeline:** A text URL field for v1 is ~30 min of work vs days of S3 upload UX. Coach can paste a YouTube link. The `defaultDemoMediaId` path can be a follow-up.

**States:** Builder inputs collapse when empty. Client session shows embedded video + cue text when present, hides when absent.

---

## Tier 2 — Coach Workflow UX (important but buildable on top of Tier 1)

### 4. Workout Builder Edit Mode

**Coach need:** I created a workout, now I need to fix something. Current behavior: clicking "View" on a workout shows a blank form.

**Plan:** Same as original plan item 1 — follow the `ProgramBuilderShell` pattern exactly.

| Step | File | Change |
|------|------|--------|
| 4a | `frontend/components/coach/workout-builder-shell.tsx` | Accept `editId` prop. Prefill from `trainingApi.getWorkout(editId)`. Branch on `editId` in `handleSave` to call `updateWorkout` vs `createWorkout`. |
| 4b | `frontend/app/(dashboard)/coach/workouts/builder/page.tsx` | Read `searchParams.id`, pass as `editId` |
| 4c | `frontend/app/(dashboard)/coach/workouts/[id]/page.tsx` | Add read-only detail view (title, description, all exercises with sets/reps/rest/tempo listed) |

---

### 5. Prescribed RPE + Superset Grouping

**Coach need:** Common programming tools — prescribe "3×10 @ RPE 8" and pair exercises into supersets.

**Plan:** Combine original plan items 2+3. Both are simple schema additions + UI changes.

| Step | File | Change |
|------|------|--------|
| 5a | `backend/prisma/schema.prisma` | Add `prescribedRpe Float?`, `supersetGroupId String?` to `WorkoutExercise` |
| 5b | `frontend/lib/types/domain.ts` | Add both fields to `WorkoutExercise` type |
| 5c | `frontend/components/coach/workout-builder-shell.tsx` | Add RPE input + superset link button to each exercise row |
| 5d | `frontend/app/(dashboard)/client/workouts/session/[sessionId]/page.tsx` | Display RPE prescription. Group superset exercises visually. |

---

### 6. Set Type (Warmup / Working / Drop / Failure)

**Coach need:** Separate warmup sets from working sets in review. Currently all sets look the same.

**Plan:** Same as original plan item 6.

| Step | File | Change |
|------|------|--------|
| 6a | `backend/prisma/schema.prisma` | Add `setType String @default("working")` to `SetLog` |
| 6b | `frontend/lib/types/domain.ts` | Add to `SetLog` type |
| 6c | `frontend/app/(dashboard)/client/workouts/session/[sessionId]/page.tsx` | Set type chips in logging form |
| 6d | `frontend/app/(dashboard)/coach/workouts/review/page.tsx` | Set type badge on each logged set |

---

### 7. Fix Client "Workout #N" Placeholder

**Coach need:** Clients see real workout names, not placeholders.

**Plan:** Same as original plan item 5 — one-line backend fix.

| Step | File | Change |
|------|------|--------|
| 7a | `backend/src/modules/training/training.routes.ts` | Add `include: { workout: true }` to `GET /client-assignments` |

---

## Effort Estimate

| Item | Backend | Frontend | Total | Coach Value |
|------|---------|----------|-------|-------------|
| 1. Program periodization | 2h (schema + routes) | 4h (weeks UI on program page) | **6h** | 🔥🔥🔥🔥🔥 |
| 2. 1RM / estimated max | 1h (Epley query) | 3h (PR tab on progress page) | **4h** | 🔥🔥🔥🔥🔥 |
| 3. Exercise video + cues | 0h (text fields) | 2h (builder + session display) | **2h** | 🔥🔥🔥🔥 |
| 4. Builder edit mode | 0h (APIs exist) | 1h (follow ProgramShell pattern) | **1h** | 🔥🔥🔥 |
| 5. Prescribed RPE + supersets | 0.5h (schema) | 2h (builder + session display) | **2.5h** | 🔥🔥🔥 |
| 6. Set type | 0.5h (schema) | 1.5h (form chips + review badges) | **2h** | 🔥🔥 |
| 7. Workout #N fix | 0.1h | 0h | **0.1h** | 🔥 |

**Total: ~18 hours. Tier 1 (strategic): ~12h. Tier 2 (UX): ~6h.**

---

## Dependencies & Ordering

```
Program periodization ──┬── No strict deps. Can start anytime.
                        │
1RM / estimated max     ── Needs SetLog data (exists)
                        │
Exercise video + cues   ── No deps. Text fields only.
                        │
Builder edit mode       ── No deps. Follows ProgramShell pattern.
                        │
RPE + superset          ── Needs builder edit mode first (to preserve changes)
                        │
Set type                ── No deps.
                        │
Workout #N fix          ── Can do anytime. 1 line.
```

---

## Verification

### Build
```bash
cd frontend && pnpm build && pnpm typecheck
cd backend && npx prisma generate && npx tsc --noEmit
```

### Manual coach flow test
1. Create a program with 4 weeks → add a workout to Week 2 → verify the program page shows weeks
2. Edit that workout → change exercises → save → verify it updated (not created new)
3. Assign workout to client → client logs a session → verify RPE + superset display
4. Client completes session → coach review shows set types
5. Check client progress page → estimated maxes show for lifts with logged sets
6. Client session page → "New PR" fires when a set beats previous best

### E2E
```bash
cd frontend && npx playwright test --grep "workout"
```
