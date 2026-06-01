'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { clientsApi } from '@/lib/api/modules/clients';
import { Mail, Copy, Check } from 'lucide-react';

export function InviteClientDialog({
  onClose,
  onInvited,
}: {
  onClose: () => void;
  onInvited: () => void;
}) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !firstName.trim()) {
      setError('Email and first name are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await clientsApi.inviteClient({
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setInviteUrl(result.acceptUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDone() {
    onInvited();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {!inviteUrl ? (
          <>
            <h2 className="text-lg font-black">Invite client</h2>
            <p className="mt-1 text-sm text-muted-foreground">Send an invite link to add a client to your roster.</p>

            {error && (
              <div role="alert" className="mt-3 rounded-2xl border border-pulse/20 bg-pulse/10 px-4 py-3 text-sm text-pulse">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-bold text-foreground">Email *</label>
                <input
                  type="email"
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                  placeholder="client@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-bold text-foreground">First name *</label>
                  <input
                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-foreground">Last name</label>
                  <input
                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send invite'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <Mail className="h-5 w-5 text-success" />
              </div>
              <div>
                <h2 className="text-lg font-black">Invite sent</h2>
                <p className="text-sm text-muted-foreground">Share this link with your client.</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-muted p-3">
              <input
                className="flex-1 bg-transparent text-sm text-foreground"
                value={inviteUrl}
                readOnly
              />
              <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground">
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              The client will receive an email with this link. Once they accept, you&apos;ll see a pending request in your client list.
            </p>

            <div className="mt-5 flex justify-end">
              <Button onClick={handleDone}>Done</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
