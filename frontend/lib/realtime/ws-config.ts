import { env } from '@/lib/config/env';

export function getRealtimeUrl() {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  return env.apiUrl.replace(/^http/, 'ws').replace(/\/$/, '') + '/api/realtime/messages';
}
