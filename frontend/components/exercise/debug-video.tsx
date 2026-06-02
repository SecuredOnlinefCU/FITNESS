'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { VideoPlayerModal } from '@/components/exercise/video-player-modal';

export function DebugVideoPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [testUrl, setTestUrl] = useState('');
  const [selectedTest, setSelectedTest] = useState('w3schools');

  const testUrls = {
    w3schools: 'https://www.w3schools.com/html/movie.mp4',
    bunny: 'https://test-videos.co.uk/vids/bigbuckbaby/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    // Add a webm test if needed
    // webm: 'https://test-videos.co.uk/vids/bigbuckbaby/webm/360/Big_Buck_Bunny_360_10s_1MB.webm'
  };

  const handleOpenVideo = () => {
    setTestUrl(testUrls[selectedTest as keyof typeof testUrls]);
    setIsOpen(true);
  };

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black">Debug Video Player</h1>
      
      <div className="bg-card/50 border border-border/20 rounded-xl p-4">
        <h2 className="font-black mb-4">Test Videos</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="w3schools"
                checked={selectedTest === 'w3schools'}
                onChange={(e) => setSelectedTest(e.target.value)}
                className="h-4 w-4 text-primary"
              />
              <span>W3Schools MP4 (known working)</span>
            </label>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="bunny"
                checked={selectedTest === 'bunny'}
                onChange={(e) => setSelectedTest(e.target.value)}
                className="h-4 w-4 text-primary"
              />
              <span>Big Buck Bunny MP4</span>
            </label>
          </div>
          {/* 
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="webm"
                checked={selectedTest === 'webm'}
                onChange={(e) => setSelectedTest(e.target.value)}
                className="h-4 w-4 text-primary"
              />
              <span>Big Buck Bunny WebM</span>
            </label>
          </div>
          */}
        </div>
        <Button 
          onClick={handleOpenVideo}
          className="w-full"
        >
          Test Selected Video
        </Button>
      </div>
      
      {isOpen && (
        <VideoPlayerModal 
          videoUrl={testUrl} 
          onClose={() => setIsOpen(false)}
        />
      )}
      
      {testUrl && (
        <div className="mt-6">
          <h2 className="font-black mb-4">Current Test URL</h2>
          <div className="bg-black/30 rounded-xl p-4">
            <p className="text-xs text-bone/50 mb-1">URL:</p>
            <code className="block text-xs text-bone break-all">{testUrl}</code>
          </div>
        </div>
      )}
    </div>
  );
}