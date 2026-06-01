'use client';

import { useState, useMemo } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { EmptyState } from '@/components/states/empty-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { tasksApi } from '@/lib/api/modules/tasks';
import type { TaskAssignment } from '@/lib/types/domain';
import { TaskSubmitDialog } from '@/components/client/task-submit-dialog';
import { CheckSquare, Clock, MessageSquare, Video, ClipboardList, Target, Send, ChevronRight } from 'lucide-react';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  HABIT: <CheckSquare className="h-4 w-4" />,
  VIDEO: <Video className="h-4 w-4" />,
  FORM: <ClipboardList className="h-4 w-4" />,
  REVIEWABLE: <Target className="h-4 w-4" />,
};

const TYPE_LABELS: Record<string, string> = {
  HABIT: 'Habit',
  VIDEO: 'Video review',
  FORM: 'Form',
  REVIEWABLE: 'Reviewable',
};

function isOverdue(a: TaskAssignment): boolean {
  if (!a.dueAt) return false;
  return new Date(a.dueAt) < new Date() && (a.status === 'assigned' || !a.status);
}

function TaskCard({ assignment, onSubmit }: { assignment: TaskAssignment; onSubmit: () => void }) {
  const task = assignment.task;
  const lastSubmission = assignment.submissions?.[assignment.submissions.length - 1];
  const latestFeedback = lastSubmission?.feedback?.[lastSubmission.feedback.length - 1];
  const lastReviewStatus = lastSubmission?.reviewStatus;
  const hasPending = assignment.submissions?.some(s => s.reviewStatus === 'PENDING');
  const showSubmit = !assignment.submissions?.length || lastReviewStatus === 'REJECTED';
  const cardStatus = hasPending ? 'submitted' : latestFeedback ? 'feedback' : 'open';

  return (
    <Card className="transition hover:border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-primary shrink-0">
                {TYPE_ICONS[task?.taskType ?? ''] ?? <Target className="h-4 w-4" />}
              </span>
              <h3 className="font-bold truncate">{task?.title ?? 'Untitled task'}</h3>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary shrink-0">
                {TYPE_LABELS[task?.taskType ?? ''] ?? task?.taskType}
              </span>
            </div>
            {task?.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{task.description}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {assignment.dueAt && (
                <span className={`flex items-center gap-1 ${isOverdue(assignment) ? 'text-pulse' : ''}`}>
                  <Clock className="h-3 w-3" />
                  Due {new Date(assignment.dueAt).toLocaleDateString()}
                </span>
              )}
              {assignment.submissions && assignment.submissions.length > 0 && (
                <span className="flex items-center gap-1">
                  <Send className="h-3 w-3" />
                  {assignment.submissions.length} submission{assignment.submissions.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {latestFeedback?.feedbackText && (
              <div className="mt-2 rounded-lg bg-flow/5 p-2.5 text-sm">
                <span className="text-xs font-bold text-flow">Coach feedback: </span>
                {latestFeedback.feedbackText}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {cardStatus === 'submitted' ? (
              <span className="rounded-full bg-energy/10 px-2.5 py-0.5 text-xs font-bold text-energy">Submitted</span>
            ) : cardStatus === 'feedback' ? (
              <span className="rounded-full bg-flow/10 px-2.5 py-0.5 text-xs font-bold text-flow">Feedback</span>
            ) : (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">Open</span>
            )}
            {showSubmit && !hasPending && (
              <button
                onClick={onSubmit}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition"
              >
                {task?.taskType === 'HABIT' ? 'Complete' : 'Submit'}
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientTasksPage() {
  const result = useAsyncData(() => tasksApi.listTasks(), []);
  const assignments = useMemo(() => (result.data?.items ?? []) as TaskAssignment[], [result.data]);
  const [submitTarget, setSubmitTarget] = useState<TaskAssignment | null>(null);

  const openTasks = useMemo(() => assignments.filter(a => !a.submissions?.length && !isOverdue(a)), [assignments]);
  const overdueTasks = useMemo(() => assignments.filter(isOverdue), [assignments]);
  const submittedTasks = useMemo(() => assignments.filter(a => a.submissions?.some(s => s.reviewStatus === 'PENDING')), [assignments]);
  const feedbackTasks = useMemo(() => assignments.filter(a =>
    a.submissions?.length && !a.submissions?.some(s => s.reviewStatus === 'PENDING')
  ), [assignments]);

  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Tasks" subtitle="Complete assignments, upload videos, and review coach feedback." />

        {result.loading ? (
          <div className="grid gap-4 md:grid-cols-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : result.error ? (
          <ErrorState message={result.error} onRetry={result.reload} />
        ) : assignments.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No tasks yet" description="Your coach hasn't assigned any tasks." />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-muted p-3 text-primary"><CheckSquare className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Open</p>
                      <p className="text-2xl font-black">{openTasks.length + overdueTasks.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-muted p-3 text-pulse"><Clock className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Overdue</p>
                      <p className="text-2xl font-black">{overdueTasks.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-muted p-3 text-energy"><Send className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="text-2xl font-black">{submittedTasks.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-muted p-3 text-flow"><MessageSquare className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Feedback</p>
                      <p className="text-2xl font-black">{feedbackTasks.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 space-y-6">
              {overdueTasks.length > 0 && (
                <section>
                  <h2 className="mb-3 text-lg font-black text-pulse flex items-center gap-2">
                    <Clock className="h-5 w-5" /> Overdue ({overdueTasks.length})
                  </h2>
                  <div className="space-y-2">
                    {overdueTasks.map(a => (
                      <TaskCard key={a.id} assignment={a} onSubmit={() => setSubmitTarget(a)} />
                    ))}
                  </div>
                </section>
              )}

              {openTasks.length > 0 && (
                <section>
                  <h2 className="mb-3 text-lg font-black flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-primary" /> Due ({openTasks.length})
                  </h2>
                  <div className="space-y-2">
                    {openTasks.map(a => (
                      <TaskCard key={a.id} assignment={a} onSubmit={() => setSubmitTarget(a)} />
                    ))}
                  </div>
                </section>
              )}

              {submittedTasks.length > 0 && (
                <section>
                  <h2 className="mb-3 text-lg font-black flex items-center gap-2 text-energy">
                    <Send className="h-5 w-5" /> Submitted ({submittedTasks.length})
                  </h2>
                  <div className="space-y-2">
                    {submittedTasks.map(a => (
                      <TaskCard key={a.id} assignment={a} onSubmit={() => setSubmitTarget(a)} />
                    ))}
                  </div>
                </section>
              )}

              {feedbackTasks.length > 0 && (
                <section>
                  <h2 className="mb-3 text-lg font-black flex items-center gap-2 text-flow">
                    <MessageSquare className="h-5 w-5" /> Feedback ({feedbackTasks.length})
                  </h2>
                  <div className="space-y-2">
                    {feedbackTasks.map(a => (
                      <TaskCard key={a.id} assignment={a} onSubmit={() => setSubmitTarget(a)} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        )}

        {submitTarget && (
          <TaskSubmitDialog
            assignment={submitTarget}
            onClose={() => setSubmitTarget(null)}
            onSubmitted={() => { setSubmitTarget(null); result.reload(); }}
          />
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
