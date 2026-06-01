export type MessageDeliveryStatus = 'queued' | 'connecting' | 'sent' | 'delivered' | 'read' | 'failed';

export type ClientRealtimeEvent =
  | { type: 'auth'; accessToken: string }
  | { type: 'thread.join'; threadId: string }
  | { type: 'thread.leave'; threadId: string }
  | { type: 'message.send'; clientMessageId: string; threadId: string; bodyText?: string; messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE'; mediaAssetId?: string; durationMs?: number }
  | { type: 'message.delivered'; messageId: string; threadId: string }
  | { type: 'message.read'; messageId: string; threadId: string };

export type ServerRealtimeEvent =
  | { type: 'connection.ready'; connectionId?: string }
  | { type: 'auth.ok'; userId: string }
  | { type: 'auth.error'; error: string }
  | { type: 'thread.joined'; threadId: string }
  | { type: 'message.created'; threadId: string; message: any; clientMessageId?: string }
  | { type: 'message.delivered'; threadId: string; messageId: string; clientMessageId?: string }
  | { type: 'message.read'; threadId: string; messageId: string }
  | { type: 'error'; error: string; clientMessageId?: string };
