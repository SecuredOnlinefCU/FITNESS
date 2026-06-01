'use client';

import { useState } from 'react';
import { Image, Video, X, Loader2, Film } from 'lucide-react';
import type { FeedPostType } from '@/lib/types/domain';
import { feedApi } from '@/lib/api/modules/feed';
import { uploadFile } from '@/lib/api/modules/media';
import { Button } from '@/components/ui/button';

const postTypes: { value: FeedPostType; label: string }[] = [
  { value: 'COACH_MESSAGE', label: 'Coach message' },
  { value: 'MILESTONE', label: 'Milestone' },
  { value: 'CHECK_IN_PROMPT', label: 'Check-in prompt' },
  { value: 'RECOVERY_ALERT', label: 'Recovery alert' },
  { value: 'WORKOUT_ASSIGNED', label: 'Workout assigned' },
  { value: 'CHALLENGE_UPDATE', label: 'Challenge update' },
  { value: 'NUTRITION_HACK', label: 'Nutrition hack' },
  { value: 'PROGRESS_SPOTLIGHT', label: 'Progress spotlight' },
];

export function CreatePostDialog({
  programId,
  onClose,
  onCreated,
}: {
  programId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [postType, setPostType] = useState<FeedPostType>('COACH_MESSAGE');
  const [bodyText, setBodyText] = useState('');
  const [tag, setTag] = useState('');
  const [files, setFiles] = useState<{ file: File; preview: string; cdnUrl?: string; storageKey?: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const newFiles = picked.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  }

  function removeFile(idx: number) {
    setFiles(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function handleSubmit() {
    if (!bodyText.trim() && files.length === 0) return;
    setSaving(true);
    setStatus('Creating post...');
    try {
      const media = [];
      for (const f of files) {
        const { url, key } = await uploadFile(f.file);
        const isVideo = f.file.type.startsWith('video/');
        media.push({ assetType: isVideo ? 'FEED_VIDEO' : 'FEED_IMAGE', storageKey: key, cdnUrl: url, mimeType: f.file.type, thumbnailUrl: isVideo ? undefined : undefined });
      }
      await feedApi.createPost({
        scopeType: 'PROGRAM',
        scopeId: programId,
        type: postType,
        bodyText: bodyText.trim() || undefined,
        tag: tag.trim() || undefined,
        media: media.length > 0 ? media : undefined,
      });
      setStatus('Posted!');
      setTimeout(() => { onCreated(); onClose(); }, 800);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to create post.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-black">Create post</h2>

        <div className="mt-3">
          <label className="text-xs font-semibold text-muted-foreground">Post type</label>
          <select
            className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={postType}
            onChange={e => setPostType(e.target.value as FeedPostType)}
          >
            {postTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <textarea
          className="mt-3 w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] resize-y"
          placeholder="What do you want to share?"
          value={bodyText}
          onChange={e => setBodyText(e.target.value)}
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative">
              {f.file.type.startsWith('video/') ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                  <Film className="h-6 w-6 text-muted-foreground" />
                </div>
              ) : (
                <img src={f.preview} alt="" className="h-16 w-16 rounded-lg object-cover" />
              )}
              <button onClick={() => removeFile(i)} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-bone text-xs shadow">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition">
            <Image className="h-4 w-4" />
            Add media
            <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFilePick} />
          </label>
          <input
            className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Tag (e.g. ANNOUNCEMENT)"
            value={tag}
            onChange={e => setTag(e.target.value.toUpperCase() )}
          />
        </div>

        {status && <p className="mt-3 text-sm text-muted-foreground">{status}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || (!bodyText.trim() && files.length === 0)}>
            {saving ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>
    </div>
  );
}
