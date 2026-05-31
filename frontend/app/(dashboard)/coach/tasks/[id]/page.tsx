'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { Button } from '@/components/ui/button';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { tasksApi } from '@/lib/api/modules/tasks';
import { TaskAssignDialog } from '@/components/coach/task-assign-dialog';
import { ArrowLeft, UserPlus, CheckSquare, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';

const TYPE_LABELS: Record<string, string> = { HABIT: 'Habit', VIDEO: 'Video', FORM: 'Form', REVIEWABLE: 'Reviewable' };
const REVIEW_LABELS: Record<string, string> = { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Needs revision' };

export default function TaskDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const result = useAsyncData(() => tasksApi.getTask(id), [id]);
  const task = result.data;
  const [showAssign, setShowAssign] = useState(false);

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <div className="mb-4">
          <Link href="/coach/tasks" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> Back to tasks
          </Link>
        </div>

        {result.loading ? (
          <div className="space-y-3"><CardSkeleton /><CardSkeleton /></div>
        ) : result.error ? (
          <ErrorState message={result.error} onRetry={result.reload} />
        ) : task ? (
          <>
            <CoachPageHeader title={task.title} subtitle={task.description ?? 'No description'} />

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-muted p-3 text-primary"><CheckSquare className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="text-lg font-black">{TYPE_LABELS[task.taskType] ?? task.taskType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-muted p-3 text-primary"><Clock className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Assignments</p>
                      <p className="text-lg font-black">{task.assignments?.length ?? 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-muted p-3 text-primary"><MessageSquare className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending review</p>
                      <p className="text-lg font-black">{task.assignments?.reduce((a: number, as: any) => a + (as.submissions?.filter((s: any) => s.reviewStatus === 'PENDING').length ?? 0), 0) ?? 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-5">
              <Button onClick={() => setShowAssign(true)}><UserPlus className="mr-2 h-4 w-4" />Assign to client</Button>
            </div>

            {task.assignments && task.assignments.length > 0 && (
              <div className="mt-5 space-y-3">
                <h2 className="text-lg font-black">Assignments</h2>
                {task.assignments.map((a: any) => (
                  <Card key={a.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold">{a.clientUser?.name ?? 'Unknown client'}</p>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>Status: {a.status}</span>
                            {a.dueAt && <span>Due: {new Date(a.dueAt).toLocaleDateString()}</span>}
                            <span>Submissions: {a.submissions?.length ?? 0}</span>
                          </div>
                        </div>
                        <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${a.status === 'assigned' ? 'bg-primary/10 text-primary' : a.status === 'completed' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {a.status}
                        </span>
                      </div>
                      {a.submissions && a.submissions.length > 0 && (
                        <div className="mt-3 space-y-2 border-t border-border pt-3">
                          {a.submissions.map((s: any) => (
                            <div key={s.id} className="flex items-center justify-between rounded-xl bg-muted p-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm truncate">{s.bodyText ?? 'No text'}</p>
                                <p className="text-xs text-muted-foreground">{new Date(s.submittedAt).toLocaleString()}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-3">
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${s.reviewStatus === 'PENDING' ? 'bg-energy/10 text-energy' : s.reviewStatus === 'APPROVED' ? 'bg-success/10 text-success' : 'bg-pulse/10 text-pulse'}`}>
                                  {REVIEW_LABELS[s.reviewStatus] ?? s.reviewStatus}
                                </span>
                                <Link href={`/coach/tasks/${id}/feedback?submissionId=${s.id}`} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition">
                                  Review
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {showAssign && (
              <TaskAssignDialog
                taskId={id}
                onClose={() => setShowAssign(false)}
                onAssigned={() => { setShowAssign(false); result.reload(); }}
              />
            )}
          </>
        ) : null}
      </DashboardShell>
    </ProtectedRoute>
  );
}
