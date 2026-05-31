import { apiFetch } from '@/lib/api/client';

export async function uploadFile(fileName: string, mimeType: string, data: string) {
  return apiFetch<{ url: string; key: string }>('/api/media/upload', {
    method: 'POST',
    body: JSON.stringify({ fileName, mimeType, data }),
  });
}
