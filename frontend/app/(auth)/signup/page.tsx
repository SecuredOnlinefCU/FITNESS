'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function SignupPage() {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password || !displayName) { setError('Please fill in all fields.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      await signUp({ email, password, role: 'client', displayName });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not create your account. Please try again.';
      setError(message);
    } finally { setLoading(false); }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Start your fitness journey with LevelFITness.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {error && (
            <div role="alert" className="rounded-xl border border-pulse/30 bg-pulse/10 px-4 py-3 text-sm text-pulse">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium text-foreground">Full name</label>
            <Input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              aria-required="true"
              aria-describedby={error && !displayName ? 'signup-error' : undefined}
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
            <Input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              aria-describedby={error && !email ? 'signup-error' : undefined}
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
            <Input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
              aria-describedby={error && !password ? 'signup-error' : undefined}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating account\u2026' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-foreground hover:text-signal transition-colors">Log in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
