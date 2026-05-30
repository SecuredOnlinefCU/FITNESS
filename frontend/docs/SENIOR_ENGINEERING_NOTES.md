# Senior Engineering Notes

## Why WebSocket-first with HTTP fallback
WebSockets provide a persistent bidirectional browser/server channel. That is ideal for chat, but the app should not break if a network blocks WebSocket upgrade or the backend socket endpoint is not deployed yet. This package therefore uses WebSocket first and falls back to the existing HTTP message-send API.

## Why not host WebSocket inside Vercel frontend
The WebSocket endpoint should live on Railway with the backend API, not inside Vercel serverless routes. The frontend package only contains the browser client.

## Why delivery statuses matter
Delivery status is a trust feature. Users need to know whether a coaching message is queued, sent, delivered, read, or failed. This is especially important when a coach gives time-sensitive feedback.

## Build verification still required
After merging, run:

```bash
pnpm install
pnpm typecheck
pnpm build
```
