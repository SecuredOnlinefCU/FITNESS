'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import type { UserRole } from '@/lib/types/auth';
export function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) {
  const { user, loading } = useAuth(); const router = useRouter();
  useEffect(() => { if (loading) return; if (!user) router.replace('/login'); if (user && roles?.length && !roles.includes(user.role)) { const home = user.role === 'coach' ? '/coach/home' : user.role === 'admin' ? '/admin' : '/client/home'; router.replace(home); } }, [loading, user, roles, router]);
  if (loading) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading...</div>;
  if (!user) return null; if (roles?.length && !roles.includes(user.role)) return null; return <>{children}</>;
}
