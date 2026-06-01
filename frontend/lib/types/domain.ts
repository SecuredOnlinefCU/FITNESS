export type ID = string; export type ISODate = string; export type ApiList<T> = { items: T[] };
export type RoleName = 'super_admin' | 'coach' | 'assistant_coach' | 'client';
export type MessageDeliveryStatus = 'queued' | 'connecting' | 'sent' | 'delivered' | 'read' | 'failed';
export type Message = { id: ID; threadId: ID; senderUserId: ID; messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE' | 'SYSTEM'; bodyText?: string | null; mediaAssetId?: string | null; createdAt?: ISODate; deliveryStatus?: MessageDeliveryStatus };
export type Thread = { id: ID; coachUserId: ID; clientUserId: ID; status?: string; messages?: Message[] };
export type MediaAsset = { id: ID; ownerUserId: ID; assetType: 'FEED_IMAGE' | 'FEED_VIDEO' | 'TASK_VIDEO' | 'PROGRESS_PHOTO' | 'EXERCISE_VIDEO' | 'VOICE_NOTE' | 'CHAT_MEDIA'; storageKey?: string; blobUrl?: string | null; mimeType?: string | null; privacyScope?: 'PRIVATE' | 'PROGRAM' | 'PUBLIC'; uploadStatus?: string };
export type FeedMedia = { id: ID; postId: ID; ownerUserId: ID; assetType: string; storageKey: string; cdnUrl?: string | null; thumbnailUrl?: string | null; mimeType?: string | null; };
export type Notification = { id: ID; userId: ID; type: string; title: string; body?: string | null; openedAt?: ISODate | null; createdAt?: ISODate };
export type Program = { id: ID; coachUserId: ID; name: string; description?: string | null };
export type ProgramMembership = { id: ID; programId: ID; clientUserId: ID; status: string; joinedAt: ISODate; program?: Program | null };
export type ProgramWeek = { id: ID; programId: ID; weekIndex: number; phaseLabel?: string | null; focus?: string | null; workouts?: Workout[] };
export type Task = { id: ID; coachUserId: ID; title: string; description?: string | null; taskType: string; assignments?: TaskAssignment[] };
export type CoachingPackage = { id: ID; coachUserId: ID; title: string; priceCents: number; currency: string; billingType: 'ONE_TIME' | 'RECURRING'; interval?: 'MONTH' | 'YEAR' | null };
export type MetricEntry = { id: ID; clientUserId: ID; metricType: string; value: number; unit?: string | null; recordedAt?: ISODate };
export type MetricSummary = { metricType: string; label: string; unit: string; latestValue: number; previousValue: number | null; changePercent: number; count: number; category: string };
export type MealLog = { id: ID; clientUserId: ID; mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER'; title?: string | null; calories?: number | null; protein?: number | null; carbs?: number | null; fat?: number | null };
export type Exercise = { id: ID; coachUserId?: ID | null; name: string; instructions?: string | null; demoVideoUrl?: string | null; coachCues?: string | null };
export type Workout = { id: ID; coachUserId: ID; title: string; description?: string | null; programId?: ID | null; weekId?: ID | null; dayIndex?: number | null };
export type IntegrationProvider = 'APPLE_HEALTH' | 'HEALTH_CONNECT' | 'FITBIT' | 'GARMIN' | 'OURA' | 'MYFITNESSPAL' | 'CRONOMETER';

// Workout & Training
export type WorkoutExercise = {
  id: ID;
  workoutId: ID;
  exerciseId: ID;
  exercise?: Exercise | null;
  orderIndex: number;
  prescribedSets?: number | null;
  prescribedReps?: string | null;
  prescribedRestSeconds?: number | null;
  prescribedRpe?: number | null;
  supersetGroupId?: string | null;
  tempo?: string | null;
  notes?: string | null;
};

export type WorkoutAssignment = {
  id: ID;
  workoutId: ID;
  clientUserId: ID;
  assignedByUserId: ID;
  assignedForDate?: string | null;
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
  coachReview?: string | null;
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
  setType?: string | null;
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
  planType?: string;
  title: string;
  notes?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  days?: NutritionDay[];
};

export type NutritionDay = {
  id: ID;
  planId: ID;
  dayIndex: number;
  meals?: NutritionMeal[];
};

export type NutritionMeal = {
  id: ID;
  dayId: ID;
  mealType: string;
  title?: string | null;
  instructions?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  recipeId?: string | null;
};

export type HydrationLog = {
  id: ID;
  clientUserId: ID;
  amountMl: number;
  loggedAt?: ISODate;
};

// Feed
export type FeedPostType = 'COACH_MESSAGE' | 'MILESTONE' | 'CHECK_IN_PROMPT' | 'RECOVERY_ALERT' | 'WORKOUT_ASSIGNED' | 'CHALLENGE_UPDATE' | 'NUTRITION_HACK' | 'PROGRESS_SPOTLIGHT';

export type FeedPostAction = {
  type: string;
  label: string;
  href?: string;
  apiEndpoint?: string;
};

export type FeedPost = {
  id: ID;
  authorUserId: ID;
  scopeType: 'PROGRAM' | 'COACH_PRIVATE' | 'CHALLENGE';
  scopeId: string;
  type: FeedPostType;
  bodyText?: string | null;
  tag?: string | null;
  status?: string | null;
  pinnedAt?: ISODate | null;
  scheduledAt?: ISODate | null;
  createdAt?: ISODate;
  updatedAt?: ISODate;
  media?: FeedMedia[];
  comments?: FeedComment[];
  reactions?: FeedReaction[];
  saves?: FeedSave[];
  _count?: { comments: number; reactions: number; saves: number };
  author?: { firstName: string; lastName: string } | null;
  currentUserReacted?: boolean;
  currentUserSaved?: boolean;
  primaryAction?: FeedPostAction | null;
};

export type FeedComment = {
  id: ID;
  postId: ID;
  authorUserId: ID;
  parentCommentId?: string | null;
  bodyText: string;
  status?: string | null;
  createdAt?: ISODate;
  author?: { firstName: string; lastName: string } | null;
};

export type FeedReaction = {
  id: ID;
  postId: ID;
  userId: ID;
  reactionType: string;
  createdAt?: ISODate;
};

export type FeedSave = {
  id: ID;
  postId: ID;
  userId: ID;
  createdAt?: ISODate;
};

export type MomentumComponent = { label: string; value: number; max: number; color: string };
export type MomentumData = { score: number; components: MomentumComponent[]; trend: 'up' | 'down' | 'stable'; change: number };
export type CoachNudge = { type: string; title: string; message: string; priority: 'high' | 'medium' | 'low'; action?: { label: string; href?: string; apiEndpoint?: string } };
export type PostAnalytics = { postId: string; views: number; reactions: number; comments: number; saves: number; engagementRate: number };

export type ContentReport = {
  id: ID;
  reporterUserId: ID;
  targetType: string;
  targetId: string;
  reasonCode: string;
  notes?: string | null;
  status: string;
  createdAt?: ISODate;
};

// Tasks
export type TaskAssignment = {
  id: ID;
  taskId: ID;
  clientUserId: ID;
  status?: string;
  dueAt?: string | null;
  recurrenceRule?: string | null;
  createdAt?: ISODate;
  task?: Task | null;
  submissions?: TaskSubmission[];
  clientUser?: { id: ID; firstName: string; lastName: string; email: string } | null;
};

export type TaskSubmission = {
  id: ID;
  assignmentId: ID;
  clientUserId: ID;
  bodyText?: string | null;
  mediaAssetId?: string | null;
  submittedAt?: string;
  reviewStatus?: string;
  createdAt?: ISODate;
  feedback?: TaskFeedback[];
};

export type TaskFeedback = {
  id: ID;
  submissionId: ID;
  coachUserId: ID;
  feedbackText?: string | null;
  feedbackMediaAssetId?: string | null;
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
  capturedAt: string;
  mediaAssetId: ID;
  photoType: string;
  notes?: string | null;
  media?: FeedMedia | null;
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

// Client Dossier
export type ClientDossierUser = {
  id: ID;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
  createdAt: ISODate;
  clientProfile?: { userId: ID; displayName: string } | null;
};

export type ClientHealthScore = {
  score: number;
  healthStatus: string;
  adherenceScore: number;
  progressScore: number;
  engagementScore: number;
  paymentScore: number;
};

export type ClientDossier = {
  user: ClientDossierUser;
  healthScore: ClientHealthScore | null;
  riskFlags: { id: ID; flagType: string; severity: string; title: string; body?: string | null; status: string; createdAt: ISODate }[];
  assignments: WorkoutAssignment[];
  sessions: WorkoutSession[];
  metrics: MetricEntry[];
  notes: CoachClientNote[];
  programMemberships: ProgramMembership[];
};

export type CoachClientNote = {
  id: ID;
  coachUserId: ID;
  clientUserId: ID;
  content: string;
  createdAt: ISODate;
};

export type CoachInvite = {
  id: ID;
  coachUserId: ID;
  email: string;
  displayName: string;
  programId?: ID | null;
  status: string;
  createdAt: ISODate;
  expiresAt: ISODate;
  acceptedAt?: ISODate | null;
};

export type ClientGoal = {
  id: ID;
  clientUserId: ID;
  goalType: string;
  title: string;
  targetValue?: number | null;
  targetUnit?: string | null;
  currentValue?: number | null;
  startDate: ISODate;
  targetDate?: ISODate | null;
  status: string;
};

export type MomentumScore = {
  id: ID;
  clientUserId: ID;
  coachUserId: ID;
  score: number;
  trend: "RISING" | "FALLING" | "STABLE";
  performanceScore: number;
  behaviorScore: number;
  engagementScore: number;
  recoveryScore: number;
  snapshotDate: ISODate;
};

export type PlateauResult = {
  exerciseId: ID;
  exerciseName: string;
  status: "PLATEAU" | "DECLINING" | "IMPROVING";
  currentMax: number;
  previousMax: number;
  changePercent: number;
  weeksAtLevel: number;
};

export type ChurnRisk = {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  score: number;
  factors: { factor: string; weight: number; detail: string }[];
};

export type SmartAction = {
  id: ID;
  type: "CHECKIN" | "MESSAGE" | "WORKOUT_ADJUST" | "NUTRITION_ADJUST" | "RECOVERY" | "MILESTONE";
  priority: number;
  title: string;
  body: string;
  actionHref: string;
  reason: string;
};

// Fitness Blueprint
export type FitnessBlueprint = {
  id: ID;
  userId: ID;
  goal: string;
  trainingStyle: string;
  level: string;
  levelConfidence: number;
  equipment: string;
  daysPerWeek: number;
  sessionLength: number;
  split: string;
  injuryExclusions: string[];
  weeklyVolume: Record<string, number>;
  periodization: string;
  recoveryProfile: {
    sleepHours: number;
    stressLevel: number;
    activityLevel: string;
    recommendation: string;
  };
  estimatedTimeline: string | null;
  createdAt: ISODate;
  updatedAt: ISODate;
};

export type OnboardingBlueprintResult = {
  blueprint: FitnessBlueprint;
  split: { name: string; focus: string; muscleGroups: string[] }[];
  recoveryProfile: FitnessBlueprint['recoveryProfile'];
  estimatedTimeline: string;
};
