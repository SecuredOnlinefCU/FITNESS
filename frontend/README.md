# LevelFITness Integrated Frontend + WebSocket Messaging Package

This is the integrated **LevelFITness** frontend package.

It combines the previous frontend modules into one Next.js/Vercel-ready repo and adds:

- WebSocket client support for messaging
- optimistic message sending
- real-time message delivery status
- HTTP fallback when WebSocket is unavailable
- admin dashboard module
- client dashboard module
- coach dashboard module
- media upload and billing UI
- loading/empty/error states
- notifications and unread badges

## Run locally
```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## Required env
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000/api/realtime/messages
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Production env on Vercel
```env
NEXT_PUBLIC_API_URL=https://your-railway-api.up.railway.app
NEXT_PUBLIC_WS_URL=wss://your-railway-api.up.railway.app/api/realtime/messages
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
```

## Honest status
The frontend now has WebSocket-first messaging support, but the Railway backend must expose a compatible WebSocket endpoint for true live delivery. Until that endpoint exists, the UI still works through optimistic sending and HTTP fallback.
