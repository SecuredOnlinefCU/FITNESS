'use client';

import { adminExtendedApi } from '@/lib/api/modules/admin-extended';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { AdminStatCard } from './admin-stat-card';
import { AdminActionGrid } from './admin-action-grid';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';

export function AdminDashboardLive() {
  const result = useAsyncData(() => adminExtendedApi.dashboard(), []);

  if (result.loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <CardSkeleton /><CardSkeleton /><CardSkeleton />
      </div>
    );
  }

  if (result.error) return <ErrorState message={result.error} onRetry={result.reload} />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard label="Users" value={result.data?.users ?? 0} helper="Total platform accounts." />
        <AdminStatCard label="Programs" value={result.data?.programs ?? 0} helper="Created coaching programs." />
        <AdminStatCard label="Open reports" value={result.data?.openReports ?? 0} helper="Needs moderation review." />
      </div>
      <AdminActionGrid />
    </div>
  );
}
