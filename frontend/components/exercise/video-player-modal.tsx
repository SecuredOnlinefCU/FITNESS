'use client';

import { useEffect, useCallback, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

type VideoPlayerModalProps = {
  videoUrl: string;
  onClose: () => void;
};

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.5, 2, 3];

export function VideoPlayerModal({ videoUrl, onClose }: VideoPlayerModalProps) {
  const [zoomIndex, setZoomIndex] = useState(2);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const zoomIn = () => setZoomIndex(i => Math.min(i + 1, ZOOM_LEVELS.length - 1));
  const zoomOut = () => setZoomIndex(i => Math.max(i - 1, 0));
  const resetZoom = () => setZoomIndex(2);

  const scale = ZOOM_LEVELS[zoomIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Exercise demo video"
    >
      <div className="relative max-w-4xl w-full mx-4">
        <div className="flex items-center justify-end gap-2 mb-2">
          <div className="flex items-center gap-1 rounded-lg bg-ink/60 backdrop-blur-sm px-2 py-1">
            <button
              onClick={zoomOut}
              disabled={zoomIndex === 0}
              className="rounded p-1 text-bone/70 hover:text-bone transition disabled:opacity-30"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs text-bone/70 min-w-[3rem] text-center tabular-nums">{Math.round(scale * 100)}%</span>
            <button
              onClick={zoomIn}
              disabled={zoomIndex === ZOOM_LEVELS.length - 1}
              className="rounded p-1 text-bone/70 hover:text-bone transition disabled:opacity-30"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={resetZoom}
              className="ml-1 rounded p-1 text-bone/70 hover:text-bone transition"
              aria-label="Reset zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-ink/60 backdrop-blur-sm p-1.5 text-bone/70 hover:text-bone transition"
            aria-label="Close video"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div
          className="overflow-auto rounded-2xl bg-black shadow-2xl"
          style={{ maxHeight: '80vh' }}
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: scale > 1 ? `${100 / scale}%` : '100%',
            }}
          >
            <video
              controls
              autoPlay
              className="w-full block"
            >
              <source src={videoUrl} />
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}
