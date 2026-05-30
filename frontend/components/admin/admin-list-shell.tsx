'use client';

import { useAsyncData } from '@/hooks/data/use-async-data';
import { Card, CardContent } from '@/components/ui/card';
import { ListSkeleton } from '@/components/states/skeleton';
import { EmptyState } from '@/components/states/empty-state';
import { ErrorState } from '@/components/states/error-state';

type Props = {
  title: string;
  description: string;
  loader: () => Promise<{ items: any[] }>;
  renderItem?: (item: any) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function AdminListShell({ title, description, loader, renderItem, emptyTitle = 'Nothing here yet', emptyDescription = 'Records will appear here when available.' }: Props) {
  const result = useAsyncData(loader, []);

  if (result.loading) return <ListSkeleton rows={5} />;
  if (result.error) return <ErrorState message={result.error} onRetry={result.reload} />;

  const items = result.data?.items || [];
  if (!items.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4">
          <h2 className="text-xl font-black">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id || index} className="rounded-2xl border border-border p-4">
              {renderItem ? renderItem(item) : <pre className="overflow-auto text-xs text-muted-foreground">{JSON.stringify(item, null, 2)}</pre>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
