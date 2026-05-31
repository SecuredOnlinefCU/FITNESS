'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { tasksApi } from '@/lib/api/modules/tasks';
import { TaskCreateForm } from '@/components/coach/task-create-form';
import { TaskAssignDialog } from '@/components/coach/task-assign-dialog';
import { CheckSquare, Repeat, Clock, Trash2, UserPlus, Eye } from 'lucide-react';
import Link from 'next/link';

interface TaskAssignmentItem {
  id: string;
  status: string;
  clientUserId: string;
  clientUser?: { id: string; firstName: string; lastName: string; email: string };
  submissions: { id: string; reviewStatus: string }[];
}

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  taskType: string;
  assignments?: TaskAssignmentItem[];
}

interface TaskListResponse {
  items: TaskItem[];
}

const TYPE_LABELS: Record<string, string> = { HABIT: 'Habit', VIDEO: 'Video', FORM: 'Form', REVIEWABLE: 'Reviewable' };

export default function CoachTasksPage() {
  const result = useAsyncData(() => tasksApi.listTasks() as Promise<TaskListResponse>, []);
  const tasks = result.data?.items ?? [];
  const [showCreate, setShowCreate] = useState(false);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this task?')) return;
    await tasksApi.deleteTask(id);
    result.reload();
  }

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Task builder" subtitle="Assign habits, videos, forms, and reviewable work to clients." />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><CheckSquare className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Task library</p>
                  <p className="text-2xl font-black">{tasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><Clock className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Active assignments</p>
                  <p className="text-2xl font-black">{tasks.reduce((s: number, t: TaskItem) => s + (t.assignments?.filter((a: TaskAssignmentItem) => a.status === 'assigned').length ?? 0), 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><Repeat className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending review</p>
                  <p className="text-2xl font-black">{tasks.reduce((s: number, t: TaskItem) => s + (t.assignments?.reduce((a: number, as: TaskAssignmentItem) => a + (as.submissions?.filter((su: { reviewStatus: string }) => su.reviewStatus === 'PENDING').length ?? 0), 0) ?? 0), 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {showCreate && (
          <div className="mt-5">
            <TaskCreateForm onCreated={() => { setShowCreate(false); result.reload(); }} />
          </div>
        )}

        {result.loading ? (
          <div className="mt-5 space-y-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : result.error ? (
          <div className="mt-5"><ErrorState message={result.error} onRetry={result.reload} /></div>
        ) : tasks.length === 0 ? (
          <div className="mt-5 text-center rounded-2xl bg-muted p-6">
            <p className="font-bold text-muted-foreground">No tasks yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Create your first task to assign to clients.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <h3 className="text-lg font-black">Your tasks</h3>
            {tasks.map((t: TaskItem) => {
              const activeAssignments = t.assignments?.filter((a: TaskAssignmentItem) => a.status === 'assigned').length ?? 0;
              const pendingReview = t.assignments?.reduce((a: number, as: TaskAssignmentItem) => a + (as.submissions?.filter((s: { reviewStatus: string }) => s.reviewStatus === 'PENDING').length ?? 0), 0) ?? 0;
              return (
                <Card key={t.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold truncate">{t.title}</p>
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary shrink-0">
                          {TYPE_LABELS[t.taskType] ?? t.taskType}
                        </span>
                      </div>
                      {t.description && <p className="mt-0.5 text-sm text-muted-foreground truncate">{t.description}</p>}
                      <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                        <span>{activeAssignments} active</span>
                        {pendingReview > 0 && <span className="text-energy">{pendingReview} pending review</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      <Link href={`/coach/tasks/${t.id}`} className="rounded-xl p-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition" title="View task"><Eye className="h-4 w-4" /></Link>
                      <button className="rounded-xl p-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition" onClick={() => setAssignTarget(t.id)} title="Assign to client"><UserPlus className="h-4 w-4" /></button>
                      <button className="rounded-xl p-2 text-sm text-muted-foreground hover:bg-muted hover:text-pulse transition" onClick={() => handleDelete(t.id)} title="Delete task"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {assignTarget && (
          <TaskAssignDialog
            taskId={assignTarget}
            onClose={() => setAssignTarget(null)}
            onAssigned={() => { setAssignTarget(null); result.reload(); }}
          />
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
