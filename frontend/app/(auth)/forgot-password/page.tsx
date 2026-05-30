'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (!res.ok) throw new Error('Could not send reset email.');
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally { setLoading(false); }
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
            <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a reset link to <span className="text-foreground">{email}</span>. Expires in 1 hour.
          </p>
          <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-foreground transition-colors hover:text-primary">
            <ArrowLeft size={16} />
            Back to log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-3xl border border-border bg-card p-8">
        <h1 className="text-2xl font-black tracking-tight">Forgot password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter your email and we&apos;ll send you a reset link.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {error && (
            <div role="alert" className="rounded-2xl border border-pulse/20 bg-pulse/10 px-4 py-3 text-sm text-pulse">{error}</div>
          )}

          <div>
            <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-bold text-foreground">Email</label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Sending\u2026' : 'Send reset link'}</Button>
        </form>

        <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft size={16} />
          Back to log in
        </Link>
      </div>
    </div>
  );
}
