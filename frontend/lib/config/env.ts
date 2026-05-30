const clean = (v: string | undefined, fallback: string) => (v || fallback).trim().replace(/\/+$/, '');

export const env = {
  apiUrl: clean(process.env.NEXT_PUBLIC_API_URL, 'http://localhost:4000'),
  wsUrl: clean(process.env.NEXT_PUBLIC_WS_URL, 'ws://localhost:4000/api/realtime/messages'),
  appUrl: clean(process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000'),
} as const;
