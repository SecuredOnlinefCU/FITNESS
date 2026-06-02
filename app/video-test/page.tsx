'use client';

import { useState } from 'react';
import { VideoPlayerModal } from '@/components/exercise/video-player-modal';
import { Button } from '@/components/ui/button';

export default function VideoTestPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('https://www.w3schools.com/html/movie.mp4');

  return (
    <div className="min-h-screen bg-ink-950 text-bone p-8">
      <h1 className="text-2xl font-black mb-6">Video Player Test</h1>
      <div className="max-w-4xl mx-auto">
        <div className="bg-card/50 border border-border/20 rounded-xl p-6">
          <h2 className="font-black mb-4">Test Controls</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Video URL:</label>
              <input 
                type="text" 
                value={videoUrl} 
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full p-2 bg-black/30 border border-border/30 rounded text-bone"
              />
            </div>
            <Button 
              onClick={() => setIsOpen(true)}
              className="w-full"
            >
              Open Video Player Modal
            </Button>
          </div>
        </div>
        
        {isOpen && (
          <VideoPlayerModal 
            videoUrl={videoUrl} 
            onClose={() => setIsOpen(false)}
          />
        )}
        
        <div className="mt-8">
          <h2 className="font-black mb-4">Direct Video Test (for comparison)</h2>
          <div className="bg-black/50 rounded-xl overflow-hidden">
            <video 
              controls 
              autoPlay 
              playsInline 
              className="w-full"
              style={{ maxHeight: '400px' }}
            >
              <source 
                src={videoUrl} 
                type="video/mp4" 
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}