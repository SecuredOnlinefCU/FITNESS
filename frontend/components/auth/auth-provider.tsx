'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearTokens, getAccessToken, setTokens } from '@/lib/auth/token-storage';
import { authApi } from '@/lib/api/modules/auth';
import { getMsalInstance } from '@/lib/auth/msal-config';
import type { AuthUser, SignUpInput } from '@/lib/types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => void;
  googleSignIn: () => Promise<void>;
  microsoftSignIn: () => Promise<void>;
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
  try {
    const session = await authApi.signup(input);
    setTokens(session.accessToken, session.refreshToken);
    setUser(session.user);
    if (session.user.role === 'client') {
      router.push('/onboarding');
    } else {
      router.push(getHomePath(session.user.role));
    }
  } catch (error) {
    console.error('Signup failed:', error);
    throw error;
  }
}

  function signOut() {
    clearTokens();
    setUser(null);
    if (typeof window !== 'undefined') localStorage.removeItem('levelfit_onboarding_complete');
    const msal = getMsalInstance();
    msal.logoutPopup().catch(() => {});
    router.push('/login');
  }

  async function googleSignIn() {
    const { url } = await authApi.googleUrl();
    window.location.href = url;
  }

  async function microsoftSignIn() {
    const msal = getMsalInstance();
    const response = await msal.loginPopup({
      scopes: ['openid', 'profile', 'email'],
    });
    const idToken = response.idToken;
    if (!idToken) throw new Error('No ID token received from Microsoft');
    const session = await authApi.microsoft(idToken);
    setTokens(session.accessToken, session.refreshToken);
    setUser(session.user);
    if (session.user.role === 'client' && session.isNewUser) {
      router.push('/onboarding');
    } else {
      router.push(getHomePath(session.user.role));
    }
  }

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, googleSignIn, microsoftSignIn }),
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
