'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadChatMedia } from '@/lib/api/modules/media';

export function AudioRecorder({ onSend, onCancel }: { onSend: (mediaAssetId: string, durationMs: number) => void; onCancel: () => void }) {
  const [state, setState] = useState<'idle' | 'recording' | 'preview'>('idle');
  const [duration, setDuration] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorder.current = recorder;

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
        setBlob(audioBlob);
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

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current?.state === 'recording') mediaRecorder.current.stop();
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorder.current.stop();
    }
    if (timer.current) clearInterval(timer.current);
    setState('idle');
    setBlob(null);
    setDuration(0);
  }, []);

  const sendRecording = useCallback(async () => {
    if (!blob) return;
    setUploading(true);
    try {
      const result = await uploadChatMedia(blob, `voice-${Date.now()}.webm`, 'audio/webm', 'VOICE');
      onSend(result.mediaAssetId, duration);
    } catch {
      setUploading(false);
    }
  }, [blob, duration, onSend]);

  if (state === 'idle') {
    return (
      <Button variant="ghost" size="sm" type="button" aria-label="Record voice message" onClick={startRecording}>
        <Mic className="h-4 w-4" />
      </Button>
    );
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-sm">
      {state === 'recording' ? (
        <>
          <div className="h-3 w-3 animate-pulse rounded-full bg-pulse" />
          <span className="text-sm font-medium tabular-nums text-pulse">{fmt(duration)}</span>
          <Button variant="secondary" size="sm" type="button" aria-label="Stop recording" onClick={stopRecording}>
            <Square className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" type="button" aria-label="Cancel recording" onClick={cancelRecording}>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </>
      ) : (
        <>
          <Play className="h-4 w-4 text-primary" />
          <span className="text-sm tabular-nums text-muted-foreground">{fmt(duration)}</span>
          <Button variant="primary" size="sm" type="button" disabled={uploading} onClick={sendRecording}>
            {uploading ? 'Sending...' : 'Send'}
          </Button>
          <Button variant="ghost" size="sm" type="button" aria-label="Discard recording" onClick={onCancel}>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </>
      )}
    </div>
  );
}
