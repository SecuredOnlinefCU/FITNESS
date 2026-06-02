'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { messagingApi } from '@/lib/api/modules/messaging';
import type { Thread, Message } from '@/lib/types/domain';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { EmptyState } from '@/components/states/empty-state';
import { Send, Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientMessagesPage() {
  const { user } = useAuth();
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const threads = useAsyncData(() => messagingApi.listThreads(), []);

  useEffect(() => {
    if (threads.data?.items?.length && !selectedThread) {
      setSelectedThread(threads.data.items[0]);
    }
  }, [threads.data, selectedThread]);

  useEffect(() => {
    if (!selectedThread) return;
    setLoadingMessages(true);
    messagingApi.listMessages(selectedThread.id)
      .then(r => setMessages(r.items ?? []))
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoadingMessages(false));
  }, [selectedThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || !selectedThread || sending) return;
    setSending(true);
    try {
      const msg = await messagingApi.sendMessage(selectedThread.id, { bodyText: inputText.trim() });
      setMessages(prev => [...prev, msg]);
      setInputText('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  }

  if (threads.loading) return <div className="space-y-4 p-6"><CardSkeleton /><CardSkeleton /></div>;
  if (threads.error) return <ErrorState message={threads.error} onRetry={() => threads.reload()} />;
  if (!threads.data?.items?.length) return (
    <div className="p-6">
      <div className="mb-4 rounded-xl border border-flow/20 bg-flow/5 p-4 text-sm">
        <p className="font-bold text-flow">Full inbox experience</p>
        <p className="text-muted-foreground mt-1">Use the <strong>Messages</strong> section in the sidebar for the complete chat experience with voice and video messaging.</p>
      </div>
      <EmptyState title="No messages yet" description="Your conversations with your coach will appear here." />
    </div>
  );

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      <div className="border-b border-border px-6 py-3">
        <h1 className="text-lg font-black">Messages</h1>
      </div>
      <div className="border-b border-flow/20 bg-flow/5 px-6 py-2 text-xs text-flow">
        For the full experience with voice and video, use the <strong>Messages</strong> page in the sidebar.
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden w-64 shrink-0 border-r border-border overflow-y-auto sm:block">
          {threads.data.items.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedThread(t)}
              className={`w-full px-4 py-3 text-left text-sm transition hover:bg-muted/50 ${selectedThread?.id === t.id ? 'bg-muted font-bold' : 'text-muted-foreground'}`}
            >
              <p className="truncate">Coach</p>
              <p className="truncate text-xs text-muted-foreground">{t.messages?.[0]?.bodyText ?? 'No messages yet'}</p>
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingMessages ? (
              <div className="flex h-full items-center justify-center"><Loader className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No messages yet. Say hello!</div>
            ) : (
              messages.map(m => {
                const isMe = m.senderUserId === user?.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                      <p>{m.bodyText}</p>
                      <p className={`mt-1 text-[10px] ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-4">
            <input
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:brightness-95 disabled:opacity-50"
              aria-label="Send message"
            >
              {sending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}