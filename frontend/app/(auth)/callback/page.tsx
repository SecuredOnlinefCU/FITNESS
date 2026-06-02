'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setTokens } from '@/lib/auth/token-storage';
import { authApi } from '@/lib/api/modules/auth';

function parseHashParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const hash = window.location.hash.replace(/^#/, '');
  const params = new URLSearchParams(hash);
  const result: Record<string, string> = {};
  for (const [key, val] of params) result[key] = val;
  return result;
}

function CallbackHandler() {
  const router = useRouter();
  const [message, setMessage] = useState('Completing sign-in\u2026');

  useEffect(() => {
    const params = parseHashParams();
    const accessToken = params.accessToken;
    const refreshToken = params.refreshToken;
    const error = params.error;

    if (error) {
      setMessage(error === 'google_not_configured' ? 'Google sign-in is not configured yet.' : 'Sign-in failed. Please try again.');
      return;
    }

    if (!accessToken || !refreshToken) {
      setMessage('Invalid sign-in response.');
      return;
    }

    setTokens(accessToken, refreshToken);

    if (window.opener) {
      (async () => {
        try {
          const me: any = await authApi.me();
          const role = me?.roles?.[0]?.role?.name || me?.role || 'client';
          window.opener.postMessage(
            { type: 'google-oauth', user: { id: me.id, email: me.email, role, firstName: me.firstName || null, lastName: me.lastName || null, avatarUrl: me.avatarUrl || null } },
            window.location.origin,
          );
        } catch {
          window.opener.postMessage({ type: 'google-oauth', error: 'Failed to load profile' }, window.location.origin);
        }
        window.close();
      })();
    } else {
      authApi.me().then((me: any) => {
        const role = me?.roles?.[0]?.role?.name || me?.role || 'client';
        const home = role === 'coach' ? '/coach/home' : role === 'super_admin' ? '/admin' : '/client/home';
        router.push(home);
      }).catch(() => router.push('/client/home'));
    }
  }, [router]);

  return <p className="text-sm text-muted-foreground">{message}</p>;
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Completing sign-in\u2026</p>}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
