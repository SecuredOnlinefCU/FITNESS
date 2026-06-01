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

export async function uploadToSharepoint(file: File): Promise<{ url: string }> {
  const reader = new FileReader();
  const base64 = await new Promise<string>((resolve, reject) => {
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  return apiFetch<{ webUrl: string }>('/api/media/upload-sharepoint', {
    method: 'POST',
    body: JSON.stringify({ fileName: file.name, mimeType: file.type, data: base64 }),
  }).then(r => ({ url: r.webUrl }));
}
