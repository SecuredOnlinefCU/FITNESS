'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearTokens, getAccessToken, setTokens } from '@/lib/auth/token-storage';
import { authApi } from '@/lib/api/modules/auth';
import type { AuthUser, SignUpInput } from '@/lib/types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => void;
  googleSignIn: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        if (!getAccessToken()) return;
        const me: any = await authApi.me();
        const role = me?.roles?.[0]?.role?.name || me?.role || 'client';
        setUser({
          id: me.id,
          email: me.email,
          role,
          firstName: me.firstName || null,
          lastName: me.lastName || null,
          avatarUrl: me.avatarUrl || null,
        });
      } catch {
        clearTokens();
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function signIn(email: string, password: string) {
    const session = await authApi.login({ email, password });
    setTokens(session.accessToken, session.refreshToken);
    setUser(session.user);
    router.push(getHomePath(session.user.role));
  }

  async function signUp(input: SignUpInput) {
    const session = await authApi.signup(input);
    setTokens(session.accessToken, session.refreshToken);
    setUser(session.user);
    router.push(getHomePath(session.user.role));
  }

  function signOut() {
    clearTokens();
    setUser(null);
    router.push('/login');
  }

  async function googleSignIn() {
    const { url } = await authApi.googleUrl();
    window.location.href = url;
  }

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, googleSignIn }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function getHomePath(role: string): string {
  switch (role) {
    case 'coach': return '/coach/home';
    case 'super_admin': return '/admin';
    default: return '/client/home';
  }
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
