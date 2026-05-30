# Integrated Frontend Status

## Integrated modules
- Frontend foundation
- Frontend API modules
- LevelFITness brand
- Client dashboard
- Coach dashboard
- Media upload + billing UI
- Messaging + notifications UI
- Real data + loading states
- Admin dashboard
- WebSocket messaging client
- Delivery status UI

## WebSocket files
```txt
lib/realtime/ws-config.ts
lib/realtime/message-types.ts
lib/realtime/websocket-client.ts
hooks/messaging/use-websocket-thread.ts
components/messaging/realtime/live-thread-view.tsx
components/messaging/realtime/delivery-status.tsx
components/messaging/realtime/websocket-status-pill.tsx
```

## Backend contract needed
The frontend expects:

```txt
wss://your-railway-api.up.railway.app/api/realtime/messages
```

Client events:
- `auth`
- `thread.join`
- `thread.leave`
- `message.send`
- `message.delivered`
- `message.read`

Server events:
- `connection.ready`
- `auth.ok`
- `auth.error`
- `thread.joined`
- `message.created`
- `message.delivered`
- `message.read`
- `error`
