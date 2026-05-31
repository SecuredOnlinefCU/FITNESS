'use client';

import { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { tasksApi } from '@/lib/api/modules/tasks';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TaskFeedbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const submissionId = searchParams.get('submissionId') ?? '';

  const [feedbackText, setFeedbackText] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus('Submitting review...');
    try {
      await tasksApi.reviewSubmission(submissionId, { reviewStatus, feedbackText: feedbackText.trim() || undefined });
      setStatus('Review submitted!');
      setTimeout(() => router.push(`/coach/tasks/${id}`), 1000);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to submit review.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <div className="mb-4">
          <Link href={`/coach/tasks/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> Back to task
          </Link>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 p-5">
              <h2 className="text-xl font-black">Review submission</h2>
              <p className="text-sm text-muted-foreground">Provide feedback and approve or request revisions.</p>

              <div>
                <p className="mb-2 text-sm font-bold text-muted-foreground">Decision</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setReviewStatus('APPROVED')}
                    className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${reviewStatus === 'APPROVED' ? 'bg-success text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                    Approved
                  </button>
                  <button type="button" onClick={() => setReviewStatus('REJECTED')}
                    className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${reviewStatus === 'REJECTED' ? 'bg-pulse text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                    Needs revision
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-bold text-muted-foreground">Feedback</p>
                <textarea
                  className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Write your feedback here..."
                  rows={4}
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                />
              </div>

              {status && <p className="text-sm text-muted-foreground">{status}</p>}

              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Submitting...' : 'Submit review'}
                </Button>
                <Link href={`/coach/tasks/${id}`}>
                  <Button variant="ghost" type="button">Cancel</Button>
                </Link>
              </div>
            </CardContent>
          </form>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
