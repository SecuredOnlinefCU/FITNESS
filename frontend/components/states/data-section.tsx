import { CardSkeleton } from './skeleton';
import { ErrorState } from './error-state';

export function DataSection<T>({
  loading,
  error,
  data,
  onRetry,
  skeleton,
  children,
}: {
  loading: boolean;
  error?: string | null;
  data: T | null;
  onRetry?: () => void;
  skeleton?: React.ReactNode;
  children: (data: T) => React.ReactNode;
}) {
  if (loading) return <>{skeleton || <CardSkeleton />}</>;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!data) return null;
  return <>{children(data)}</>;
}
