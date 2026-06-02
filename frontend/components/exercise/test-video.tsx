'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function TestVideoPlayer() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testUrls = [
    // Test with a known working video URL
    'https://www.w3schools.com/html/movie.mp4',
    // Test with a webm format
    'https://test-videos.co.uk/vids/bigbuckbaby/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4'
  ];

  const handlePlayTest = async () => {
    // Clear previous error
    setError(null);
    
    // Try each test URL
    for (const url of testUrls) {
      try {
        console.log('Testing URL:', url);
        setVideoUrl(url);
        // Give it a moment to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        // If we got here without error, the URL works
        return;
      } catch (err) {
        console.error('Failed to load URL:', url, err);
        continue;
      }
    }
    
    setError('All test URLs failed to load');
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Video Player Test</h2>
      <Button 
        onClick={handlePlayTest} 
        className="w-full mb-4"
      >
        Test Video Playback
      </Button>
      
      {videoUrl && (
        <div className="border rounded-lg p-4 bg-black/50">
          <p className="text-sm text-bone/50 mb-2">Testing URL:</p>
          <code className="block text-xs text-bone break-all mb-2">{videoUrl}</code>
          <video 
            controls 
            autoPlay 
            playsInline 
            className="w-full"
            onError={(e) => {
              setError('Video element reported error');
              console.error('Video error:', e);
            }}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      
      {error && (
        <div className="bg-pulse/5 border border-pulse/20 rounded-xl p-4">
          <p className="text-pulse font-medium">Test Error:</p>
          <p className="text-xs text-pulse/60">{error}</p>
        </div>
      )}
    </div>
  );
}