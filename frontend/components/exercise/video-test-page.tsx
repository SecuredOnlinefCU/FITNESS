import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video Test Page',
  description: 'Test page for video player component',
};

export default function VideoTestPage() {
  return (
    <div className="min-h-screen bg-ink-950 text-bone p-8">
      <h1 className="text-2xl font-black mb-6">Video Player Test</h1>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="bg-card/50 border border-border/20 rounded-xl p-6">
            <h2 className="font-black mb-4">Test 1: Known Working MP4 URL</h2>
            <div className="mb-4">
              <video 
                controls 
                autoPlay 
                playsInline 
                className="w-full rounded-lg border border-black/20"
                style={{ maxHeight: '400px' }}
              >
                <source 
                  src="https://www.w3schools.com/html/movie.mp4" 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="text-sm text-bone/50">
              URL: https://www.w3schools.com/html/movie.mp4
            </p>
          </div>
          
          <div className="bg-card/50 border border-border/20 rounded-xl p-6">
            <h2 className="font-black mb-4">Test 2: WebM Format</h2>
            <div className="mb-4">
              <video 
                controls 
                autoPlay 
                playsInline 
                className="w-full rounded-lg border border-black/20"
                style={{ maxHeight: '400px' }}
              >
                <source 
                  src="https://test-videos.co.uk/vids/bigbuckbaby/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4" 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="text-sm text-bone/50">
              URL: https://test-videos.co.uk/vids/bigbuckbaby/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4
            </p>
          </div>
        </div>
        
        <div className="bg-card/50 border border-border/20 rounded-xl p-6">
          <h2 className="font-black mb-4">Test 3: Our Video Player Component</h2>
          <div className="space-y-4">
            <div className="mb-4">
              <label className="text-sm font-semibold mb-2 block">Video URL:</label>
              <input 
                type="text" 
                value="https://www.w3schools.com/html/movie.mp4"
                onChange={(e) => {
                  // This is just for display, we'll hardcode the URL for now
                }}
                className="w-full p-2 bg-black/30 border border-border/30 rounded text-bone"
                readOnly
              />
            </div>
            <div id="video-player-container">
              {/* Video player will be mounted here by React */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}