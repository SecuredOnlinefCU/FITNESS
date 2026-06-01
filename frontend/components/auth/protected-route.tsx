'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './auth-provider';
import type { UserRole } from '@/lib/types/auth';
export function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) {
  const { user, loading } = useAuth(); const router = useRouter(); const pathname = usePathname();
  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    if (user && roles?.length && !roles.includes(user.role)) {
      const home = user.role === 'coach' ? '/coach/home' : user.role === 'super_admin' ? '/admin' : '/client/home';
      router.replace(home);
      return;
    }
    if (user.role === 'client' && !pathname.startsWith('/onboarding') && !localStorage.getItem('levelfit_onboarding_complete')) {
      router.replace('/onboarding');
    }
  }, [loading, user, roles, router, pathname]);
  if (loading) return <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">Loading...</div>;
  if (!user) return null; if (roles?.length && !roles.includes(user.role)) return null; return <>{children}</>;
}
