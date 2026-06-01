'use client';

import { useState } from 'react';
import { tasksApi } from '@/lib/api/modules/tasks';
import type { TaskAssignment } from '@/lib/types/domain';
import { Button } from '@/components/ui/button';
import { CheckSquare, Video, ClipboardList, Target, Upload } from 'lucide-react';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  HABIT: <CheckSquare className="h-5 w-5" />,
  VIDEO: <Video className="h-5 w-5" />,
  FORM: <ClipboardList className="h-5 w-5" />,
  REVIEWABLE: <Target className="h-5 w-5" />,
};

const SUBMIT_LABELS: Record<string, string> = {
  HABIT: 'Mark as done',
  VIDEO: 'Submit video',
  FORM: 'Submit form',
  REVIEWABLE: 'Submit work',
};

export function TaskSubmitDialog({
  assignment,
  onClose,
  onSubmitted,
}: {
  assignment: TaskAssignment;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const task = assignment.task;
  const taskType = task?.taskType ?? 'REVIEWABLE';
  const [bodyText, setBodyText] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit() {
    setSaving(true);
    setStatus('Submitting...');
    try {
      await tasksApi.submitTask(assignment.id, {
        bodyText: bodyText.trim() || undefined,
      });
      setStatus('Submitted!');
      setTimeout(onSubmitted, 800);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to submit.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            {TYPE_ICONS[taskType] ?? <Target className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-lg font-black">{task?.title ?? 'Task'}</h2>
            <p className="text-sm text-muted-foreground">{SUBMIT_LABELS[taskType] ?? 'Submit'}</p>
          </div>
        </div>

        {task?.description && (
          <p className="mt-3 text-sm text-muted-foreground">{task.description}</p>
        )}

        <div className="mt-4 space-y-3">
          {taskType === 'HABIT' ? (
            <p className="text-sm text-muted-foreground">Mark this habit as completed for today?</p>
          ) : (
            <div>
              <label className="mb-1.5 block text-sm font-bold text-foreground">
                {taskType === 'VIDEO' ? 'Video description' : 'Your response'}
              </label>
              <textarea
                className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-y"
                placeholder={
                  taskType === 'VIDEO'
                    ? 'Describe the video you are submitting...'
                    : taskType === 'FORM'
                    ? 'Fill in your response...'
                    : taskType === 'REVIEWABLE'
                    ? 'Add notes or description...'
                    : ''
                }
                value={bodyText}
                onChange={e => setBodyText(e.target.value)}
              />
            </div>
          )}

          {taskType === 'VIDEO' && (
            <div className="rounded-xl border-2 border-dashed border-border bg-muted p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Video upload coming soon</p>
              <p className="text-xs text-muted-foreground">Use the description field for now</p>
            </div>
          )}
        </div>

        {status && <p className="mt-3 text-sm text-muted-foreground">{status}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Submitting...' : SUBMIT_LABELS[taskType] ?? 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
}
