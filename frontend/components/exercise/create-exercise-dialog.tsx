'use client';

import { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trainingApi } from '@/lib/api/modules/training';
import { uploadFile } from '@/lib/api/modules/media';

type CreateExerciseDialogProps = {
  onClose: () => void;
  onCreated: () => void;
};

export function CreateExerciseDialog({ onClose, onCreated }: CreateExerciseDialogProps) {
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [muscleGroups, setMuscleGroups] = useState('');
  const [equipment, setEquipment] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    if (!name.trim()) return;
    setUploading(true);
    setStatus('Creating exercise...');
    try {
      let demoVideoUrl: string | undefined;
      if (videoFile) {
        setStatus('Uploading video...');
        const result = await uploadFile(videoFile);
        demoVideoUrl = result.url;
      }
      setStatus('Saving exercise...');
      await trainingApi.createExercise({
        name: name.trim(),
        instructions: instructions.trim() || undefined,
        muscleGroups: muscleGroups.trim() || undefined,
        equipment: equipment.trim() || undefined,
        demoVideoUrl,
      });
      setStatus('Exercise created!');
      onCreated();
      onClose();
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to create exercise.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Create exercise"
    >
      <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">New exercise</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Name <span className="text-pulse">*</span></label>
            <Input placeholder="e.g. Barbell Bench Press" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-semibold">Instructions</label>
            <textarea
              className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="How to perform this exercise..."
              rows={3}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Muscle group</label>
              <Input placeholder="e.g. Chest" value={muscleGroups} onChange={e => setMuscleGroups(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold">Equipment</label>
              <Input placeholder="e.g. Barbell" value={equipment} onChange={e => setEquipment(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">Demo video</label>
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={e => setVideoFile(e.target.files?.[0] ?? null)}
            />
            <div
              onClick={() => fileRef.current?.click()}
              className="mt-1 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground hover:border-primary/30 hover:bg-muted transition"
            >
              <Upload className="h-5 w-5 text-primary" />
              {videoFile ? <span className="text-foreground">{videoFile.name}</span> : <span>Click to upload a demo video</span>}
            </div>
          </div>
        </div>

        {status && <p className="text-sm text-muted-foreground">{status}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={uploading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || uploading}>
            {uploading ? 'Saving...' : 'Create exercise'}
          </Button>
        </div>
      </div>
    </div>
  );
}
