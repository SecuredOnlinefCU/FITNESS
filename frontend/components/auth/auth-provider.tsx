'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearTokens, getAccessToken, setTokens } from '@/lib/auth/token-storage';
import { authApi } from '@/lib/api/modules/auth';
import type { AuthUser } from '@/lib/types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { email: string; password: string; role: 'client' | 'coach' | 'assistant_coach'; displayName: string }) => Promise<void>;
  signOut: () => void;
};
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => { async function load() { try { if (!getAccessToken()) return; const me: any = await authApi.me(); const role = me?.roles?.[0]?.role?.name || me?.role || 'client'; setUser({ id: me.id, email: me.email, role }); } catch { clearTokens(); } finally { setLoading(false); } } load(); }, []);
  async function signIn(email: string, password: string) { const session = await authApi.login({ email, password }); setTokens(session.accessToken, session.refreshToken); setUser(session.user); router.push('/dashboard'); }
  async function signUp(input: { email: string; password: string; role: 'client' | 'coach' | 'assistant_coach'; displayName: string }) { const session = await authApi.signup(input); setTokens(session.accessToken, session.refreshToken); setUser(session.user); router.push('/dashboard'); }
  function signOut() { clearTokens(); setUser(null); router.push('/login'); }
  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used inside AuthProvider'); return ctx; }
