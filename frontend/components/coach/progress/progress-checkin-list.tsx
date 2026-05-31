'use client';

import { useState } from 'react';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { progressApi } from '@/lib/api/modules/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardCheck } from 'lucide-react';

export function ProgressCheckinList({ clientUserId }: { clientUserId?: string }) {
  const result = useAsyncData(() => progressApi.listCheckins(clientUserId), [clientUserId]);
  const items = result.data?.items ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-black">Check-ins</h2>
        </div>
        {result.loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading check-ins...</p>
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No check-ins yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {items.slice(0, 10).map((c: any) => (
              <div key={c.id}>
                <button
                  onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-border p-3 text-left transition hover:bg-muted"
                >
                  <div>
                    <p className="font-bold text-sm">{c.form?.title ?? 'Check-in'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(c.submittedAt).toLocaleString()}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{expanded === c.id ? '▲' : '▼'}</span>
                </button>
                {expanded === c.id && (
                  <div className="mt-1 rounded-xl bg-muted p-4 text-sm space-y-2">
                    {c.answersJson && typeof c.answersJson === 'object' ? (
                      Object.entries(c.answersJson).map(([key, val]: [string, any]) => (
                        <div key={key}>
                          <span className="font-bold text-muted-foreground capitalize">{key.replace(/_/g, ' ')}: </span>
                          <span>{String(val)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">{String(c.answersJson)}</p>
                    )}
                    {c.notes && <p className="mt-2 text-muted-foreground italic">{c.notes}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
