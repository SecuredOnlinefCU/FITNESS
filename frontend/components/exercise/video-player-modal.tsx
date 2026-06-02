'use client';

import { useEffect, useCallback, useState } from 'react';
import { X } from 'lucide-react';
import { getAccessToken } from '@/lib/auth/token-storage';
import { env } from '@/lib/config/env';

type VideoPlayerModalProps = {
  videoUrl: string;
  onClose: () => void;
};

export function VideoPlayerModal({ videoUrl, onClose }: VideoPlayerModalProps) {
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

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

  // Handle empty or invalid videoUrl
  if (!videoUrl || videoUrl.trim() === '') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        role="dialog"
        aria-modal="true"
        aria-label="Exercise demo video"
      >
        <div className="relative max-w-4xl w-full mx-4 p-6">
          <div className="flex items-center justify-end mb-4">
            <button
              onClick={onClose}
              className="rounded-lg bg-ink/60 backdrop-blur-sm p-1.5 text-bone/70 hover:text-bone transition"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="text-center py-8">
            <p className="text-bone">No video URL provided</p>
          </div>
        </div>
      </div>
    );
  }

  // Detect SharePoint URLs and route through backend proxy
  const isSharePointUrl = /\.sharepoint\.com/i.test(videoUrl);
  const token = typeof window !== 'undefined' ? getAccessToken() : null;
  const proxyUrl = isSharePointUrl && token
    ? `${env.apiUrl}/api/media/sharepoint-proxy?url=${encodeURIComponent(videoUrl)}&token=${encodeURIComponent(token)}`
    : videoUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Exercise demo video"
    >
      <div className="relative max-w-4xl w-full mx-4 p-4">
        <div className="flex items-center justify-end mb-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-ink/60 backdrop-blur-sm p-1.5 text-bone/70 hover:text-bone transition"
            aria-label="Close video"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {videoError ? (
          <div className="bg-pulse/5 border border-pulse/20 rounded-xl p-6">
            <p className="text-pulse font-medium">Error loading video</p>
            <p className="text-xs text-pulse/60 mt-2">{videoError}</p>
          </div>
        ) : (
          <div className="bg-black/50 rounded-xl overflow-hidden">
            <video
              controls
              autoPlay
              playsInline
              onCanPlay={() => setIsVideoLoaded(true)}
              onError={(e) => {
                setVideoError('Failed to load video. The file may be missing, corrupted, or in an unsupported format.');
                console.error('Video error details:', e, 'URL:', isSharePointUrl ? '(proxied SharePoint)' : videoUrl);
              }}
              onWaiting={() => setIsVideoLoaded(false)}
              onPlaying={() => setIsVideoLoaded(true)}
              className="w-full"
            >
              <source src={proxyUrl} type="video/mp4" />
              <source src={proxyUrl} type="video/webm" />
            </video>
          </div>
        )}

        {!videoError && !isVideoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-bone">
            Loading video...
          </div>
        )}
      </div>
    </div>
  );
}
