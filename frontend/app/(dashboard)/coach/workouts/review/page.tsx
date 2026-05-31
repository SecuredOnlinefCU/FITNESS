'use client';

import { useState, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { Button } from '@/components/ui/button';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { trainingApi } from '@/lib/api/modules/training';
import { CheckCircle, ChevronDown, ChevronUp, MessageSquare, Search, User } from 'lucide-react';
import type { WorkoutSession } from '@/lib/types/domain';

function sessionHasReview(session: WorkoutSession): boolean {
  return Boolean(session.coachReview && session.coachReview.trim().length > 0);
}

function SessionReviewCard({ session, onSave }: { session: WorkoutSession; onSave: (id: string, review: string) => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const [review, setReview] = useState(session.coachReview ?? '');
  const [saving, setSaving] = useState(false);

  const workoutName = session.assignment?.workout?.title ?? 'Workout';
  const completedDate = session.completedAt ? new Date(session.completedAt).toLocaleDateString() : '—';

  return (
    <Card className={sessionHasReview(session) ? 'border-flow/20' : ''}>
      <CardContent className="p-4">
        <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between text-left" aria-expanded={expanded}>
          <div className="flex items-center gap-3">
            {sessionHasReview(session) ? <CheckCircle className="h-5 w-5 text-flow" /> : <MessageSquare className="h-5 w-5 text-muted-foreground" />}
            <div>
              <p className="font-bold">{workoutName}</p>
              <p className="text-xs text-muted-foreground">{completedDate} &middot; {session.sets?.length ?? 0} sets</p>
            </div>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {expanded && (
          <div className="mt-4 space-y-3">
                {session.sets && session.sets.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground">Sets</p>
                    {session.sets.map((set) => (
                      <div key={set.id} className="flex items-center gap-4 rounded-lg bg-muted px-3 py-2 text-sm">
                        <span className="w-6 font-bold text-muted-foreground">{set.setNumber}</span>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${set.setType === 'warmup' ? 'bg-flow/10 text-flow' : set.setType === 'drop' ? 'bg-pulse/10 text-pulse' : set.setType === 'failure' ? 'bg-energy/10 text-energy' : 'bg-primary/10 text-primary'}`}>
                          {set.setType ?? 'working'}
                        </span>
                        {set.reps != null && <span>{set.reps} reps</span>}
                        {set.weight != null && <span>@ {set.weight} kg</span>}
                        {set.rpe != null && <span className="text-muted-foreground">RPE {set.rpe}</span>}
                        {set.notes && <span className="ml-auto text-xs italic text-muted-foreground">{set.notes}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
              <p className="text-sm text-muted-foreground">No sets recorded</p>
            )}

            <div>
              <label htmlFor={`review-${session.id}`} className="mb-1 block text-xs font-bold text-muted-foreground">
                Coach feedback
              </label>
              <textarea
                id={`review-${session.id}`}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-line bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Leave feedback on this session..."
              />
            </div>

            <Button onClick={async () => { setSaving(true); try { await onSave(session.id, review); } finally { setSaving(false); } }} disabled={saving || review === (session.coachReview ?? '')}>
              {saving ? 'Saving...' : (sessionHasReview(session) ? 'Update feedback' : 'Save feedback')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CoachWorkoutReviewPage() {
  const clients = useAsyncData(() => trainingApi.listCoachClients(), []);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [savedReviewIds, setSavedReviewIds] = useState<Set<string>>(new Set());

  const sessions = useAsyncData(
    () => selectedClientId ? trainingApi.listSessionsForCoach(selectedClientId) : Promise.resolve({ items: [] }),
    [selectedClientId],
  );

  const handleSaveReview = useCallback(async (sessionId: string, review: string) => {
    await trainingApi.updateSessionReview(sessionId, review);
    setSavedReviewIds((prev) => new Set(prev).add(sessionId));
  }, []);

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach']}>
      <DashboardShell>
        <CoachPageHeader
          title="Workout results review"
          subtitle="Review completed workout sessions and leave feedback for your clients"
        />

        <div className="mb-6">
          <label htmlFor="client-select" className="mb-2 block text-sm font-bold">
            Select client
          </label>
          <div className="relative max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              id="client-select"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full rounded-xl border border-line bg-card py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Choose a client...</option>
              {(clients.data?.items ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>
        </div>

        {clients.loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {clients.error && (
          <ErrorState message={clients.error} onRetry={clients.reload} />
        )}

        {selectedClientId && sessions.loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {selectedClientId && sessions.error && (
          <ErrorState message={sessions.error} onRetry={sessions.reload} />
        )}

        {selectedClientId && !sessions.loading && !sessions.error && (sessions.data?.items ?? []).length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <User className="h-10 w-10 text-muted-foreground" />
              <p className="font-bold">No completed sessions yet</p>
              <p className="text-sm text-muted-foreground">Completed workouts will appear here for review.</p>
            </CardContent>
          </Card>
        )}

        {selectedClientId && !sessions.loading && !sessions.error && (sessions.data?.items ?? []).length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {sessions.data!.items.length} completed session{sessions.data!.items.length !== 1 ? 's' : ''}
            </p>
            {sessions.data!.items.map((session) => (
              <SessionReviewCard key={session.id} session={session} onSave={handleSaveReview} />
            ))}
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
