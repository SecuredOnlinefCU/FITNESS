'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Video, Square, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadChatMedia } from '@/lib/api/modules/media';

export function VideoRecorder({ onSend, onCancel }: { onSend: (mediaAssetId: string, durationMs: number) => void; onCancel: () => void }) {
  const [state, setState] = useState<'idle' | 'recording' | 'preview'>('idle');
  const [duration, setDuration] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const previewRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (previewRef.current) previewRef.current.srcObject = stream;
      chunks.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorder.current = recorder;

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const videoBlob = new Blob(chunks.current, { type: 'video/webm' });
        setBlob(videoBlob);
        setState('preview');
        if (timer.current) clearInterval(timer.current);
      };

      recorder.start();
      setState('recording');
      setDuration(0);
      const startTime = Date.now();
      timer.current = setInterval(() => setDuration(Math.floor((Date.now() - startTime) / 1000)), 1000);
    } catch {
      setState('idle');
    }
  }, []);

  useEffect(() => {
    if (state === 'preview' && blob && playbackRef.current) {
      playbackRef.current.src = URL.createObjectURL(blob);
    }
  }, [state, blob]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current?.state === 'recording') mediaRecorder.current.stop();
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorder.current.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (timer.current) clearInterval(timer.current);
    setState('idle');
    setBlob(null);
    setDuration(0);
  }, []);

  const sendRecording = useCallback(async () => {
    if (!blob) return;
    setUploading(true);
    try {
      const result = await uploadChatMedia(blob, `video-${Date.now()}.webm`, 'video/webm', 'VIDEO');
      onSend(result.mediaAssetId, duration);
    } catch {
      setUploading(false);
    }
  }, [blob, duration, onSend]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (state === 'idle') {
    return (
      <Button variant="ghost" size="sm" type="button" aria-label="Record video message" onClick={startRecording}>
        <Video className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded-2xl border border-border bg-card p-3 shadow-sm">
      {state === 'recording' ? (
        <>
          <video ref={previewRef} autoPlay muted className="h-48 w-full rounded-xl bg-black object-cover" />
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-pulse rounded-full bg-pulse" />
            <span className="text-sm font-medium tabular-nums text-pulse">{fmt(duration)}</span>
            <Button variant="secondary" size="sm" type="button" aria-label="Stop recording" onClick={stopRecording}>
              <Square className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" type="button" aria-label="Cancel recording" onClick={cancelRecording}>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <video ref={playbackRef} controls className="h-48 w-full rounded-xl bg-black object-cover" />
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-primary" />
            <span className="text-sm tabular-nums text-muted-foreground">{fmt(duration)}</span>
            <Button variant="primary" size="sm" type="button" disabled={uploading} onClick={sendRecording}>
              {uploading ? 'Sending...' : 'Send'}
            </Button>
            <Button variant="ghost" size="sm" type="button" aria-label="Discard video" onClick={onCancel}>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
