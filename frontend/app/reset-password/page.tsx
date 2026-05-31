'use client';

import { useState, type FormEvent, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-black tracking-tight">Invalid link</h1>
          <p className="mt-2 text-sm text-muted-foreground">This reset link is missing or malformed.</p>
          <Link href="/forgot-password" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-foreground transition-colors hover:text-primary">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Reset failed. The link may have expired.');
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally { setLoading(false); }
  }

  if (success) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="text-2xl font-black tracking-tight">Password updated</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your password has been reset. Sign in with your new password.</p>
          <Button className="mt-6 w-full" onClick={() => router.push('/login')}>Sign in</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8">
        <h1 className="text-2xl font-black tracking-tight">Set new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Must be at least 8 characters.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {error && (
            <div role="alert" className="rounded-2xl border border-pulse/20 bg-pulse/10 px-4 py-3 text-sm text-pulse">{error}</div>
          )}

          <div>
            <label htmlFor="reset-password" className="mb-1.5 block text-sm font-bold text-foreground">New password</label>
            <input
              id="reset-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="reset-confirm" className="mb-1.5 block text-sm font-bold text-foreground">Confirm password</label>
            <input
              id="reset-confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Resetting\u2026' : 'Reset password'}</Button>
        </form>

        <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft size={16} />
          Back to log in
        </Link>
      </div>
    </div>
  );
}
