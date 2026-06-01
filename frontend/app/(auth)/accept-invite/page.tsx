'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clientsApi } from '@/lib/api/modules/clients';
import { authApi } from '@/lib/api/modules/auth';
import { setTokens } from '@/lib/auth/token-storage';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

type Status = 'loading' | 'set-password' | 'success' | 'error' | 'no-token';

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    async function accept() {
      try {
        const result = await clientsApi.acceptInvite(token!);
        setTokens(result.accessToken, result.refreshToken);
        setFirstName(result.user.firstName || '');

        if (result.isNewUser) {
          setStatus('set-password');
        } else {
          setStatus('success');
          setTimeout(() => {
            router.push('/client/home');
          }, 1500);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to accept invite');
        setStatus('error');
      }
    }

    accept();
  }, [token, router]);

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.setPassword(password);
      setStatus('success');
      setTimeout(() => {
        router.push('/onboarding');
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to set password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h1 className="mt-4 text-xl font-black">Accepting invite...</h1>
            <p className="mt-2 text-sm text-muted-foreground">Setting up your account.</p>
          </>
        )}

        {status === 'set-password' && (
          <form onSubmit={handleSetPassword} noValidate className="text-left">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-success" />
            <h1 className="mb-1 text-center text-xl font-black">Welcome{firstName ? `, ${firstName}` : ''}!</h1>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Set a password so you can log back in later.
            </p>

            <div className="space-y-3">
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  autoFocus
                  placeholder="At least 8 characters"
                  className="text-base"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
                  Confirm password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Type it again"
                  className="text-base"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-3 text-sm text-pulse">
                {error}
              </p>
            )}

            <Button type="submit" className="mt-6 w-full" disabled={submitting}>
              {submitting ? 'Setting password...' : 'Continue'}
            </Button>
          </form>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-success" />
            <h1 className="mt-4 text-xl font-black">You&rsquo;re all set!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Redirecting...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-pulse" />
            <h1 className="mt-4 text-xl font-black">Invite failed</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button className="mt-6" onClick={() => router.push('/login')}>
              Go to login
            </Button>
          </>
        )}

        {status === 'no-token' && (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-pulse" />
            <h1 className="mt-4 text-xl font-black">Invalid invite link</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This link is missing a token. Please request a new invite from your coach.
            </p>
            <Button className="mt-6" onClick={() => router.push('/login')}>
              Go to login
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
