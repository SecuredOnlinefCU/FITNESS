'use client';

import { getAccessToken } from '@/lib/auth/token-storage';
import { getRealtimeUrl } from './ws-config';
import type { ClientRealtimeEvent, ServerRealtimeEvent } from './message-types';

type Listener = (event: ServerRealtimeEvent) => void;
type StatusListener = (status: RealtimeConnectionStatus) => void;

export type RealtimeConnectionStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error';

export class LevelFitnessRealtimeClient {
  private socket: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private statusListeners = new Set<StatusListener>();
  private queue: ClientRealtimeEvent[] = [];
  private reconnectTimer: number | null = null;
  private reconnectAttempt = 0;
  private manualClose = false;

  constructor(private url = getRealtimeUrl()) {}

  get readyState() {
    return this.socket?.readyState ?? WebSocket.CLOSED;
  }

  connect() {
    if (typeof window === 'undefined') return;
    if (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) return;

    this.manualClose = false;
    this.emitStatus('connecting');
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      this.reconnectAttempt = 0;
      this.emitStatus('open');
      const accessToken = getAccessToken();
      if (accessToken) this.send({ type: 'auth', accessToken });
      this.flushQueue();
    };

    this.socket.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as ServerRealtimeEvent;
        this.listeners.forEach((listener) => listener(event));
      } catch {
        this.listeners.forEach((listener) => listener({ type: 'error', error: 'Invalid realtime message payload' }));
      }
    };

    this.socket.onerror = () => {
      this.emitStatus('error');
    };

    this.socket.onclose = () => {
      this.emitStatus('closed');
      if (!this.manualClose) this.scheduleReconnect();
    };
  }

  close() {
    this.manualClose = true;
    if (this.reconnectTimer) window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.socket?.close(1000, 'Client closed');
    this.socket = null;
    this.emitStatus('closed');
  }

  onMessage(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onStatus(listener: StatusListener) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  send(event: ClientRealtimeEvent) {
    const payload = JSON.stringify(event);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(payload);
      return true;
    }
    this.queue.push(event);
    this.connect();
    return false;
  }

  private flushQueue() {
    const pending = [...this.queue];
    this.queue = [];
    for (const event of pending) this.send(event);
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempt, 15000);
    this.reconnectAttempt += 1;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private emitStatus(status: RealtimeConnectionStatus) {
    this.statusListeners.forEach((listener) => listener(status));
  }
}

let singleton: LevelFitnessRealtimeClient | null = null;

export function getRealtimeClient() {
  if (!singleton) singleton = new LevelFitnessRealtimeClient();
  return singleton;
}
