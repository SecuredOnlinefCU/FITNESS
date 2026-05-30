import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { StatCard } from '@/components/client/stat-card';

export function LiveStatGrid({
  loading,
  error,
  stats,
  onRetry,
}: {
  loading?: boolean;
  error?: string | null;
  stats?: Array<{ label: string; value: string; helper?: string }>;
  onRetry?: () => void;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {(stats || []).map((stat) => <StatCard key={stat.label} {...stat} />)}
    </div>
  );
}
