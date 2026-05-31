# Plan: Exercise Demo Videos in Workout Builder

## Goal

Add exercise demo video support to the workout builder so coaches can see video
demos of exercises while building workouts. Test with the existing MP4 files in
`C:\Users\mky50\Zebe\Desktop\LEVELFIT\Video and profile picture for testing`.

## Strategic Thinking — 3 approaches considered

| Approach | Description | Correctness | Perf | Maint | Risk | Verdict |
|---|---|---|---|---|---|---|
| **A — Plain URL** (YouTube/Vimeo links) | Store `demoVideoUrl` as external embed URL, render iframe | No upload pipeline, relies on 3rd-party hosting | Fast | Low | External link rot | ❌ Doesn't let the user host own videos |
| **B — S3 upload + FeedMedia** | Full pipeline: presigned URL → S3 → FeedMedia record (EXERCISE_VIDEO) → link to Exercise | Schema already has `EXERCISE_VIDEO` enum, `uploadFile()` exists unused | Needs S3 roundtrip | Follows existing patterns | Uses more moving parts | ✅ Chosen |
| **C — S3 upload + direct URL** | Upload via presigned URL, store `publicUrl` directly in `Exercise.demoVideoUrl`, no FeedMedia record | Works but skips asset tracking (no audit trail) | Slightly faster | Less infrastructure | Loses media metadata | ❌ No asset management |

**Winner: B.** Follows the existing progress-photo pattern (upload → FeedMedia → associate with parent record). The `EXERCISE_VIDEO` asset type and `uploadFile()` already exist but are unused — this plan wires them together.

## Files to modify

### Backend (3 files)

| File | Change | Why |
|---|---|---|
| `backend/src/modules/training/training.routes.ts` | Update `POST /exercises` to accept `demoMediaId` (FK to FeedMedia) and resolve `cdnUrl` in response; add `PATCH /exercises/:id` to attach/update video | Existing route ignores `defaultDemoMediaId`; exercises need a way to update video without recreating |
| `backend/src/modules/training/training.routes.ts` | Update `GET /exercises` to include `demoMediaId` and resolved `demoVideoUrl` from FeedMedia | Frontend needs the resolved video URL |
| `backend/prisma/schema.prisma` | Add optional relation: `Exercise.defaultDemoMediaId → FeedMedia.id` | Currently `defaultDemoMediaId` is a loose string — make it a proper FK with optional relation |

### Frontend (6 files)

| File | Change | Why |
|---|---|---|
| `frontend/lib/types/domain.ts` | Add `demoVideoUrl?: string \| null` to `Exercise` type | Missing field — currently type has no video field |
| `frontend/lib/api/modules/training.ts` | Add `updateExercise(id, data)` method | Needed to attach video after upload |
| `frontend/components/coach/workout-builder-shell.tsx` | Show video play button/thumbnail next to each exercise in search results; clicking opens a mini video modal | Coaches see demo videos while browsing exercises |
| `frontend/components/exercise/video-player-modal.tsx` | **NEW** — Lightweight modal with `<video>` element, play/pause, close-on-escape | Reusable video player for exercise demos |
| `frontend/app/(dashboard)/coach/workouts/page.tsx` | Add "New exercise" button that opens a create-exercise modal/dialog | Currently no UI to create exercises (only API) |
| `frontend/components/exercise/create-exercise-dialog.tsx` | **NEW** — Form: name, instructions, muscle groups, equipment + video upload (file picker → `uploadFile()` → PATCH exercise) | Coaches create exercises with video in one flow |

### Testing / Seeding (1 script)

| File | Change | Why |
|---|---|---|
| **New: `scripts/seed-exercise-videos.mjs`** | Uploads test MP4s from `Video and profile picture for testing` folder, creates exercises with those videos | Verifies the full pipeline end-to-end |

## Step-by-step implementation

### Step 1 — Backend: schema + routes

1. **schema.prisma**: Change `Exercise.defaultDemoMediaId` to a proper relation:
   ```prisma
   defaultDemoMediaId String? @map("default_demo_media_id")
   demoMedia           FeedMedia? @relation(fields: [defaultDemoMediaId], references: [id])
   ```
2. **training.routes.ts**:
   - `POST /exercises` — add `demoMediaId` to the create data
   - `GET /exercises` — `include: { demoMedia: true }` so `demoVideoUrl` can be resolved from `demoMedia.cdnUrl`
   - New `PATCH /exercises/:id` — update fields including `demoMediaId`

### Step 2 — Frontend: types + API

1. **domain.ts**: Add `demoVideoUrl?: string | null` to `Exercise`
2. **training.ts**: Add `updateExercise(id, data)`

### Step 3 — Frontend: video player

1. Create `components/exercise/video-player-modal.tsx`:
   - Receives `videoUrl`, `onClose`
   - Renders `<video controls className="max-w-full max-h-[80vh]">` with `<source>`
   - Close button + Escape key
   - Focus trap inside modal
   - Backdrop click to close

### Step 4 — Frontend: wire into builder

1. **workout-builder-shell.tsx**:
   - In the exercise search results list, next to each `ex.name`, show a small play button (▶) icon if `ex.demoVideoUrl` exists
   - Clicking the play button opens the video player modal
   - Pass the video URL to the modal

### Step 5 — Frontend: create exercise UI

1. Create `components/exercise/create-exercise-dialog.tsx`:
   - Dialog/modal triggered from "New exercise" button on workouts page
   - Fields: name (required), instructions (textarea), muscle groups, equipment
   - File picker for video upload
   - Upload flow: file picker → `uploadFile()` → `updateExercise(id, { demoMediaId: ... })`
   - Loading/error/success states

### Step 6 — Seed script

1. Create `scripts/seed-exercise-videos.mjs`:
   - Reads MP4 files from `C:\Users\mky50\Zebe\Desktop\LEVELFIT\Video and profile picture for testing`
   - Logs in as a coach via API
   - Creates/updates exercises with each video
   - Outputs the created exercise IDs and video URLs

### Step 7 — Run seed + verify

1. Run `node scripts/seed-exercise-videos.mjs` to upload test videos and create exercises
2. Run e2e test to verify exercises appear in builder with video play buttons
3. Open the frontend, navigate to builder, confirm videos play

## Verification

| Check | How |
|---|---|
| Backend compiles | `cd backend && npx tsc --noEmit` → 0 errors |
| Frontend builds | `cd frontend && npm run build` → 0 errors |
| Existing e2e pass | `npx playwright test --project=chromium` → 76 passed |
| Video upload works | Seed script exits 0, exercises created with demoVideoUrl |
| Video plays in builder | Open `/coach/workouts/builder`, search for exercise, click ▶, video plays |

## Rollback

- Schema change is additive (nullable FK) — revert by removing the relation
- All new frontend components are additive — remove imports and delete files
- New routes are additive — remove from router
