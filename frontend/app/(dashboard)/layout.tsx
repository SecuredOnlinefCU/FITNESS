import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <DashboardSidebar />
      <div className="flex-1 overflow-x-hidden pt-16 md:pt-0">{children}</div>
    </div>
  );
}
