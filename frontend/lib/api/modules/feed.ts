import { apiFetch } from '@/lib/api/client';
import type { FeedPost, FeedComment, FeedReaction, FeedSave, ApiList, MomentumData, CoachNudge, PostAnalytics } from '@/lib/types/domain';

type CreatePostInput = {
  scopeType: 'PROGRAM';
  scopeId: string;
  type?: string;
  bodyText?: string;
  tag?: string;
  media?: { assetType: string; storageKey: string; cdnUrl: string; mimeType: string }[];
};

export const feedApi = {
  listProgramPosts(programId: string, type?: string, clientId?: string): Promise<ApiList<FeedPost>> {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (clientId) params.set('clientId', clientId);
    const qs = params.toString();
    return apiFetch(`/api/feed/program/${programId}${qs ? '?' + qs : ''}`);
  },
  getPost(postId: string): Promise<FeedPost> {
    return apiFetch(`/api/feed/posts/${postId}`);
  },
  createPost(input: CreatePostInput): Promise<FeedPost> {
    return apiFetch('/api/feed/posts', { method: 'POST', body: JSON.stringify(input) });
  },
  updatePost(postId: string, input: { bodyText?: string; tag?: string; status?: string }): Promise<FeedPost> {
    return apiFetch(`/api/feed/posts/${postId}`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  deletePost(postId: string): Promise<void> {
    return apiFetch(`/api/feed/posts/${postId}`, { method: 'DELETE' });
  },
  listComments(postId: string): Promise<ApiList<FeedComment>> {
    return apiFetch(`/api/feed/posts/${postId}/comments`);
  },
  addComment(postId: string, bodyText: string): Promise<FeedComment> {
    return apiFetch(`/api/feed/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ bodyText }) });
  },
  upsertReaction(postId: string, reactionType?: string): Promise<FeedReaction> {
    return apiFetch(`/api/feed/posts/${postId}/reactions`, { method: 'POST', body: JSON.stringify({ reactionType: reactionType ?? 'LIKE' }) });
  },
  deleteReaction(postId: string): Promise<void> {
    return apiFetch(`/api/feed/posts/${postId}/reactions`, { method: 'DELETE' });
  },
  savePost(postId: string): Promise<FeedSave> {
    return apiFetch(`/api/feed/posts/${postId}/saves`, { method: 'POST' });
  },
  unsavePost(postId: string): Promise<void> {
    return apiFetch(`/api/feed/posts/${postId}/saves`, { method: 'DELETE' });
  },
  createReport(input: { targetType: string; targetId: string; reasonCode: string; notes?: string }): Promise<void> {
    return apiFetch('/api/feed/reports', { method: 'POST', body: JSON.stringify(input) });
  },
  getMomentum(): Promise<MomentumData> {
    return apiFetch('/api/feed/momentum');
  },
  getNudges(): Promise<ApiList<CoachNudge>> {
    return apiFetch('/api/feed/nudges');
  },
  getPostAnalytics(postId: string): Promise<PostAnalytics> {
    return apiFetch(`/api/feed/posts/${postId}/analytics`);
  },
};
