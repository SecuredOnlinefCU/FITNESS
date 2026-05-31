'use client';

import { useState } from 'react';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { progressApi } from '@/lib/api/modules/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressPhotoCompare } from '@/components/progress/progress-photo-compare';
import { Camera, ScanSearch } from 'lucide-react';
import type { ProgressPhoto } from '@/lib/types/domain';

export function ProgressPhotoGrid({ clientUserId }: { clientUserId?: string }) {
  const result = useAsyncData(() => progressApi.listPhotos(clientUserId), [clientUserId]);
  const items = (result.data?.items ?? []) as ProgressPhoto[];
  const [showCompare, setShowCompare] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-black">Progress photos</h2>
            </div>
            {items.length >= 2 && (
              <button onClick={() => setShowCompare(true)} className="flex items-center gap-1 text-sm font-bold text-primary">
                <ScanSearch className="h-4 w-4" /> Compare
              </button>
            )}
          </div>
          {result.loading ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading photos...</p>
          ) : items.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No progress photos yet.</p>
          ) : (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {items.slice(0, 9).map((p) => (
                <button key={p.id} onClick={() => setSelected(selected === p.id ? null : p.id)}
                  className={`relative aspect-square w-full rounded-xl border-2 transition ${selected === p.id ? 'border-primary' : 'border-border hover:border-primary/50'} overflow-hidden bg-muted`}>
                  {p.media?.cdnUrl ? (
                    <img src={p.media.cdnUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{p.photoType ?? 'Photo'}</div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-[10px] text-white">{new Date(p.capturedAt).toLocaleDateString()}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showCompare && items.length >= 2 && (
        <ProgressPhotoCompare photos={items} onClose={() => setShowCompare(false)} />
      )}
    </>
  );
}
