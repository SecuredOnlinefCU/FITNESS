'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { EmptyState } from '@/components/states/empty-state';
import { Button } from '@/components/ui/button';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { tasksApi } from '@/lib/api/modules/tasks';
import type { Task, TaskAssignment, TaskSubmission } from '@/lib/types/domain';
import { Clock, CheckSquare, MessageSquare, ThumbsUp, RefreshCw, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const REVIEW_LABELS: Record<string, string> = { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Needs revision' };
const TYPE_LABELS: Record<string, string> = { HABIT: 'Habit', VIDEO: 'Video', FORM: 'Form', REVIEWABLE: 'Reviewable' };

type FlatSubmission = {
  submission: TaskSubmission;
  assignment: TaskAssignment;
  task: Task;
};

export default function CoachTasksReviewPage() {
  const result = useAsyncData(() => tasksApi.listTasks(), []);
  const tasks = (result.data?.items ?? []) as Task[];
  const [reviewState, setReviewState] = useState<{ submissionId: string; status: 'APPROVED' | 'REJECTED'; feedback: string; saving: boolean } | null>(null);

  const submissions: FlatSubmission[] = [];
  for (const t of tasks) {
    for (const a of t.assignments ?? []) {
      for (const s of a.submissions ?? []) {
        submissions.push({ submission: s, assignment: a, task: t });
      }
    }
  }

  const pendingSubmissions = submissions.filter(s => s.submission.reviewStatus === 'PENDING');
  const videoSubmissions = submissions.filter(s => s.task.taskType === 'VIDEO');
  const reviewedSubmissions = submissions.filter(s => s.submission.reviewStatus === 'APPROVED' || s.submission.reviewStatus === 'REJECTED');

  async function handleReview(submissionId: string, reviewStatus: 'APPROVED' | 'REJECTED', feedback: string) {
    setReviewState({ submissionId, status: reviewStatus, feedback, saving: true });
    try {
      await tasksApi.reviewSubmission(submissionId, { reviewStatus, feedbackText: feedback || undefined });
      setReviewState(null);
      result.reload();
    } catch {
      setReviewState(prev => prev ? { ...prev, saving: false } : null);
    }
  }

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Task review" subtitle="Review client submissions and send feedback." />

        {result.loading ? (
          <div className="grid gap-4 md:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : result.error ? (
          <ErrorState message={result.error} onRetry={result.reload} />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-muted p-3 text-energy"><Clock className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending review</p>
                      <p className="text-2xl font-black">{pendingSubmissions.length}</p>
                      <p className="text-xs text-muted-foreground">Awaiting your feedback</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-muted p-3 text-flow"><CheckSquare className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Video reviews</p>
                      <p className="text-2xl font-black">{videoSubmissions.length}</p>
                      <p className="text-xs text-muted-foreground">From video-type tasks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-muted p-3 text-primary"><MessageSquare className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reviewed</p>
                      <p className="text-2xl font-black">{reviewedSubmissions.length}</p>
                      <p className="text-xs text-muted-foreground">Approved or needs revision</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {pendingSubmissions.length > 0 && (
              <section className="mt-6">
                <h2 className="mb-3 text-lg font-black flex items-center gap-2 text-energy">
                  <Clock className="h-5 w-5" /> Review queue ({pendingSubmissions.length})
                </h2>
                <div className="space-y-3">
                  {pendingSubmissions.map(({ submission, assignment, task }) => {
                    const clientName = assignment.clientUser
                      ? `${assignment.clientUser.firstName} ${assignment.clientUser.lastName}`
                      : 'Unknown client';
                    const isSaving = reviewState?.submissionId === submission.id && reviewState.saving;
                    const showForm = reviewState?.submissionId === submission.id;

                    return (
                      <Card key={submission.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold">{task.title}</h3>
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                                  {TYPE_LABELS[task.taskType] ?? task.taskType}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {clientName}
                                {submission.submittedAt && <> &middot; {new Date(submission.submittedAt).toLocaleDateString()}</>}
                              </p>
                              {submission.bodyText && (
                                <p className="mt-2 rounded-xl bg-muted p-3 text-sm">{submission.bodyText}</p>
                              )}
                            </div>
                            <span className="shrink-0 rounded-full bg-energy/10 px-2.5 py-0.5 text-xs font-bold text-energy">
                              Pending
                            </span>
                          </div>

                          {showForm ? (
                            <div className="mt-3 space-y-3 border-t border-border pt-3">
                              <textarea
                                className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                                placeholder="Write feedback..."
                                value={reviewState.feedback}
                                onChange={e => setReviewState({ ...reviewState, feedback: e.target.value })}
                              />
                              <div className="flex gap-2">
                                <Button
                                  disabled={isSaving}
                                  onClick={() => handleReview(submission.id, 'APPROVED', reviewState.feedback)}
                                >
                                  <ThumbsUp className="mr-1.5 h-4 w-4" />
                                  {isSaving ? 'Saving...' : 'Approve'}
                                </Button>
                                <Button
                                  variant="danger"
                                  disabled={isSaving}
                                  onClick={() => handleReview(submission.id, 'REJECTED', reviewState.feedback)}
                                >
                                  <RefreshCw className="mr-1.5 h-4 w-4" />
                                  {isSaving ? 'Saving...' : 'Needs revision'}
                                </Button>
                                <Button variant="ghost" onClick={() => setReviewState(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 flex gap-2">
                              <Button onClick={() => setReviewState({ submissionId: submission.id, status: 'APPROVED', feedback: '', saving: false })}>
                                <ThumbsUp className="mr-1.5 h-4 w-4" />Review
                              </Button>
                              <Link
                                href={`/coach/tasks/${task.id}/feedback?submissionId=${submission.id}`}
                                className="inline-flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted/80 transition"
                              >
                                Full page <ChevronRight className="h-3 w-3" />
                              </Link>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {pendingSubmissions.length === 0 && submissions.length > 0 && (
              <div className="mt-6">
                <EmptyState title="All caught up" description="No submissions pending review." />
              </div>
            )}
          </>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
