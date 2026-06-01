'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { clientsApi } from '@/lib/api/modules/clients';
import { setTokens } from '@/lib/auth/token-storage';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    async function accept() {
      try {
        const result = await clientsApi.acceptInvite(token!);
        setTokens(result.accessToken, result.refreshToken);
        setStatus('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to accept invite');
        setStatus('error');
      }
    }

    accept();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h1 className="mt-4 text-xl font-black">Accepting invite...</h1>
            <p className="mt-2 text-sm text-muted-foreground">Setting up your account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-success" />
            <h1 className="mt-4 text-xl font-black">Welcome to LevelFit!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account is ready. Redirecting to your dashboard...
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
