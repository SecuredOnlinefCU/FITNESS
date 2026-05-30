# Real-Time Messaging Architecture

## Current implementation
This module implements optimistic sending on the frontend:

1. User writes a message.
2. UI inserts a temporary message immediately.
3. Frontend calls `messagingApi.sendMessage()`.
4. If save succeeds, temporary message is replaced by saved backend message.
5. If save fails, temporary message becomes a failed message state.

## Near-real-time refresh
The existing inbox uses polling. Polling is safer for the first production version and avoids adding socket complexity too early.

## Future true real-time backend path
Add one of these backend capabilities:

### Option A — Server-Sent Events
```txt
GET /api/messaging/threads/:threadId/events
```

### Option B — WebSocket
```txt
WS /api/realtime/messages
```

## Frontend adapter
The file below is intentionally isolated:

```txt
lib/realtime/message-realtime.ts
```

Replace its internals later without rewriting the message UI.
