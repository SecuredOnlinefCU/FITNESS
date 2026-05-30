'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setError('');
    setLoading(true);
    try { await signIn(email, password); }
    catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally { setLoading(false); }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-3xl border border-border bg-card p-8">
        <h1 className="text-2xl font-black tracking-tight">Log in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back — pick up where you left off.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {error && (
            <div role="alert" className="rounded-2xl border border-pulse/20 bg-pulse/10 px-4 py-3 text-sm text-pulse">{error}</div>
          )}

          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-bold text-foreground">Email</label>
            <input
              id="login-email"
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

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-bold text-foreground">Password</label>
              <Link href="/forgot-password" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Forgot?</Link>
            </div>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Logging in\u2026' : 'Log in'}</Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account?{' '}
          <Link href="/signup" className="font-bold text-foreground transition-colors hover:text-primary">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
