export type ID = string; export type ISODate = string; export type ApiList<T> = { items: T[] };
export type RoleName = 'super_admin' | 'coach' | 'assistant_coach' | 'client';
export type MessageDeliveryStatus = 'queued' | 'connecting' | 'sent' | 'delivered' | 'read' | 'failed';
export type Message = { id: ID; threadId: ID; senderUserId: ID; messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE' | 'SYSTEM'; bodyText?: string | null; mediaAssetId?: string | null; createdAt?: ISODate; deliveryStatus?: MessageDeliveryStatus };
export type Thread = { id: ID; coachUserId: ID; clientUserId: ID; status?: string; messages?: Message[] };
export type MediaAsset = { id: ID; ownerUserId: ID; assetType: 'FEED_IMAGE' | 'FEED_VIDEO' | 'TASK_VIDEO' | 'PROGRESS_PHOTO' | 'EXERCISE_VIDEO' | 'VOICE_NOTE' | 'CHAT_MEDIA'; storageKey?: string; blobUrl?: string | null; mimeType?: string | null; privacyScope?: 'PRIVATE' | 'PROGRAM' | 'PUBLIC'; uploadStatus?: string };
export type Notification = { id: ID; userId: ID; type: string; title: string; body?: string | null; openedAt?: ISODate | null; createdAt?: ISODate };
export type Program = { id: ID; coachUserId: ID; name: string; description?: string | null };
export type Task = { id: ID; coachUserId: ID; title: string; description?: string | null; taskType: string };
export type CoachingPackage = { id: ID; coachUserId: ID; title: string; priceCents: number; currency: string; billingType: 'ONE_TIME' | 'RECURRING'; interval?: 'MONTH' | 'YEAR' | null };
export type MetricEntry = { id: ID; clientUserId: ID; metricType: string; value: number; unit?: string | null; recordedAt?: ISODate };
export type MetricSummary = { metricType: string; label: string; unit: string; latestValue: number; previousValue: number | null; changePercent: number; count: number; category: string };
export type MealLog = { id: ID; clientUserId: ID; mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER'; title?: string | null; calories?: number | null; protein?: number | null; carbs?: number | null; fat?: number | null };
export type Exercise = { id: ID; coachUserId?: ID | null; name: string; instructions?: string | null };
export type Workout = { id: ID; coachUserId: ID; title: string; description?: string | null; programId?: ID | null };
export type IntegrationProvider = 'APPLE_HEALTH' | 'HEALTH_CONNECT' | 'FITBIT' | 'GARMIN' | 'OURA' | 'MYFITNESSPAL' | 'CRONOMETER';

// Workout & Training
export type WorkoutExercise = {
  id: ID;
  workoutId: ID;
  exerciseId: ID;
  exercise?: Exercise | null;
  orderIndex: number;
  prescribedSets?: number | null;
  prescribedReps?: number | null;
  prescribedRestSeconds?: number | null;
  tempo?: string | null;
};

export type WorkoutAssignment = {
  id: ID;
  workoutId: ID;
  clientUserId: ID;
  assignedByUserId: ID;
  status?: string;
  createdAt?: ISODate;
  workout?: Workout & { exercises?: WorkoutExercise[] } | null;
  sessions?: WorkoutSession[];
};

export type WorkoutSession = {
  id: ID;
  assignmentId: ID;
  clientUserId: ID;
  startedAt?: ISODate | null;
  completedAt?: ISODate | null;
  status?: string;
  offlineCreated?: boolean | null;
  assignment?: WorkoutAssignment | null;
  sets?: SetLog[];
};

export type SetLog = {
  id: ID;
  sessionId: ID;
  workoutExerciseId: ID;
  setNumber: number;
  reps?: number | null;
  weight?: number | null;
  rpe?: number | null;
  notes?: string | null;
};

// Recovery
export type RecoverySnapshot = {
  id?: ID;
  userId?: ID;
  metricDate?: string | null;
  provider?: string | null;
  sleepMinutes?: number | null;
  sleepScore?: number | null;
  restingHeartRate?: number | null;
  hrvMs?: number | null;
  steps?: number | null;
  caloriesBurned?: number | null;
  readinessScore?: number | null;
};

// Nutrition
export type NutritionPlan = {
  id: ID;
  coachUserId: ID;
  clientUserId?: ID | null;
  title: string;
  description?: string | null;
  days?: NutritionDay[];
};

export type NutritionDay = {
  id: ID;
  planId: ID;
  dayLabel: string;
  meals?: NutritionMeal[];
};

export type NutritionMeal = {
  id: ID;
  dayId: ID;
  mealType: string;
  title?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
};

export type HydrationLog = {
  id: ID;
  clientUserId: ID;
  amountMl: number;
  loggedAt?: ISODate;
};

// Feed
export type FeedPost = {
  id: ID;
  authorUserId: ID;
  scopeType: 'PROGRAM' | 'COACH_PRIVATE' | 'CHALLENGE';
  scopeId: string;
  postType?: string | null;
  bodyText?: string | null;
  title?: string | null;
  tag?: string | null;
  status?: string | null;
  createdAt?: ISODate;
  media?: MediaAsset[];
};

// Tasks
export type TaskAssignment = {
  id: ID;
  taskId: ID;
  clientUserId: ID;
  status?: string;
  createdAt?: ISODate;
  task?: Task | null;
  submissions?: TaskSubmission[];
};

export type TaskSubmission = {
  id: ID;
  assignmentId: ID;
  clientUserId: ID;
  reviewStatus?: string;
  createdAt?: ISODate;
};

// Billing
export type Subscription = {
  id: ID;
  clientUserId: ID;
  coachUserId: ID;
  packageId: ID;
  status?: string;
  paymentMethod?: string | null;
  package?: CoachingPackage | null;
};

export type Payment = {
  id: ID;
  clientUserId: ID;
  coachUserId: ID;
  packageId?: ID | null;
  amountCents: number;
  currency: string;
  status?: string;
  package?: CoachingPackage | null;
};

// Progress
export type CheckinSubmission = {
  id: ID;
  clientUserId: ID;
  formId?: ID | null;
  form?: unknown | null;
  coachNotes?: unknown[];
  createdAt?: ISODate;
};

export type ProgressPhoto = {
  id: ID;
  clientUserId: ID;
  capturedAt?: ISODate;
  mediaAssetId?: string | null;
  coachNotes?: unknown[];
};

// Intelligence
export type TodayIntelligence = {
  snapshot: RecoverySnapshot | null;
  recommendations: TodayRecommendation[];
  completionScore: number;
};

export type TodayRecommendation = {
  id: string;
  title: string;
  body: string;
  type?: string;
  priority?: number;
};

// FeedPost type helper
export type FeedPostWithCounts = FeedPost & {
  _count?: { comments: number; reactions: number; saves: number };
};
