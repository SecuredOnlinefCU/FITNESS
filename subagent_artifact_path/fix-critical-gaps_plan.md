# LevelFit — Critical Gaps Fix Plan

**Date:** 2026-06-01  
**Goal:** Fix all critical gaps to make the product genuinely competitive with Everfit/Trainerize  
**Approach:** 4 tiers by impact — T1 = core functionality, T2 = coach intelligence, T3 = client engagement, T4 = polish

---

## Tier 1: Core Functionality (Must-fix — product is broken without these)

### 1.1 Onboarding: 6 → 8 steps
**File:** `frontend/components/onboarding/onboarding-wizard.tsx`  
**Backend:** Already complete (`POST /api/onboarding/blueprint`)  
**API module:** Already complete (`generateBlueprint()`)

**Changes:**
- Add 7 new state variables: `sessionLength`, `sleepHours`, `stressLevel`, `activityLevel`, `pushups`, `plankSeconds`, `squats`
- Extend STEPS from `['goal','level','equipment','schedule','injuries','summary']` to `['goal','level','equipment','schedule','injuries','lifestyle','assessment','blueprint']`
- Add `getStepLabel()` function for step names in progress bar
- Build `LifestyleStep` component: sleep (5 options), stress (5 options), activity (4 options) — use existing brand tokens
- Build `AssessmentStep` component: pushups/plank/squats number inputs with beginner/intermediate/advanced ranges
- Rename existing `summary` step to `blueprint` — call `generateBlueprint()` first, display levelConfidence gauge + recoveryProfile + estimatedTimeline, then call `generatePlan()`
- Update `schedule` step to include session length selector (30/45/60/75/90 min)
- Update `canNext` logic for new steps

### 1.2 Client Meal Logging
**Files:** `frontend/app/(dashboard)/client/nutrition/page.tsx`, `frontend/lib/api/modules/nutrition.ts`  
**Backend:** `POST /api/nutrition/meal-logs` exists

**Changes:**
- Add `logMeal()` method to nutrition API module
- Build `LogMealDialog` component: meal type select (breakfast/lunch/dinner/snack), title input, calorie/protein/carbs/fat number inputs, optional notes
- Add "Log meal" button to nutrition page (floating action or in header)
- After logging, reload meal logs and update stat card count
- Show daily macro summary: total calories/protein/carbs/fat from today's logs vs nothing (add daily totals computation)

### 1.3 Client Hydration Logging
**Files:** `frontend/app/(dashboard)/client/nutrition/page.tsx`, `frontend/lib/api/modules/nutrition.ts`  
**Backend:** `POST /api/nutrition/hydration` exists

**Changes:**
- Add `logHydration(amountMl: number)` method to nutrition API module
- Build inline hydration quick-add: tap to add 250ml, show current total, visual water glass/bottle fill
- Place below stat cards or in a dedicated hydration row
- Animate the add (Framer Motion scale pulse)

### 1.4 Client Progress Photo Upload
**Files:** `frontend/app/(dashboard)/client/progress/page.tsx`, `frontend/lib/api/modules/progress.ts`  
**Backend:** `POST /api/progress/photos` exists

**Changes:**
- Add `uploadPhoto(input: { photoType: string; notes?: string; mediaAssetId: string })` to progress API module
- Add `uploadMedia()` method using existing media upload pattern
- Build `PhotoUploadButton` component: camera icon, file input, photo type selector (front/side/back), optional notes
- Place in "Recent photos" section header
- After upload, reload photo list

### 1.5 Client Metric Logging
**Files:** `frontend/app/(dashboard)/client/progress/page.tsx`, `frontend/lib/api/modules/progress.ts`  
**Backend:** `POST /api/progress/metrics` exists

**Changes:**
- Add `logMetric(input: { metricType: string; value: number; unit?: string })` to progress API module
- Build `LogMetricDialog` component: metric type select (weight, body_fat, chest, waist, etc.), value input, unit display
- Add "Log metric" button to progress page
- After logging, reload metrics summary

---

## Tier 2: Coach Intelligence (Makes the moat visible)

### 2.1 Health Grid: UUID → Client Names
**Files:** `frontend/components/coach/intelligence/client-health-dashboard-live.tsx`, `frontend/components/coach/intelligence/client-health-score-card.tsx`, `backend/src/modules/coach-intelligence/client-health-score.service.ts`

**Changes:**
- Backend: Modify `getClientHealthScores()` to join `User` (firstName, lastName) on `clientUserId`
- Frontend: Update `ClientHealthScoreCard` to accept typed props with `clientName`, replace UUID display with name + click to navigate to dossier
- Add drill-down link: click card → `/coach/clients/[clientId]`
- Fix `any` type on item prop

### 2.2 Risk Signals: Add "Run Scan" Button + Detail View
**File:** `frontend/app/(dashboard)/coach/risk-signals/page.tsx`

**Changes:**
- Add "Run scan" button that calls `riskSignalsV2Api.scanFull()` then reloads
- Show scan timestamp (when last scan ran)
- Below stat cards, render actual risk flag list from scan results:
  - Per-flag card: client name, flag type, severity badge, title, body, created date
  - Sort by severity (CRITICAL > HIGH > MEDIUM > LOW)
- Add link to client dossier from each flag

### 2.3 Intelligence Page: Show Actual Lists
**File:** `frontend/app/(dashboard)/coach/intelligence/page.tsx`

**Changes:**
- Replace stat-card-only layout with actual lists:
  - **Attention Queue**: Render `CoachAttentionQueueLive` component (already exists)
  - **Risk Flags**: Render flagged clients with severity badges
  - **Recommendations**: Show top 5 smart actions with priority, title, link
- Remove placeholder "Intelligence overview" text card
- Add link to client dossier from each item

---

## Tier 3: Client Engagement (Retention + daily active use)

### 3.1 Client Home: Wire TodayFocus + Add Streak + Readiness
**File:** `frontend/components/client/live/live-client-home.tsx`

**Changes:**
- Pass computed `focusItems` to `<TodayFocus />` component
- Fetch recovery today data via `recoveryApi.today()` — display readiness score as a small badge
- Fetch workout history — compute streak (consecutive days with completed session)
- Add "Coach message" card: fetch latest message from `messagingApi`, display preview with sender name
- Wire stat grid to show today's focus items (workout due, habits remaining, etc.)

### 3.2 Recovery: Add History Charts + Manual Entry
**File:** `frontend/app/(dashboard)/client/recovery/page.tsx`

**Changes:**
- Call `recoveryApi.history(30)` on mount (currently only calls `today()`)
- Build simple SVG sparklines for: readiness score, sleep hours, HRV — reuse existing `MetricSparkline` pattern
- Replace "Recovery history" placeholder with actual 30-day sparkline row
- Add "Log recovery" button → inline form: sleep hours (slider), readiness self-assessment (1-5), HRV if known
- Replace "Guidance" placeholder with computed recommendation based on readiness trend
- Show wearable status but note "Wearable integration coming soon" (honest placeholder)

### 3.3 Coach Dossier: Add Photos to Progress Tab
**File:** `frontend/app/(dashboard)/coach/clients/[clientId]/page.tsx`

**Changes:**
- In Progress tab, add `progressApi.listPhotos(clientId)` call
- Render photo grid (reuse `ProgressPhotoGrid` component from coach progress page)
- Add `ProgressPhotoCompare` modal support
- Place above the metrics list

---

## Tier 4: Polish (Finishing touches)

### 4.1 Nutrition: Add Macro Goal Display
**File:** `frontend/app/(dashboard)/client/nutrition/page.tsx`

**Changes:**
- If active plan has macro goals, show daily consumed vs target as simple progress bars
- Compute from today's meal logs: sum calories/protein/carbs/fat

### 4.2 Metric Card Drill-down
**File:** `frontend/components/metrics/metric-card.tsx`

**Changes:**
- Add click handler → expand modal showing full data point history
- Call `progressApi.listMetrics({ metricType, limit: 100 })` for the selected metric
- Show table of all logged values with dates

### 4.3 Skeleton Loading States
**Files:** Multiple pages

**Changes:**
- Nutrition page: add skeleton loading for plan cards
- Recovery page: add skeleton loading for metric cards
- Progress page: add skeleton loading for photo grid

---

## Files to Modify (Complete List)

| # | File | Tier | Change |
|---|------|------|--------|
| 1 | `frontend/components/onboarding/onboarding-wizard.tsx` | T1 | Add Lifestyle + Assessment steps, blueprint generation |
| 2 | `frontend/app/(dashboard)/client/nutrition/page.tsx` | T1 | Add meal logging + hydration logging UI |
| 3 | `frontend/lib/api/modules/nutrition.ts` | T1 | Add `logMeal()`, `logHydration()` methods |
| 4 | `frontend/app/(dashboard)/client/progress/page.tsx` | T1 | Add photo upload + metric logging UI |
| 5 | `frontend/lib/api/modules/progress.ts` | T1 | Add `uploadPhoto()`, `logMetric()` methods |
| 6 | `frontend/components/coach/intelligence/client-health-dashboard-live.tsx` | T2 | Fix UUID → name, add drill-down |
| 7 | `frontend/components/coach/intelligence/client-health-score-card.tsx` | T2 | Fix `any` type, add name prop |
| 8 | `backend/src/modules/coach-intelligence/client-health-score.service.ts` | T2 | Join User for client name |
| 9 | `frontend/app/(dashboard)/coach/risk-signals/page.tsx` | T2 | Add run scan button + flag detail list |
| 10 | `frontend/app/(dashboard)/coach/intelligence/page.tsx` | T2 | Show actual lists instead of counts |
| 11 | `frontend/components/client/live/live-client-home.tsx` | T3 | Wire TodayFocus, add streak + readiness + messages |
| 12 | `frontend/app/(dashboard)/client/recovery/page.tsx` | T3 | Add history charts + manual entry |
| 13 | `frontend/app/(dashboard)/coach/clients/[clientId]/page.tsx` | T3 | Add photos to Progress tab |
| 14 | `frontend/components/metrics/metric-card.tsx` | T4 | Add click drill-down |
| 15 | `frontend/app/(dashboard)/client/nutrition/page.tsx` | T4 | Add macro goal bars |

---

## Implementation Order

1. **T1.1** — Onboarding 8 steps (blocks user onboarding experience)
2. **T1.2 + T1.3** — Meal + hydration logging (blocks nutrition usability)
3. **T1.4 + T1.5** — Photo upload + metric logging (blocks progress tracking)
4. **T2.1** — Health grid names (quick fix, high coach impact)
5. **T2.2 + T2.3** — Risk signals + intelligence lists (makes coach intelligence visible)
6. **T3.1** — Client home enhancements (daily engagement)
7. **T3.2** — Recovery history (completes recovery experience)
8. **T3.3** — Coach dossier photos (completes progress view)
9. **T4** — Polish (macro bars, drill-down, skeletons)

---

## Verification

After each tier:
1. `npx tsc --noEmit` (frontend) — must pass
2. `npx tsc --noEmit` (backend) — must pass
3. `npx next build` — must compile all pages
4. Manual verification: navigate to each modified page, confirm UI renders correctly
