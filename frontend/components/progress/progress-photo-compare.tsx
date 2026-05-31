'use client';

import { useState, useCallback } from 'react';
import { Image, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProgressPhoto } from '@/lib/types/domain';

type CompareMode = 'side-by-side' | 'swipe';

function photoUrl(photo: ProgressPhoto): string | null {
  const url = photo.media?.cdnUrl || photo.media?.thumbnailUrl || null;
  return url;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function ProgressPhotoCompare({ photos, onClose }: { photos: ProgressPhoto[]; onClose: () => void }) {
  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(Math.min(1, photos.length - 1));
  const [mode, setMode] = useState<CompareMode>('side-by-side');
  const [sliderPos, setSliderPos] = useState(50);

  const before = photos[beforeIndex];
  const after = photos[afterIndex];
  const beforeImg = before ? photoUrl(before) : null;
  const afterImg = after ? photoUrl(after) : null;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== 'swipe') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, x)));
  }, [mode]);

  const gap = before && after ? daysBetween(before.capturedAt, after.capturedAt) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="flex h-full w-full flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" onClick={onClose} className="text-white">
            <X className="mr-2 h-4 w-4" /> Close
          </Button>
          <div className="flex items-center gap-2">
            <button onClick={() => setMode('side-by-side')} className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${mode === 'side-by-side' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}>Side by side</button>
            <button onClick={() => setMode('swipe')} className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${mode === 'swipe' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}>Swipe</button>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
          {!beforeImg && !afterImg ? (
            <div className="flex flex-col items-center gap-3 text-white/50">
              <Image className="h-16 w-16" />
              <p className="text-lg font-bold">No photos available</p>
            </div>
          ) : mode === 'side-by-side' ? (
            <div className="flex h-full w-full max-w-5xl gap-2">
              {[before, after].map((photo, i) => (
                <div key={i} className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-black/40">
                  {photo && photoUrl(photo) ? (
                    <img src={photoUrl(photo)!} alt={`Photo ${i === 0 ? 'before' : 'after'}`} className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/30"><Image className="h-10 w-10" /><span className="text-sm">{i === 0 ? 'Select before' : 'Select after'}</span></div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="font-bold text-white">{i === 0 ? 'Before' : 'After'}</p>
                    {photo && <p className="text-sm text-white/70">{formatDate(photo.capturedAt)}{i > 0 && before && ` (${gap} day gap)`}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative h-full w-full max-w-3xl overflow-hidden rounded-2xl" onMouseMove={handleMouseMove}>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                {afterImg ? (
                  <img src={afterImg} alt="After" className="h-full w-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-white/30"><Image className="h-10 w-10" /><span className="text-sm">No after photo</span></div>
                )}
              </div>
              <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
                {beforeImg ? (
                  <img src={beforeImg} alt="Before" className="h-full w-full object-contain" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-black/60 text-white/30"><span className="text-sm">No before photo</span></div>
                )}
              </div>
              <div
                className="absolute top-0 bottom-0 w-1 cursor-col-resize bg-white shadow-lg"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg">
                  <ChevronLeft className="h-4 w-4 text-black" />
                  <ChevronRight className="h-4 w-4 text-black" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="font-bold text-white">Swipe to compare</p>
                <p className="text-sm text-white/70">{formatDate(before.capturedAt)} → {formatDate(after.capturedAt)} ({gap} days)</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 px-4 py-3">
          <select
            value={beforeIndex}
            onChange={(e) => { const v = Number(e.target.value); setBeforeIndex(v); if (v >= afterIndex) setAfterIndex(Math.min(v + 1, photos.length - 1)); }}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white focus:outline-none"
          >
            {photos.map((p, i) => <option key={p.id} value={i}>Before: {formatDate(p.capturedAt)}</option>)}
          </select>
          <select
            value={afterIndex}
            onChange={(e) => { const v = Number(e.target.value); setAfterIndex(v); if (v <= beforeIndex) setBeforeIndex(Math.max(v - 1, 0)); }}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white focus:outline-none"
          >
            {photos.map((p, i) => <option key={p.id} value={i}>After: {formatDate(p.capturedAt)}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
