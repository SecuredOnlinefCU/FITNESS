'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { clientsApi } from '@/lib/api/modules/clients';
import { Mail, Copy, Check, User, UserPlus, Loader2, CheckCircle2, XCircle } from 'lucide-react';

type Step = 'form' | 'success';

export function InviteClientDialog({
  onClose,
  onInvited,
}: {
  onClose: () => void;
  onInvited: () => void;
}) {
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
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
      setStep('success');
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
    onClose();
  }

  const formFields = [
    {
      name: 'email',
      label: 'Email address',
      type: 'email',
      value: email,
      onChange: setEmail,
      placeholder: 'client@example.com',
      required: true,
      icon: <Mail className="h-4 w-4" />,
      helper: 'We will send the invite link to this email',
    },
    {
      name: 'firstName',
      label: 'First name',
      type: 'text',
      value: firstName,
      onChange: setFirstName,
      placeholder: 'John',
      required: true,
      icon: <User className="h-4 w-4" />,
      helper: 'Used to personalize the invite',
    },
    {
      name: 'lastName',
      label: 'Last name',
      type: 'text',
      value: lastName,
      onChange: setLastName,
      placeholder: 'Doe',
      required: false,
      icon: <User className="h-4 w-4" />,
      helper: 'Optional but helps with roster management',
    },
    {
      name: 'phone',
      label: 'Phone number',
      type: 'tel',
      value: phone,
      onChange: setPhone,
      placeholder: '+1 (555) 000-0000',
      required: false,
      icon: <User className="h-4 w-4" />,
      helper: 'Optional — used for SMS reminders if enabled',
    },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        className="w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <h2 className="text-xl font-black tracking-tight">Invite client</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add a new client to your roster. They will receive an email with a secure link to join.
                  </p>
                </div>

                {error && (
                  <motion.div
                    role="alert"
                    className="mb-4 flex items-start gap-3 rounded-2xl border border-pulse/30 bg-pulse/10 p-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-pulse" />
                    <p className="text-sm text-pulse">{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {formFields.map((field) => (
                    <motion.div
                      key={field.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                    >
                      <label className="mb-1.5 flex items-center justify-between text-sm font-semibold text-foreground">
                        <span>{field.label}</span>
                        {field.required && <span className="text-pulse">*</span>}
                      </label>
                      <Input
                        type={field.type}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        icon={field.icon}
                      />
                      <p className="mt-1.5 text-xs text-muted-foreground">{field.helper}</p>
                    </motion.div>
                  ))}

                  <div className="mt-6 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Send invite
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-signal/10">
                    <CheckCircle2 className="h-6 w-6 text-signal" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">Invite sent</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Share this link with {firstName || 'your client'} or let us send it via email.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Invite link
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 truncate rounded-xl bg-background px-4 py-3 text-sm text-foreground">
                      {inviteUrl}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopy}
                      className="shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    The client will receive an email with this link. Once they accept, you will see a pending request in your client list.
                  </p>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={handleDone}>
                    Done
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </motion.div>
    </div>
  );
}
