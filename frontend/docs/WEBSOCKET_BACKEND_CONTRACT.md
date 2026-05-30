# WebSocket Backend Contract for LevelFITness

## Endpoint
```txt
GET /api/realtime/messages
```

Use `wss://` in production.

## Client → server events
```ts
{ type: 'auth', accessToken: string }
{ type: 'thread.join', threadId: string }
{ type: 'thread.leave', threadId: string }
{ type: 'message.send', clientMessageId: string, threadId: string, bodyText: string, messageType: 'TEXT' }
{ type: 'message.delivered', messageId: string, threadId: string }
{ type: 'message.read', messageId: string, threadId: string }
```

## Server → client events
```ts
{ type: 'connection.ready', connectionId: string }
{ type: 'auth.ok', userId: string }
{ type: 'auth.error', error: string }
{ type: 'thread.joined', threadId: string }
{ type: 'message.created', threadId: string, message: Message, clientMessageId?: string }
{ type: 'message.delivered', threadId: string, messageId: string, clientMessageId?: string }
{ type: 'message.read', threadId: string, messageId: string }
{ type: 'error', error: string, clientMessageId?: string }
```

## Delivery status semantics
- `queued`: UI has message but socket is not open.
- `sent`: message was sent over WebSocket.
- `delivered`: backend persisted message and confirmed delivery.
- `read`: recipient opened/read the message.
- `failed`: backend or network rejected the message.
