'use client';

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

type VideoPlayerModalProps = {
  videoUrl: string;
  onClose: () => void;
};

export function VideoPlayerModal({ videoUrl, onClose }: VideoPlayerModalProps) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Exercise demo video"
    >
      <div className="relative max-w-3xl w-full mx-4">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-bone/70 hover:text-bone transition"
          aria-label="Close video"
        >
          <X className="h-6 w-6" />
        </button>
        <video
          controls
          autoPlay
          className="w-full rounded-2xl bg-black shadow-2xl"
          style={{ maxHeight: '80vh' }}
        >
          <source src={videoUrl} />
        </video>
      </div>
    </div>
  );
}
