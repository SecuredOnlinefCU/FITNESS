'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut, LayoutDashboard, Home, Dumbbell, Activity, TrendingUp, Apple, BookOpen, Newspaper, CheckSquare, MessageSquare, CreditCard, Bell, Users, Brain, AlertTriangle, Layers, FileText, Megaphone, Shield, Flag, ClipboardList, Truck, Webhook, UserCog, BarChart3 } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { LevelFitMark } from '@/components/levelfitness/logo';
import type { UserRole } from '@/lib/types/auth';

type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> };

const clientLinks: NavItem[] = [
  { label: 'Today', href: '/client/today', icon: LayoutDashboard },
  { label: 'Home', href: '/client/home', icon: Home },
  { label: 'Workouts', href: '/client/workouts', icon: Dumbbell },
  { label: 'Recovery', href: '/client/recovery', icon: Activity },
  { label: 'Progress', href: '/client/progress', icon: TrendingUp },
  { label: 'Nutrition', href: '/client/nutrition', icon: Apple },
  { label: 'Program', href: '/client/program', icon: BookOpen },
  { label: 'Feed', href: '/client/feed', icon: Newspaper },
  { label: 'Tasks', href: '/client/tasks', icon: CheckSquare },
  { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { label: 'Billing', href: '/client/billing', icon: CreditCard },
  { label: 'Notifications', href: '/client/notifications', icon: Bell },
];

const coachLinks: NavItem[] = [
  { label: 'Command center', href: '/coach/home', icon: Home },
  { label: 'Client dossiers', href: '/coach/clients', icon: Users },
  { label: 'Recovery', href: '/coach/recovery', icon: Activity },
  { label: 'Intelligence', href: '/coach/intelligence', icon: Brain },
  { label: 'Risk signals', href: '/coach/risk-signals', icon: AlertTriangle },
  { label: 'Workouts', href: '/coach/workouts', icon: Dumbbell },
  { label: 'Programs', href: '/coach/programs', icon: Layers },
  { label: 'Tasks', href: '/coach/tasks', icon: CheckSquare },
  { label: 'Progress', href: '/coach/progress', icon: TrendingUp },
  { label: 'Nutrition', href: '/coach/nutrition', icon: Apple },
  { label: 'Feed', href: '/coach/feed', icon: Megaphone },
  { label: 'Packages', href: '/coach/packages', icon: CreditCard },
  { label: 'Client health', href: '/coach/client-health', icon: Shield },
  { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
];

const adminLinks: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: BarChart3 },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
  { label: 'Audit logs', href: '/admin/audit-logs', icon: ClipboardList },
  { label: 'Delivery logs', href: '/admin/delivery-logs', icon: Truck },
  { label: 'Feature flags', href: '/admin/feature-flags', icon: Flag },
  { label: 'Webhooks', href: '/admin/webhooks', icon: Webhook },
];

function linkList(items: NavItem[], pathname: string) {
  return items.map((item) => {
    const Icon = item.icon;
    const active = pathname === item.href || pathname.startsWith(item.href + '/');
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
          active
            ? 'bg-primary/10 text-primary'
            : 'text-bone-fade hover:bg-ink-800 hover:text-bone'
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {item.label}
      </Link>
    );
  });
}

export function DashboardSidebar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  let links: NavItem[] = [];
  if (user?.role === 'client') links = clientLinks;
  else if (user?.role === 'super_admin') links = adminLinks;
  else links = coachLinks;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 py-5">
        <LevelFitMark size={28} />
        <span className="text-lg font-black tracking-tight">LevelFITness</span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {linkList(links, pathname)}
      </nav>
      <div className="border-t border-line px-3 py-4">
        <div className="mb-3 px-3 text-xs text-bone-fade">
          {user?.firstName || user?.email}
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-bone-fade transition-colors hover:bg-ink-800 hover:text-bone"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-xl border border-line bg-ink-900 p-2.5 text-bone md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 -translate-x-full border-r border-line bg-ink-950 transition-transform md:static md:translate-x-0 ${
          open ? 'translate-x-0' : ''
        }`}
      >
        <div className="relative h-full">
          <button
            onClick={() => setOpen(false)}
            className="absolute right-3 top-4 rounded-xl p-1.5 text-bone-fade hover:text-bone md:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
          {sidebar}
        </div>
      </aside>
    </>
  );
}
