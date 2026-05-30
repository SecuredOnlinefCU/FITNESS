export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/api/realtime/messages',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;
