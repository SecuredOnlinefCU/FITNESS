import { apiFetch } from '@/lib/api/client';

export async function getUploadUrl(fileName: string, mimeType: string) {
  const params = new URLSearchParams({ fileName, mimeType });
  return apiFetch<{ uploadUrl: string; publicUrl: string; key: string }>(`/api/media/upload-url?${params}`);
}

export async function uploadFile(file: File) {
  const { uploadUrl, publicUrl, key } = await getUploadUrl(file.name, file.type);
  await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
  return { url: publicUrl, key };
}
